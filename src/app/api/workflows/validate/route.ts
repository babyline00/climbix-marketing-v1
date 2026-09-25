import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { validateWorkflow } from "@/lib/workflow-engine";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "automation.manage"); if (isResponse(session)) return session;
  const body = await req.json();
  const result = validateWorkflow(Array.isArray(body.nodes) ? body.nodes : [], Array.isArray(body.edges) ? body.edges : [], String(body.trigger ?? "lead.created"));
  return NextResponse.json(result);
}
