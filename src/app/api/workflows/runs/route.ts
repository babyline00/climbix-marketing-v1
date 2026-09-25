import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db-alias";
import { isResponse, requirePermission } from "@/lib/auth";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "automation.view"); if (isResponse(session)) return session;
  const limit = Math.min(100, Math.max(1, Number(new URL(req.url).searchParams.get("limit") ?? 40) || 40));
  const runs = await prisma.workflowRun.findMany({ orderBy: { startedAt: "desc" }, take: limit, include: { workflow: { select: { name: true } } } });
  return NextResponse.json({ runs });
}
