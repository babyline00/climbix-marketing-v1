import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// PATCH /api/followups/[id] — record result / mark done / reschedule
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.done !== undefined) {
      data.done = Boolean(body.done);
      if (body.done) data.result = body.result || "Completed";
    }
    if (body.result !== undefined) data.result = body.result;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.type !== undefined) data.type = body.type;
    if (body.scheduledAt !== undefined) {
      const d = new Date(body.scheduledAt);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      data.scheduledAt = d;
    }
    if (body.nextAt !== undefined) data.nextAt = body.nextAt ? new Date(body.nextAt) : null;

    const followUp = await prisma.followUp.update({
      where: { id },
      data,
      include: { lead: { select: { id: true, name: true, email: true } } },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "followup.update",
      module: "leads",
      details: `Follow-up ${data.done ? "completed" : "updated"} for ${followUp.lead.name ?? followUp.lead.email}`,
    });

    return NextResponse.json({ followUp });
  } catch (e) {
    console.error("PATCH /api/followups/[id] error", e);
    return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 });
  }
}

// DELETE /api/followups/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    await prisma.followUp.delete({ where: { id } });
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "followup.delete",
      module: "leads",
      details: "Deleted follow-up",
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/followups/[id] error", e);
    return NextResponse.json({ error: "Failed to delete follow-up" }, { status: 500 });
  }
}
