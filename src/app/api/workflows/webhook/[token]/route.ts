import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db-alias";
import { runLeadWorkflows } from "@/lib/workflow-engine";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const workflow = await prisma.workflow.findFirst({ where: { webhookSecret: token, isActive: true, trigger: "webhook.received" } });
  if (!workflow) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  const raw = await req.text();
  if (raw.length > 1024 * 1024) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  let body: Record<string, unknown> = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const leadId = typeof body.leadId === "string" ? body.leadId : undefined;
  if (!leadId) return NextResponse.json({ accepted: true, workflowId: workflow.id, note: "Webhook received; workflows without a leadId require a generic event worker." }, { status: 202 });
  const result = await runLeadWorkflows({ trigger: "webhook.received", leadId, workflowId: workflow.id });
  const requestId = crypto.randomUUID();
  return NextResponse.json({ accepted: true, requestId, result });
}
