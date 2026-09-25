import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

function parseDate(v: unknown): Date | null {
  if (!v || typeof v !== "string") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// GET /api/projects/[id] — project with tasks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "projects.view");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, company: true } },
        tasks: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e) {
    console.error("GET /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}

// PATCH /api/projects/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "projects.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const f of ["name", "code", "description", "managerName", "status", "priority", "notes"]) {
      if (body[f] !== undefined) data[f] = body[f] === "" ? null : body[f];
    }
    if (body.clientId !== undefined) data.clientId = body.clientId || null;
    if (body.progress !== undefined) data.progress = Math.min(100, Math.max(0, Number(body.progress) || 0));
    for (const f of ["budget", "actualCost", "revenue"]) {
      if (body[f] !== undefined) data[f] = body[f] === "" ? null : Number(body[f]);
    }
    for (const f of ["startDate", "deadline"]) {
      if (body[f] !== undefined) data[f] = parseDate(body[f]);
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "project.update",
      module: "projects",
      details: `Updated project ${project.name} — ${Object.keys(data).join(", ")}`,
    });

    return NextResponse.json({ project });
  } catch (e) {
    console.error("PATCH /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "projects.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const project = await prisma.project.delete({ where: { id } });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "project.delete",
      module: "projects",
      details: `Deleted project ${project.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/projects/[id] error", e);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
