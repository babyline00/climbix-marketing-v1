import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/emails — list all sent emails
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "emails.view");
  if (isResponse(session)) return session;

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const emails = await db.emailLog.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ emails });
  } catch (e) {
    console.error("GET /api/emails error", e);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
