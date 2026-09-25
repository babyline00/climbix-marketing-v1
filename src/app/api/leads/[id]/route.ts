import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LeadAction, LeadStatus } from "@prisma/client";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { runLeadWorkflows } from "@/lib/workflow-engine";

// PATCH /api/leads/[id] — update lead action/status/assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      action, actionNote, status, assignedTo,
      campaign, tags, estimatedValue, expectedCloseAt, clientId, source,
    } = body || {};

    const before = await db.lead.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (action !== undefined) {
      data.action = action as LeadAction;
      data.actionAt = new Date();
    }
    if (actionNote !== undefined) data.actionNote = actionNote;
    if (status !== undefined) data.status = status as LeadStatus;
    if (assignedTo !== undefined) data.assignedTo = assignedTo || null;
    if (campaign !== undefined) data.campaign = campaign || null;
    if (tags !== undefined) data.tags = tags || null;
    if (source !== undefined) data.source = source || null;
    if (clientId !== undefined) data.clientId = clientId || null;
    if (estimatedValue !== undefined) {
      data.estimatedValue = estimatedValue === "" || estimatedValue === null ? null : Number(estimatedValue);
    }
    if (expectedCloseAt !== undefined) {
      data.expectedCloseAt = expectedCloseAt ? new Date(expectedCloseAt) : null;
    }

    const lead = await db.lead.update({
      where: { id },
      data,
    });

    // Notifications + audit for assignment
    if (assignedTo !== undefined && assignedTo && assignedTo !== before.assignedTo) {
      await db.notification.create({
        data: {
          type: "lead_assigned",
          title: "Lead assigned",
          message: `${lead.name ?? lead.email} was assigned to ${assignedTo}`,
          href: "#admin",
        },
      });
    }

    // Notification when a lead is won
    if (status === "CONVERTED" && before.status !== "CONVERTED") {
      await db.notification.create({
        data: {
          type: "lead_converted",
          title: "Lead converted 🎉",
          message: `${lead.name ?? lead.email} moved to CONVERTED`,
          href: "#admin",
        },
      });
    }

    // Event-driven automations: status/assignment changes execute immediately after persistence.
    try {
      if (status !== undefined && status !== before.status) await runLeadWorkflows({ trigger: "lead.status_changed", leadId: lead.id, actor: session.user.id });
      if (assignedTo !== undefined && assignedTo !== before.assignedTo) await runLeadWorkflows({ trigger: "lead.assigned", leadId: lead.id, actor: session.user.id });
    } catch (workflowErr) { console.error("lead workflow execution failed", workflowErr); }

    // Status change audit entry
    if (status !== undefined && status !== before.status) {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        action: "lead.status",
        module: "leads",
        details: `${lead.name ?? lead.email}: ${before.status} → ${status}`,
      });
    }
    if (assignedTo !== undefined && assignedTo !== before.assignedTo) {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        action: "lead.assign",
        module: "leads",
        details: `${lead.name ?? lead.email} assigned to ${assignedTo || "nobody"}`,
      });
    }

    return NextResponse.json({ lead });
  } catch (e) {
    console.error("PATCH /api/leads/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(_req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const lead = await db.lead.delete({ where: { id } });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "lead.delete",
      module: "leads",
      details: `Deleted lead ${lead.name ?? lead.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/leads/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
