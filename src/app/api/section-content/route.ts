import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission, logActivity } from "@/lib/auth";
import {
  SECTION_KEYS,
  SECTION_CONTENT_DEFAULTS,
  type SectionKey,
} from "@/lib/section-content";

// GET /api/section-content — all section content overrides (admin view)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const rows = await db.sectionContent.findMany();
    const map: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        map[row.key] = JSON.parse(row.data);
      } catch {
        map[row.key] = {};
      }
    }
    return NextResponse.json({ content: map, keys: SECTION_KEYS });
  } catch (e) {
    console.error("GET /api/section-content error", e);
    return NextResponse.json(
      { error: "Failed to fetch section content" },
      { status: 500 }
    );
  }
}

// PUT /api/section-content — upsert one section's content { key, data }
export async function PUT(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const key = typeof body?.key === "string" ? body.key : "";
    if (!SECTION_KEYS.includes(key as SectionKey)) {
      return NextResponse.json(
        { error: "Unknown section key" },
        { status: 400 }
      );
    }

    const data = body?.data;
    if (data === undefined || data === null || typeof data !== "object") {
      return NextResponse.json(
        { error: "data must be an object" },
        { status: 400 }
      );
    }

    const serialized = JSON.stringify(data);
    if (serialized.length > 100_000) {
      return NextResponse.json(
        { error: "Section content too large" },
        { status: 413 }
      );
    }

    await db.sectionContent.upsert({
      where: { key },
      update: { data: serialized },
      create: { key, data: serialized },
    });

    revalidatePath("/");
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "section_content.update",
      module: "homepage",
      details: key,
    });

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    console.error("PUT /api/section-content error", e);
    return NextResponse.json(
      { error: "Failed to save section content" },
      { status: 500 }
    );
  }
}

// DELETE /api/section-content?key=... — reset a section to defaults
export async function DELETE(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const key = new URL(req.url).searchParams.get("key") ?? "";
    if (!SECTION_KEYS.includes(key as SectionKey)) {
      return NextResponse.json(
        { error: "Unknown section key" },
        { status: 400 }
      );
    }

    await db.sectionContent.deleteMany({ where: { key } });
    revalidatePath("/");
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "section_content.reset",
      module: "homepage",
      details: key,
    });

    return NextResponse.json({ ok: true, key });
  } catch (e) {
    console.error("DELETE /api/section-content error", e);
    return NextResponse.json(
      { error: "Failed to reset section content" },
      { status: 500 }
    );
  }
}
