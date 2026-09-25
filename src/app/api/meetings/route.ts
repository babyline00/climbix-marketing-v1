import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { sendEmail, meetingConfirmationEmail, leadNotificationEmail } from "@/lib/email";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { isResponse, requirePermission } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// GET /api/meetings — list all meetings (admin)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "meetings.view");
  if (isResponse(session)) return session;

  try {
    const meetings = await db.meeting.findMany({
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    });
    return NextResponse.json({ meetings });
  } catch (e) {
    console.error("GET /api/meetings error", e);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST /api/meetings — schedule a new meeting (public, from scheduler)
export async function POST(req: NextRequest) {
  // Public endpoint — throttle per client to prevent form flooding/spam.
  const lim = rateLimit(clientKey(req, "meetings"), 5, 60_000);
  if (!lim.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again.", retryAfter: lim.retryAfterSec },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      email,
      company,
      service,
      date,
      time,
      timezone,
      notes,
      website,
      goal,
      source: leadSource,
    } = body || {};

    // Lead source attribution (hero form, popup, footer, etc.)
    const source = leadSource || "meeting-scheduler";

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // Find or create the lead by email
    let lead = await db.lead.findUnique({ where: { email } });

    // Calculate lead score
    const { score: leadScore, tier: leadTier } = calculateLeadScore({
      name,
      email,
      company,
      website,
      service,
      goal,
      source,
    });

    if (lead) {
      lead = await db.lead.update({
        where: { id: lead.id },
        data: {
          name,
          company: company || null,
          website: website || null,
          goal: goal || null,
          service: service || null,
          status: LeadStatus.IN_PROGRESS,
          leadScore,
          leadTier,
        },
      });
    } else {
      lead = await db.lead.create({
        data: {
          name,
          email,
          company: company || null,
          website: website || null,
          goal: goal || null,
          service: service || null,
          source,
          status: LeadStatus.IN_PROGRESS,
          leadScore,
          leadTier,
        },
      });
    }

    console.log(`[Lead Scoring] Meeting booked: ${email} — Score: ${leadScore} — Tier: ${leadTier}`);

    const meeting = await db.meeting.create({
      data: {
        leadId: lead.id,
        name,
        email,
        company: company || null,
        service: service || null,
        date,
        time,
        timezone: timezone || "UTC",
        notes: notes || null,
      },
    });

    // Send confirmation email to client (fire and forget)
    try {
      const confirmation = meetingConfirmationEmail(
        name,
        email,
        date,
        time,
        timezone || "UTC",
        service || "General Strategy Call"
      );
      await sendEmail({
        to: email,
        subject: confirmation.subject,
        body: confirmation.body,
        type: "meeting_confirmation",
        leadId: lead.id,
      });

      // Send notification to admin
      const notification = leadNotificationEmail(
        name,
        email,
        company || "",
        website || "",
        service || "",
        goal || "",
        source
      );
      await sendEmail({
        to: "admin@climbixmarketing.com",
        subject: notification.subject,
        body: notification.body,
        type: "lead_notification",
        leadId: lead.id,
      });
    } catch (emailErr) {
      console.error("Failed to send emails:", emailErr);
    }

    return NextResponse.json({ meeting, lead }, { status: 201 });
  } catch (e) {
    console.error("POST /api/meetings error", e);
    return NextResponse.json(
      { error: "Failed to schedule meeting" },
      { status: 500 }
    );
  }
}
