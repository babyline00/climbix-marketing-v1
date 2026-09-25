import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/followups — grouped by today / overdue / upcoming / done + filters
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "leads.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const include = { lead: { select: { id: true, name: true, email: true, company: true, status: true } } };

    const [today, overdue, upcoming, done] = await Promise.all([
      prisma.followUp.findMany({
        where: { done: false, scheduledAt: { gte: todayStart, lt: todayEnd } },
        orderBy: { scheduledAt: "asc" },
        include,
      }),
      prisma.followUp.findMany({
        where: { done: false, scheduledAt: { lt: todayStart } },
        orderBy: { scheduledAt: "asc" },
        include,
      }),
      prisma.followUp.findMany({
        where: { done: false, scheduledAt: { gte: todayEnd } },
        orderBy: { scheduledAt: "asc" },
        take: 30,
        include,
      }),
      prisma.followUp.findMany({
        where: { done: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include,
      }),
    ]);

    return NextResponse.json({ today, overdue, upcoming, done });
  } catch (e) {
    console.error("GET /api/followups error", e);
    return NextResponse.json({ error: "Failed to load follow-ups" }, { status: 500 });
  }
}

// POST /api/followups — schedule a follow-up for a lead
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const leadId = String(body.leadId ?? "");
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    if (!leadId || !scheduledAt || isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { error: "Lead and a valid follow-up date are required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        staffName: body.staffName || session.user.name,
        type: body.type || "call",
        scheduledAt,
        notes: body.notes || null,
        nextAt: body.nextAt ? new Date(body.nextAt) : null,
      },
      include: { lead: { select: { id: true, name: true, email: true } } },
    });

    // Set the lead to FOLLOW_UP status if it is still NEW
    if (lead.status === "NEW") {
      await prisma.lead.update({ where: { id: leadId }, data: { status: "FOLLOW_UP" } });
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "followup.create",
      module: "leads",
      details: `Scheduled ${followUp.type} follow-up for ${lead.name ?? lead.email}`,
    });

    return NextResponse.json({ followUp }, { status: 201 });
  } catch (e) {
    console.error("POST /api/followups error", e);
    return NextResponse.json({ error: "Failed to schedule follow-up" }, { status: 500 });
  }
}
