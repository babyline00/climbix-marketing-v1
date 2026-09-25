import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, leadNotificationEmail, auditCompleteEmail } from "@/lib/email";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { isResponse, requirePermission } from "@/lib/auth";
import { runLeadWorkflows } from "@/lib/workflow-engine";
import { fireServerEvents } from "@/lib/server-tracking";
import { sendLeadAlerts } from "@/lib/alerts";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// GET /api/leads — list all leads (admin)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "leads.view");
  if (isResponse(session)) return session;

  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { meetings: true },
    });
    return NextResponse.json({ leads });
  } catch (e) {
    console.error("GET /api/leads error", e);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST /api/leads — create a new lead (public, from forms)
export async function POST(req: NextRequest) {
  // Public endpoint — throttle per client to prevent form spam/flooding.
  const lim = rateLimit(clientKey(req, "leads"), 6, 60_000);
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
      website,
      phone,
      service,
      goal,
      message,
      source,
      auditScore,
      auditData,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body || {};

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Calculate lead score
    const { score: leadScore, tier: leadTier } = calculateLeadScore({
      name, email, company, website, phone, service, goal, message, source, auditScore,
    });

    const lead = await db.lead.create({
      data: {
        name: name || null,
        email,
        company: company || null,
        website: website || null,
        phone: phone || null,
        service: service || null,
        goal: goal || null,
        message: message || null,
        source: source || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        auditScore: auditScore ?? null,
        auditData: auditData ? JSON.stringify(auditData) : null,
        leadScore,
        leadTier,
      },
    });

    console.log(`[Lead Scoring] New lead: ${email} — Score: ${leadScore} — Tier: ${leadTier}`);

    // Event-driven automations execute immediately after persistence. Failures are isolated from lead creation.
    try { await runLeadWorkflows({ trigger: "lead.created", leadId: lead.id }); } catch (workflowErr) { console.error("lead.created workflow failed", workflowErr); }

    // In-app notification for the admin notification center
    try {
      await db.notification.create({
        data: {
          type: "lead_new",
          title: "New lead received",
          message: `${name || email}${company ? ` — ${company}` : ""} · source: ${source || "unknown"} · score ${leadScore}`,
          href: "#admin",
        },
      });
    } catch (nErr) {
      console.error("notification create failed", nErr);
    }

    // Send emails (fire and forget)
    try {
      // Send audit completion email to lead if from free audit
      if (source === "free-audit" && auditScore) {
        const auditEmail = auditCompleteEmail(
          name || company || "",
          email,
          website || "",
          auditScore
        );
        await sendEmail({
          to: email,
          subject: auditEmail.subject,
          body: auditEmail.body,
          type: "audit_complete",
          leadId: lead.id,
        });
      }

      // Send notification to admin
      const notification = leadNotificationEmail(
        name || "",
        email,
        company || "",
        website || "",
        service || "",
        goal || "",
        source || "unknown"
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

    // Server-side conversion events (Meta CAPI + GA4 MP) and channel alerts — fire and forget
    try {
      await Promise.allSettled([
        fireServerEvents({
          id: lead.id,
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          company: lead.company,
          source: lead.source,
          service: lead.service,
        }),
        sendLeadAlerts({
          name: name || "",
          email,
          phone: phone || null,
          company: company || null,
          website: website || null,
          service: service || null,
          goal: goal || null,
          source: source || "unknown",
          leadScore: lead.leadScore,
          leadTier: lead.leadTier,
          message: message || null,
          url: "https://climbixmarketing.com/admin",
        }),
      ]);
    } catch (trackingErr) {
      console.error("Server tracking / alerts failed:", trackingErr);
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (e) {
    console.error("POST /api/leads error", e);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
