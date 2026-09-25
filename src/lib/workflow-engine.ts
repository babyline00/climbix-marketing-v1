import "server-only";
import { prisma } from "@/lib/db-alias";
import { LeadStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import crypto from "node:crypto";

export type WorkflowNode = {
  id: string;
  type: "trigger" | "condition" | "action";
  x: number;
  y: number;
  data: Record<string, unknown>;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  condition?: "true" | "false";
};

export type WorkflowEvent = {
  trigger: string;
  leadId?: string;
  actor?: string;
  workflowId?: string;
};

const get = (lead: Record<string, unknown>, path: string) =>
  path.split(".").reduce<unknown>((v, key) => (v && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined), lead);

function parse<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function matches(condition: Record<string, unknown>, lead: Record<string, unknown>) {
  const field = String(condition.field ?? "");
  const op = String(condition.operator ?? "equals");
  const expected = condition.value;
  const actual = get(lead, field);
  const a = actual == null ? "" : String(actual).toLowerCase();
  const b = expected == null ? "" : String(expected).toLowerCase();
  switch (op) {
    case "not_equals": return a !== b;
    case "contains": return a.includes(b);
    case "starts_with": return a.startsWith(b);
    case "greater_than": return Number(actual) > Number(expected);
    case "less_than": return Number(actual) < Number(expected);
    case "exists": return actual !== undefined && actual !== null && a !== "";
    case "equals":
    default: return a === b;
  }
}

async function addTag(leadId: string, tag: string) {
  if (!tag) return;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { tags: true } });
  if (!lead) return;
  const tags = new Set((lead.tags ?? "").split(",").map((x) => x.trim()).filter(Boolean));
  tags.add(tag);
  await prisma.lead.update({ where: { id: leadId }, data: { tags: [...tags].join(", ") } });
}

async function executeAction(node: WorkflowNode, leadId: string) {
  const action = String(node.data.action ?? "");
  const value = String(node.data.value ?? "");
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  switch (action) {
    case "assign_round_robin": {
      const users = await prisma.user.findMany({
        where: { isActive: true, role: { not: "VIEWER" } },
        select: { id: true, name: true, email: true },
        orderBy: { createdAt: "asc" },
      });
      if (!users.length) throw new Error("No active staff available");
      const recent = await prisma.lead.findMany({ where: { assignedTo: { not: null } }, orderBy: { updatedAt: "desc" }, take: 50, select: { assignedTo: true } });
      const counts = new Map(users.map((u) => [u.email, 0]));
      for (const r of recent) if (r.assignedTo && counts.has(r.assignedTo)) counts.set(r.assignedTo, (counts.get(r.assignedTo) ?? 0) + 1);
      const assignee = [...users].sort((a, b) => (counts.get(a.email)! - counts.get(b.email)!))[0];
      await prisma.lead.update({ where: { id: leadId }, data: { assignedTo: assignee.email } });
      await prisma.notification.create({ data: { type: "lead_assigned", title: "Lead auto-assigned", message: `${lead.name ?? lead.email} was assigned to ${assignee.name}`, href: "#admin" } });
      return `Assigned to ${assignee.name} (${assignee.email})`;
    }
    case "assign_staff": {
      if (!value) throw new Error("Staff email is required");
      const staff = await prisma.user.findUnique({ where: { email: value }, select: { name: true, email: true, isActive: true } });
      if (!staff?.isActive) throw new Error("Selected staff member is inactive or missing");
      await prisma.lead.update({ where: { id: leadId }, data: { assignedTo: staff.email } });
      return `Assigned to ${staff.name} (${staff.email})`;
    }
    case "set_status":
      await prisma.lead.update({ where: { id: leadId }, data: { status: value as LeadStatus } });
      return `Status set to ${value}`;
    case "add_tag":
      await addTag(leadId, value);
      return `Added tag ${value}`;
    case "create_followup": {
      const minutes = Math.max(5, Number(node.data.minutes ?? 1440));
      await prisma.followUp.create({ data: { leadId, staffName: lead.assignedTo ?? undefined, type: String(node.data.type ?? "call"), scheduledAt: new Date(Date.now() + minutes * 60_000), notes: value || "Created by workflow" } });
      return `Follow-up scheduled in ${minutes} minutes`;
    }
    case "notify":
      await prisma.notification.create({ data: { type: "system", title: String(node.data.title ?? "Workflow notification"), message: String(node.data.message ?? `${lead.name ?? lead.email} matched a workflow`), href: "#admin" } });
      return "Notification created";
    case "webhook": {
      const url = String(node.data.url ?? "").trim();
      if (!/^https?:\/\//i.test(url)) throw new Error("Webhook URL must start with http:// or https://");
      const parsedUrl = new URL(url);
      const blocked = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|::1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})$/i.test(parsedUrl.hostname);
      if (blocked) throw new Error("Webhook URL targets a private or local address");
      if (parsedUrl.username || parsedUrl.password) throw new Error("Webhook URL credentials are not allowed");
      const payload = { event: "workflow.action", workflowNode: node.id, lead };
      const headers: Record<string,string> = { "content-type": "application/json", "user-agent": "Climbix-Workflow/1.0" };
      const secret = String(node.data.secret ?? "");
      if (secret) headers["x-climbix-signature"] = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: controller.signal, redirect: "error" });
        if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
      } finally { clearTimeout(timer); }
      return `Webhook delivered to ${url}`;
    }
    case "send_email": {
      if (!lead.email) throw new Error("Lead has no email");
      await sendEmail({ to: lead.email, subject: String(node.data.subject ?? "A message from Climbix Marketing"), body: String(node.data.body ?? "Hello!"), type: "workflow", leadId });
      return `Email sent to ${lead.email}`;
    }
    default: throw new Error(`Unknown workflow action: ${action}`);
  }
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[], trigger: string) {
  const errors: string[] = [];
  if (!nodes.length) errors.push("Workflow must contain at least one node");
  const ids = new Set<string>();
  for (const n of nodes) {
    if (!n.id || ids.has(n.id)) errors.push(`Duplicate or missing node id: ${n.id || "unknown"}`);
    ids.add(n.id);
    if (!["trigger","condition","action"].includes(n.type)) errors.push(`Unsupported node type: ${n.type}`);
    if (n.type === "trigger" && String(n.data.trigger ?? "") !== trigger) errors.push(`Trigger node ${n.id} does not match workflow trigger`);
    if (n.type === "action" && String(n.data.action ?? "") === "webhook" && !/^https?:\/\//i.test(String(n.data.url ?? ""))) errors.push(`Webhook node ${n.id} requires a valid URL`);
  }
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) errors.push(`Edge ${e.id} references a missing node`);
    if (e.source === e.target) errors.push(`Edge ${e.id} cannot connect a node to itself`);
    if (e.condition && !["true","false"].includes(e.condition)) errors.push(`Edge ${e.id} has invalid condition`);
  }
  const triggers = nodes.filter(n => n.type === "trigger");
  if (triggers.length !== 1) errors.push("Workflow must contain exactly one trigger node");
  return { valid: errors.length === 0, errors };
}

export async function runLeadWorkflows(event: WorkflowEvent) {
  if (!event.leadId) return { matched: 0, executed: 0 };
  const workflows = event.workflowId
    ? await prisma.workflow.findMany({ where: { id: event.workflowId } })
    : await prisma.workflow.findMany({ where: { isActive: true, trigger: event.trigger } });
  if (!workflows.length) return { matched: 0, executed: 0 };
  const lead = await prisma.lead.findUnique({ where: { id: event.leadId } });
  if (!lead) return { matched: 0, executed: 0 };
  let executed = 0;
  for (const workflow of workflows) {
    const nodes = parse<WorkflowNode[]>(workflow.nodes, []);
    const edges = parse<WorkflowEdge[]>(workflow.edges, []);
    const run = await prisma.workflowRun.create({ data: { workflowId: workflow.id, trigger: event.trigger, triggerId: event.leadId, leadId: event.leadId } });
    const logs: string[] = [];
    try {
      const validation = validateWorkflow(nodes, edges, workflow.trigger);
      if (!validation.valid) throw new Error(validation.errors.join("; "));
      const triggers = nodes.filter((n) => n.type === "trigger");
      if (!triggers.length) throw new Error("Workflow has no trigger node");
      const queue = triggers.map((n) => n.id);
      const visited = new Set<string>();
      while (queue.length) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        const node = nodes.find((n) => n.id === id);
        if (!node) continue;
        let pass = true;
        if (node.type === "trigger") {
          pass = String(node.data.trigger ?? event.trigger) === event.trigger;
        } else if (node.type === "condition") {
          pass = matches(node.data, lead as unknown as Record<string, unknown>);
          logs.push(`${node.id}: condition ${pass ? "matched" : "did not match"}`);
        } else if (node.type === "action") {
          const result = await executeAction(node, event.leadId);
          logs.push(`${node.id}: ${result}`);
          executed++;
        }
        for (const edge of edges.filter((e) => e.source === id)) {
          if (node.type === "condition" && edge.condition && ((pass && edge.condition !== "true") || (!pass && edge.condition !== "false"))) continue;
          queue.push(edge.target);
        }
      }
      await prisma.workflowRun.update({ where: { id: run.id }, data: { status: "completed", logs: JSON.stringify(logs), completedAt: new Date() } });
      await prisma.workflow.update({ where: { id: workflow.id }, data: { lastRunAt: new Date() } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workflow execution failed";
      logs.push(`ERROR: ${message}`);
      await prisma.workflowRun.update({ where: { id: run.id }, data: { status: "failed", logs: JSON.stringify(logs), error: message, completedAt: new Date() } });
    }
  }
  return { matched: workflows.length, executed };
}
