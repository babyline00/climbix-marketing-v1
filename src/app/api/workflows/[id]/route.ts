import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db-alias";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { runLeadWorkflows, validateWorkflow } from "@/lib/workflow-engine";

export const runtime = "nodejs";
const parse = (v: string) => { try { return JSON.parse(v); } catch { return []; } };
const safe = (w: any) => { const { webhookSecret, ...rest } = w; return { ...rest, nodes: parse(w.nodes), edges: parse(w.edges) }; };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "automation.view"); if (isResponse(session)) return session;
  const { id } = await params;
  const workflow = await prisma.workflow.findUnique({ where: { id } });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  return NextResponse.json({ workflow: safe(workflow) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "automation.manage"); if (isResponse(session)) return session;
  const { id } = await params;
  try {
    const workflow = await prisma.workflow.findUnique({ where: { id } });
    if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description) : null;
    if (body.trigger !== undefined) data.trigger = String(body.trigger);
    if (Array.isArray(body.nodes)) data.nodes = JSON.stringify(body.nodes);
    if (Array.isArray(body.edges)) data.edges = JSON.stringify(body.edges);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.regenerateWebhook === true) data.webhookSecret = crypto.randomBytes(32).toString("hex");
    const nextTrigger = body.trigger !== undefined ? String(body.trigger) : workflow.trigger;
    const nextNodes = Array.isArray(body.nodes) ? body.nodes : parse(workflow.nodes);
    const nextEdges = Array.isArray(body.edges) ? body.edges : parse(workflow.edges);
    const validation = validateWorkflow(nextNodes, nextEdges, nextTrigger);
    if (!validation.valid) return NextResponse.json({ error: "Invalid workflow", details: validation.errors }, { status: 400 });
    data.version = { increment: 1 };
    const updatedWorkflow = await prisma.workflow.update({ where: { id }, data });
    await logActivity({ userId: session.user.id, userName: session.user.name, action: "workflow.update", module: "automation", details: `Updated workflow ${updatedWorkflow.name}` });
    return NextResponse.json({ workflow: safe(updatedWorkflow) });
  } catch (e) {
    console.error("PATCH /api/workflows", e);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "automation.manage"); if (isResponse(session)) return session;
  const { id } = await params;
  try {
    const workflow = await prisma.workflow.delete({ where: { id } });
    await logActivity({ userId: session.user.id, userName: session.user.name, action: "workflow.delete", module: "automation", details: `Deleted workflow ${workflow.name}` });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/workflows", e);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "automation.manage"); if (isResponse(session)) return session;
  const { id } = await params;
  try {
    const body = await req.json();
    const leadId = String(body.leadId ?? "");
    const workflow = await prisma.workflow.findUnique({ where: { id } });
    if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    if (!leadId) return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const result = await runLeadWorkflows({ trigger: workflow.trigger, leadId, actor: session.user.id, workflowId: workflow.id });
    return NextResponse.json({ result });
  } catch (e) {
    console.error("POST /api/workflows/[id]", e);
    return NextResponse.json({ error: "Workflow test failed" }, { status: 500 });
  }
}
