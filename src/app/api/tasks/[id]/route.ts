import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// PATCH /api/tasks/[id] — status moves (kanban), edits
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
    for (const f of ["title", "description", "assigneeName", "status", "priority"]) {
      if (body[f] !== undefined) data[f] = body[f] === "" ? null : body[f];
    }
    if (body.projectId !== undefined) data.projectId = body.projectId || null;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.estimatedHours !== undefined) data.estimatedHours = body.estimatedHours === "" ? null : Number(body.estimatedHours);
    if (body.actualHours !== undefined) data.actualHours = body.actualHours === "" ? null : Number(body.actualHours);
    // Auto completion date is implicit via updatedAt; keep status authoritative

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { project: { select: { id: true, name: true } } },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "task.update",
      module: "projects",
      details: `Updated task "${task.title}"${data.status ? ` → ${String(data.status)}` : ""}`,
    });

    return NextResponse.json({ task });
  } catch (e) {
    console.error("PATCH /api/tasks/[id] error", e);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "projects.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const task = await prisma.task.delete({ where: { id } });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "task.delete",
      module: "projects",
      details: `Deleted task "${task.title}"`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/tasks/[id] error", e);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
