import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db-alias";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { validateWorkflow } from "@/lib/workflow-engine";
import crypto from "node:crypto";

export const runtime = "nodejs";

function json(raw: string, fallback: unknown) { try { return JSON.parse(raw); } catch { return fallback; } }
function safeWorkflow(w: any) { const { webhookSecret, ...rest } = w; return { ...rest, nodes: json(w.nodes, []), edges: json(w.edges, []) }; }

export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "automation.view");
  if (isResponse(session)) return session;
  try {
    const workflows = await prisma.workflow.findMany({ orderBy: { updatedAt: "desc" } });
    const runs = await prisma.workflowRun.findMany({ orderBy: { startedAt: "desc" }, take: 30 });
    const staff = await prisma.user.findMany({ where: { isActive: true }, select: { name: true, email: true, role: true }, orderBy: { name: "asc" } });
    return NextResponse.json({ workflows: workflows.map(safeWorkflow), runs, staff });
  } catch (e) {
    console.error("GET /api/workflows", e);
    return NextResponse.json({ error: "Failed to load workflows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "automation.manage");
  if (isResponse(session)) return session;
  try {
    const body = await req.json();
    const name = String(body.name ?? "Untitled workflow").trim();
    const trigger = String(body.trigger ?? "lead.created");
    const nodes = Array.isArray(body.nodes) ? body.nodes : [];
    const edges = Array.isArray(body.edges) ? body.edges : [];
    if (!name || nodes.length === 0) return NextResponse.json({ error: "Workflow name and at least one node are required" }, { status: 400 });
    const validation = validateWorkflow(nodes, edges, trigger);
    if (!validation.valid) return NextResponse.json({ error: "Invalid workflow", details: validation.errors }, { status: 400 });
    const workflow = await prisma.workflow.create({ data: { name, description: body.description ? String(body.description) : null, trigger, nodes: JSON.stringify(nodes), edges: JSON.stringify(edges), isActive: body.isActive !== false, createdBy: session.user.id, webhookSecret: trigger === "webhook.received" ? crypto.randomBytes(32).toString("hex") : null } });
    await logActivity({ userId: session.user.id, userName: session.user.name, action: "workflow.create", module: "automation", details: `Created workflow ${name}` });
    return NextResponse.json({ workflow: safeWorkflow(workflow), webhookSecret: workflow.webhookSecret ?? null }, { status: 201 });
  } catch (e) {
    console.error("POST /api/workflows", e);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
