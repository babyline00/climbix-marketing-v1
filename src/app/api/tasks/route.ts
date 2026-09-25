import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/tasks — filter by status/project; server-side pagination
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "projects.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") ?? 50) || 50));
    const status = searchParams.get("status") ?? "all";
    const projectId = searchParams.get("projectId");
    const q = (searchParams.get("q") ?? "").trim();

    const where = {
      ...(status !== "all" ? { status } : {}),
      ...(projectId ? { projectId } : {}),
      ...(q ? { title: { contains: q } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e) {
    console.error("GET /api/tasks error", e);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "projects.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: body.description || null,
        projectId: body.projectId || null,
        assigneeName: body.assigneeName || null,
        status: body.status || "todo",
        priority: body.priority || "medium",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours ? Number(body.estimatedHours) : null,
      },
      include: { project: { select: { id: true, name: true } } },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "task.create",
      module: "projects",
      details: `Created task "${task.title}"`,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error", e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
