import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { getGscReport } from "@/lib/gsc";

export const runtime = "nodejs";

// GET /api/reports/gsc?startDate=2026-08-01&endDate=2026-08-28&dimension=query|page
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;
  try {
    const search = req.nextUrl.searchParams;
    const startDate = search.get("startDate") || null;
    const endDate = search.get("endDate") || null;
    const dimension = search.get("dimension") === "page" ? "page" : "query";

    // Default to last 28 days
    let s: string;
    let e: string;
    if (startDate && endDate) {
      s = startDate;
      e = endDate;
    } else {
      const now = new Date();
      const start = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
      s = start.toISOString().slice(0, 10);
      e = now.toISOString().slice(0, 10);
    }

    const report = await getGscReport(s, e, dimension);
    return NextResponse.json({ report });
  } catch (e) {
    console.error("GET /api/reports/gsc error", e);
    return NextResponse.json(
      { error: "Failed to fetch Search Console report" },
      { status: 500 }
    );
  }
}