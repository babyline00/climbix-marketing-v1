import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission } from "@/lib/auth";

/**
 * GET /api/popup — the announcement popup (single record, auto-created).
 * PUT /api/popup — update popup fields { title?, message?, badge?, ctaLabel?,
 *                   ctaHref?, imageUrl?, customHtml?, isActive?, delaySeconds?, showEveryDays? }
 */

async function getOrCreatePopup() {
  const existing = await db.sitePopup.findFirst({ orderBy: { updatedAt: "asc" } });
  if (existing) return existing;

  return db.sitePopup.create({
    data: {
      title: "Get a Free SEO Audit",
      message:
        "Find out exactly what is holding your website back. Claim a free, no-strings 20-point SEO audit from the Climbix team — usually delivered within 48 hours.",
      badge: "LIMITED TIME",
      ctaLabel: "Claim My Free Audit",
      ctaHref: "/free-growth-audit",
      isActive: false,
      delaySeconds: 5,
      showEveryDays: 1,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const popup = await getOrCreatePopup();
    return NextResponse.json({ popup });
  } catch (e) {
    console.error("GET /api/popup error", e);
    return NextResponse.json(
      { error: "Failed to fetch popup" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const current = await getOrCreatePopup();

    const data: {
      title?: string;
      message?: string;
      badge?: string | null;
      ctaLabel?: string | null;
      ctaHref?: string | null;
      imageUrl?: string | null;
      customHtml?: string | null;
      isActive?: boolean;
      delaySeconds?: number;
      showEveryDays?: number;
    } = {};

    if (typeof body?.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (typeof body?.message === "string") {
      data.message = body.message.trim();
    }
    if (typeof body?.badge === "string") {
      data.badge = body.badge.trim() || null;
    }
    if (typeof body?.ctaLabel === "string") {
      data.ctaLabel = body.ctaLabel.trim() || null;
    }
    if (typeof body?.ctaHref === "string") {
      data.ctaHref = body.ctaHref.trim() || null;
    }
    if (typeof body?.imageUrl === "string") {
      data.imageUrl = body.imageUrl.trim() || null;
    }
    if (typeof body?.customHtml === "string") {
      data.customHtml = body.customHtml.slice(0, 20_000).trim() || null;
    }
    if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body?.delaySeconds === "number" && body.delaySeconds >= 0) {
      data.delaySeconds = Math.min(Math.round(body.delaySeconds), 120);
    }
    if (typeof body?.showEveryDays === "number" && body.showEveryDays >= 0) {
      data.showEveryDays = Math.min(Math.round(body.showEveryDays), 365);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const popup = await db.sitePopup.update({
      where: { id: current.id },
      data: data as never,
    });

    revalidatePath("/");
    return NextResponse.json({ popup });
  } catch (e) {
    console.error("PUT /api/popup error", e);
    return NextResponse.json(
      { error: "Failed to update popup" },
      { status: 500 }
    );
  }
}
