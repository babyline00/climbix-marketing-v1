import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/activity — paginated audit trail (permission: activity.view)
// Query params: ?page=1&pageSize=50&module=all&q=
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "activity.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(searchParams.get("pageSize") ?? 50) || 50));
    const moduleFilter = searchParams.get("module") ?? "all";
    const q = (searchParams.get("q") ?? "").trim();

    const where = {
      ...(moduleFilter !== "all" ? { module: moduleFilter } : {}),
      ...(q
        ? {
            OR: [
              { userName: { contains: q } },
              { action: { contains: q } },
              { details: { contains: q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count({ where }),
    ]);

    const modules = await prisma.activityLog.findMany({
      select: { module: true },
      distinct: ["module"],
    });

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      modules: modules.map((m) => m.module),
    });
  } catch (e) {
    console.error("GET /api/activity error", e);
    return NextResponse.json({ error: "Failed to load activity log" }, { status: 500 });
  }
}
