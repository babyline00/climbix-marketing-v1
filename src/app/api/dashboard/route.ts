import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

const RANGES: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Aggregated dashboard statistics — all counting done in the database
// (no findMany + .length), executed in parallel, cached for 30 seconds.
async function computeStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [
    totalLeads, newLeads, convertedLeads, lostLeads,
    totalClients, activeClients,
    totalProjects, activeProjects, completedProjects, planningProjects,
    totalTasks, pendingTasks, completedTasks,
    revenueAgg, costAgg, pipelineValue,
    totalMeetings, upcomingMeetings,
    followupsToday, overdueFollowups,
    unreadNotifications, totalMedia, totalPageCount, totalPostCount,
    totalStaff, activeStaff,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.lead.count({ where: { status: "LOST" } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "active" } }),
    prisma.project.count({ where: { status: { not: "archived" } } }),
    prisma.project.count({ where: { status: "active" } }),
    prisma.project.count({ where: { status: "completed" } }),
    prisma.project.count({ where: { status: "planning" } }),
    prisma.task.count({ where: { status: { not: "cancelled" } } }),
    prisma.task.count({ where: { status: { in: ["todo", "in_progress", "review"] } } }),
    prisma.task.count({ where: { status: "completed" } }),
    prisma.project.aggregate({ _sum: { revenue: true }, where: { status: "completed" } }),
    prisma.project.aggregate({ _sum: { actualCost: true } }),
    prisma.lead.aggregate({ _sum: { estimatedValue: true }, where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "FOLLOW_UP"] } } }),
    prisma.meeting.count(),
    prisma.meeting.count({ where: { date: { gte: new Date().toISOString().slice(0, 10) }, status: "scheduled" } }),
    prisma.followUp.count({ where: { done: false, scheduledAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.followUp.count({ where: { done: false, scheduledAt: { lt: todayStart } } }),
    prisma.notification.count({ where: { readAt: null } }),
    prisma.media.count(),
    prisma.page.count(),
    prisma.blogPost.count(),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return {
    leads: { total: totalLeads, new: newLeads, converted: convertedLeads, lost: lostLeads, pipelineValue: pipelineValue._sum.estimatedValue ?? 0 },
    clients: { total: totalClients, active: activeClients },
    projects: { total: totalProjects, active: activeProjects, completed: completedProjects, planning: planningProjects },
    tasks: { total: totalTasks, pending: pendingTasks, completed: completedTasks },
    finance: {
      revenue: revenueAgg._sum.revenue ?? 0,
      expenses: costAgg._sum.actualCost ?? 0,
      pending: Math.max(0, (revenueAgg._sum.revenue ?? 0) - (costAgg._sum.actualCost ?? 0)),
    },
    meetings: { total: totalMeetings, upcoming: upcomingMeetings },
    followups: { today: followupsToday, overdue: overdueFollowups },
    system: { notifications: unreadNotifications, media: totalMedia, content: totalPageCount + totalPostCount, staff: totalStaff, activeStaff },
    generatedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Analytics — date-range filtered time series for dashboard charts
// ─────────────────────────────────────────────────────────────

type DayRow = { day: string; count: number };
type MonthRow = { month: string; revenue: number | null; cost: number | null };

function buildDaySeries(since: Date, rows: DayRow[]) {
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const series: { day: string; label: string; count: number }[] = [];
  const cursor = startOfDay(since);
  const today = startOfDay(new Date());
  // Cap points for long ranges (weekly rollup handled client-side visually)
  while (cursor <= today) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    series.push({
      day: key,
      label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: byDay.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

async function computeCharts(since: Date) {
  // NOTE: Prisma maps DateTime to Postgres `timestamp(3)`, so raw SQL buckets
  // with to_char() and compares against a bound Date directly.
  const [
    leadDayRows,
    meetingDayRows,
    statusGroups,
    sourceGroups,
    taskGroups,
    revenueMonthRows,
    leadsThisPeriod,
    leadsPrevPeriod,
    convertedThisPeriod,
    convertedPrevPeriod,
    revenueThisPeriod,
    revenuePrevPeriod,
  ] = await Promise.all([
    prisma.$queryRaw<DayRow[]>`SELECT to_char("createdAt", 'YYYY-MM-DD') as day, COUNT(*)::int as count FROM "Lead" WHERE "createdAt" >= ${since} GROUP BY day ORDER BY day`,
    prisma.$queryRaw<DayRow[]>`SELECT to_char("createdAt", 'YYYY-MM-DD') as day, COUNT(*)::int as count FROM "Meeting" WHERE "createdAt" >= ${since} GROUP BY day ORDER BY day`,
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true }, where: { createdAt: { gte: since } } }),
    prisma.task.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.$queryRaw<MonthRow[]>`SELECT to_char("createdAt", 'YYYY-MM') as month, SUM("revenue") as revenue, SUM("actualCost") as cost FROM "Project" WHERE "createdAt" >= ${since} GROUP BY month ORDER BY month`,
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { lt: since, gte: new Date(since.getTime() - (Date.now() - since.getTime())) } } }),
    prisma.lead.count({ where: { status: "CONVERTED", createdAt: { gte: since } } }),
    prisma.lead.count({ where: { status: "CONVERTED", createdAt: { lt: since, gte: new Date(since.getTime() - (Date.now() - since.getTime())) } } }),
    prisma.project.aggregate({ _sum: { revenue: true }, where: { createdAt: { gte: since } } }),
    prisma.project.aggregate({ _sum: { revenue: true }, where: { createdAt: { lt: since, gte: new Date(since.getTime() - (Date.now() - since.getTime())) } } }),
  ]);

  const monthMap = new Map(
    revenueMonthRows.map((r) => [r.month, { month: r.month, revenue: Number(r.revenue ?? 0), cost: Number(r.cost ?? 0) }])
  );
  const revenueSeries: { month: string; label: string; revenue: number; cost: number }[] = [];
  const cursor = new Date(since.getFullYear(), since.getMonth(), 1);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  while (cursor <= thisMonth) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const row = monthMap.get(key);
    revenueSeries.push({
      month: key,
      label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      revenue: Math.round(row?.revenue ?? 0),
      cost: Math.round(row?.cost ?? 0),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const revThis = Math.round(revenueThisPeriod._sum?.revenue ?? 0);
  const revPrev = Math.round(revenuePrevPeriod._sum?.revenue ?? 0);

  return {
    leadsTimeline: buildDaySeries(since, leadDayRows.map((r) => ({ day: r.day, count: Number(r.count) }))),
    meetingsTimeline: buildDaySeries(since, meetingDayRows.map((r) => ({ day: r.day, count: Number(r.count) }))),
    leadsByStatus: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    leadsBySource: sourceGroups
      .map((g) => ({ source: g.source ?? "direct", count: g._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    tasksByStatus: taskGroups.map((g) => ({ status: g.status, count: g._count._all })),
    revenueTimeline: revenueSeries.map((m) => ({ ...m, revenue: Number(m.revenue), cost: Number(m.cost) })),
    changes: {
      leads: { current: leadsThisPeriod, previous: leadsPrevPeriod, changePct: pct(leadsThisPeriod, leadsPrevPeriod) },
      converted: { current: convertedThisPeriod, previous: convertedPrevPeriod, changePct: pct(convertedThisPeriod, convertedPrevPeriod) },
      revenue: { current: revThis, previous: revPrev, changePct: pct(revThis, revPrev) },
    },
  };
}

export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "30d";
    const days = RANGES[range] ?? 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Time-bucketed cache key: guarantees fresh data every 30s
    // (works around dev-mode cache stickiness; in production this still
    //  collapses concurrent requests within the same 30s window)
    const bucket = Math.floor(Date.now() / 30_000);
    const getCachedStats = unstable_cache(computeStats, ["dashboard-stats", String(bucket)], {
      revalidate: 30,
    });
    const getCachedCharts = unstable_cache(
      () => computeCharts(since),
      ["dashboard-charts", range, String(bucket)],
      { revalidate: 30 }
    );

    const [stats, charts] = await Promise.all([getCachedStats(), getCachedCharts()]);
    return NextResponse.json(
      { ...stats, range, since: since.toISOString(), charts },
      { headers: { "Cache-Control": "private, max-age=15" } }
    );
  } catch (e) {
    console.error("GET /api/dashboard error", e);
    return NextResponse.json({ error: "Failed to compute dashboard stats" }, { status: 500 });
  }
}
