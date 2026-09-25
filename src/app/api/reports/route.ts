import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

function rangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null; // all time
  }
}

// GET /api/reports?range=30d — aggregated reports (leads, projects, staff performance)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "30d";
    const since = rangeStart(range);

    const leadDateFilter = since ? { createdAt: { gte: since } } : {};

    const [leadsByStatus, leadsBySource, staffLeads, projectSummary, taskSummary, totals] =
      await Promise.all([
        prisma.lead.groupBy({
          by: ["status"],
          _count: { status: true },
          where: leadDateFilter,
        }),
        prisma.lead.groupBy({
          by: ["source"],
          _count: { source: true },
          where: leadDateFilter,
        }),
        prisma.lead.groupBy({
          by: ["assignedTo"],
          _count: { assignedTo: true },
          where: { ...leadDateFilter, assignedTo: { not: null } },
        }),
        prisma.project.groupBy({
          by: ["status"],
          _count: { status: true },
          _sum: { budget: true, actualCost: true, revenue: true },
        }),
        prisma.task.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        Promise.all([
          prisma.lead.count({ where: leadDateFilter }),
          prisma.lead.count({ where: { ...leadDateFilter, status: "CONVERTED" } }),
        ]),
      ]);

    // Staff conversion: count CONVERTED per assignee
    const staffConverted = await prisma.lead.groupBy({
      by: ["assignedTo"],
      _count: { assignedTo: true },
      where: { ...leadDateFilter, assignedTo: { not: null }, status: "CONVERTED" },
    });

    const convertedMap = new Map(
      staffConverted.map((s) => [s.assignedTo, s._count.assignedTo])
    );

    return NextResponse.json({
      range,
      leads: {
        byStatus: leadsByStatus.map((s) => ({ status: s.status, count: s._count.status })),
        bySource: leadsBySource
          .map((s) => ({ source: s.source ?? "unknown", count: s._count.source }))
          .sort((a, b) => b.count - a.count),
        total: totals[0],
        converted: totals[1],
        conversionRate: totals[0] > 0 ? Math.round((totals[1] / totals[0]) * 1000) / 10 : 0,
      },
      staff: staffLeads
        .map((s) => ({
          name: s.assignedTo ?? "Unassigned",
          assigned: s._count.assignedTo,
          converted: convertedMap.get(s.assignedTo) ?? 0,
        }))
        .sort((a, b) => b.assigned - a.assigned),
      projects: {
        byStatus: projectSummary.map((p) => ({
          status: p.status,
          count: p._count.status,
          budget: p._sum.budget ?? 0,
          cost: p._sum.actualCost ?? 0,
          revenue: p._sum.revenue ?? 0,
        })),
      },
      tasks: {
        byStatus: taskSummary.map((t) => ({ status: t.status, count: t._count.status })),
      },
    });
  } catch (e) {
    console.error("GET /api/reports error", e);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
