import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/site-content — fetch all site content as key-value map
export async function GET() {
  try {
    const rows = await db.siteContent.findMany();
    const content: Record<string, string> = {};
    for (const row of rows) content[row.key] = row.value;
    return NextResponse.json({ content });
  } catch (e) {
    console.error("GET /api/site-content error", e);
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

// PUT /api/site-content — bulk upsert site content
export async function PUT(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { content } = body as { content: Record<string, string> };

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { error: "content object is required" },
        { status: 400 }
      );
    }

    const ops = Object.entries(content).map(([key, value]) =>
      db.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(ops);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PUT /api/site-content error", e);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}
