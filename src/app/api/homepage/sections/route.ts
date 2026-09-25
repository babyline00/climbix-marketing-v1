import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DEFAULT_SECTIONS } from "@/lib/homepage";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/homepage/sections — all sections (admin view: include inactive)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    let sections = await db.homePageSection.findMany({
      orderBy: { position: "asc" },
    });

    // Auto-seed if empty so the manager is never blank on fresh installs
    if (sections.length === 0) {
      await db.homePageSection.createMany({
        data: DEFAULT_SECTIONS.map((s, i) => ({
          key: s.key,
          label: s.label,
          position: (i + 1) * 10,
          isActive: true,
        })),
      });
      sections = await db.homePageSection.findMany({
        orderBy: { position: "asc" },
      });
    }

    return NextResponse.json({ sections });
  } catch (e) {
    console.error("GET /api/homepage/sections error", e);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

// PATCH /api/homepage/sections — bulk update { updates: [{ key, isActive?, position? }] }
export async function PATCH(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const updates: { key: string; isActive?: boolean; position?: number }[] =
      body?.updates || [];

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates array is required" },
        { status: 400 }
      );
    }

    await Promise.all(
      updates.map((u) =>
        db.homePageSection.update({
          where: { key: u.key },
          data: {
            ...(typeof u.isActive === "boolean" ? { isActive: u.isActive } : {}),
            ...(typeof u.position === "number" ? { position: u.position } : {}),
          },
        })
      )
    );

    revalidatePath("/");

    const sections = await db.homePageSection.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ sections });
  } catch (e) {
    console.error("PATCH /api/homepage/sections error", e);
    return NextResponse.json(
      { error: "Failed to update sections" },
      { status: 500 }
    );
  }
}
