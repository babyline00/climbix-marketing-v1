import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

function parseDate(v: unknown): Date | null {
  if (!v || typeof v !== "string") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function parseMoney(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

// GET /api/projects — search + filter + pagination
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "projects.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") ?? 20) || 20));
    const q = (searchParams.get("q") ?? "").trim();
    const status = searchParams.get("status") ?? "all";

    const where = {
      ...(status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { code: { contains: q } },
              { client: { is: { name: { contains: q } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          client: { select: { id: true, name: true, company: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((p) => ({ ...p, taskCount: p._count.tasks, _count: undefined })),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e) {
    console.error("GET /api/projects error", e);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "projects.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        code: body.code || null,
        description: body.description || null,
        clientId: body.clientId || null,
        managerName: body.managerName || null,
        status: body.status || "planning",
        priority: body.priority || "medium",
        progress: Math.min(100, Math.max(0, Number(body.progress ?? 0) || 0)),
        budget: parseMoney(body.budget),
        actualCost: parseMoney(body.actualCost),
        revenue: parseMoney(body.revenue),
        startDate: parseDate(body.startDate),
        deadline: parseDate(body.deadline),
        notes: body.notes || null,
      },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "project.create",
      module: "projects",
      details: `Created project ${project.name}`,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (e) {
    console.error("POST /api/projects error", e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
