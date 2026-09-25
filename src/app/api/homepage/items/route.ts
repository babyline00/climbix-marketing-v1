import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission } from "@/lib/auth";

export type HomepageItemType =
  | "trust-badges"
  | "client-logos"
  | "testimonials"
  | "offers";

function isValidType(t: string | null): t is HomepageItemType {
  return (
    t === "trust-badges" ||
    t === "client-logos" ||
    t === "testimonials" ||
    t === "offers"
  );
}

// GET /api/homepage/items?type=trust-badges — list all (incl. inactive, for admin)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const type = req.nextUrl.searchParams.get("type");
    if (!isValidType(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    let items: unknown[];
    switch (type) {
      case "trust-badges":
        items = await db.trustBadge.findMany({ orderBy: { position: "asc" } });
        break;
      case "client-logos":
        items = await db.clientLogo.findMany({ orderBy: { position: "asc" } });
        break;
      case "testimonials":
        items = await db.testimonial.findMany({
          orderBy: { position: "asc" },
        });
        break;
      case "offers":
        items = await db.offer.findMany({ orderBy: { position: "asc" } });
        break;
    }

    return NextResponse.json({ items });
  } catch (e) {
    console.error("GET /api/homepage/items error", e);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/homepage/items — create { type, ...fields }
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { type, ...fields } = body || {};
    if (!isValidType(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    let item: unknown;
    switch (type) {
      case "trust-badges": {
        const last = await db.trustBadge.findFirst({
          orderBy: { position: "desc" },
        });
        item = await db.trustBadge.create({
          data: {
            label: String(fields.label || ""),
            icon: String(fields.icon || "shield-check"),
            imageUrl: fields.imageUrl || null,
            isActive: fields.isActive !== false,
            position:
              typeof fields.position === "number"
                ? fields.position
                : (last?.position ?? 0) + 10,
          } as never,
        });
        break;
      }
      case "client-logos": {
        const last = await db.clientLogo.findFirst({
          orderBy: { position: "desc" },
        });
        item = await db.clientLogo.create({
          data: {
            name: String(fields.name || ""),
            imageUrl: fields.imageUrl || null,
            website: fields.website || null,
            isActive: fields.isActive !== false,
            position:
              typeof fields.position === "number"
                ? fields.position
                : (last?.position ?? 0) + 10,
          } as never,
        });
        break;
      }
      case "testimonials": {
        const last = await db.testimonial.findFirst({
          orderBy: { position: "desc" },
        });
        item = await db.testimonial.create({
          data: {
            name: String(fields.name || ""),
            role: fields.role || null,
            company: fields.company || null,
            quote: String(fields.quote || ""),
            rating: Number(fields.rating) > 0 ? Number(fields.rating) : 5,
            avatarUrl: fields.avatarUrl || null,
            isActive: fields.isActive !== false,
            position:
              typeof fields.position === "number"
                ? fields.position
                : (last?.position ?? 0) + 10,
          } as never,
        });
        break;
      }
      case "offers": {
        const last = await db.offer.findFirst({
          orderBy: { position: "desc" },
        });
        item = await db.offer.create({
          data: {
            title: String(fields.title || ""),
            description: String(fields.description || ""),
            badge: fields.badge || null,
            imageUrl: fields.imageUrl || null,
            ctaLabel: fields.ctaLabel || "Claim Offer",
            ctaHref: fields.ctaHref || "#strategy-call",
            expiresAt: fields.expiresAt ? new Date(fields.expiresAt) : null,
            isActive: fields.isActive !== false,
            position:
              typeof fields.position === "number"
                ? fields.position
                : (last?.position ?? 0) + 10,
          } as never,
        });
        break;
      }
    }

    revalidatePath("/");
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    console.error("POST /api/homepage/items error", e);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
