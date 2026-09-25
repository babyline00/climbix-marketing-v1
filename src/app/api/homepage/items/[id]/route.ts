import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission } from "@/lib/auth";

// PATCH /api/homepage/items/[id] — update { type, ...fields }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const { type, ...fields } = body || {};

    let item: unknown;
    switch (type) {
      case "trust-badges": {
        const data: {
          label?: string;
          icon?: string;
          imageUrl?: string | null;
          isActive?: boolean;
        } = {};
        if (fields.label !== undefined) data.label = String(fields.label);
        if (fields.icon !== undefined) data.icon = String(fields.icon);
        if (fields.imageUrl !== undefined) data.imageUrl = fields.imageUrl || null;
        if (fields.isActive !== undefined) data.isActive = !!fields.isActive;
        item = await db.trustBadge.update({ where: { id }, data: data as never });
        break;
      }
      case "client-logos": {
        const data: {
          name?: string;
          imageUrl?: string | null;
          website?: string | null;
          isActive?: boolean;
        } = {};
        if (fields.name !== undefined) data.name = String(fields.name);
        if (fields.imageUrl !== undefined)
          data.imageUrl = fields.imageUrl || null;
        if (fields.website !== undefined) data.website = fields.website || null;
        if (fields.isActive !== undefined) data.isActive = !!fields.isActive;
        item = await db.clientLogo.update({ where: { id }, data });
        break;
      }
      case "testimonials": {
        const data: {
          name?: string;
          role?: string | null;
          company?: string | null;
          quote?: string;
          rating?: number;
          avatarUrl?: string | null;
          isActive?: boolean;
        } = {};
        if (fields.name !== undefined) data.name = String(fields.name);
        if (fields.role !== undefined) data.role = fields.role || null;
        if (fields.company !== undefined) data.company = fields.company || null;
        if (fields.quote !== undefined) data.quote = String(fields.quote);
        if (fields.rating !== undefined)
          data.rating = Number(fields.rating) > 0 ? Number(fields.rating) : 5;
        if (fields.avatarUrl !== undefined)
          data.avatarUrl = fields.avatarUrl || null;
        if (fields.isActive !== undefined) data.isActive = !!fields.isActive;
        item = await db.testimonial.update({ where: { id }, data });
        break;
      }
      case "offers": {
        const data: {
          title?: string;
          description?: string;
          badge?: string | null;
          imageUrl?: string | null;
          ctaLabel?: string;
          ctaHref?: string;
          expiresAt?: Date | null;
          isActive?: boolean;
        } = {};
        if (fields.title !== undefined) data.title = String(fields.title);
        if (fields.description !== undefined)
          data.description = String(fields.description);
        if (fields.badge !== undefined) data.badge = fields.badge || null;
        if (fields.imageUrl !== undefined) data.imageUrl = fields.imageUrl || null;
        if (fields.ctaLabel !== undefined)
          data.ctaLabel = fields.ctaLabel || "Claim Offer";
        if (fields.ctaHref !== undefined)
          data.ctaHref = fields.ctaHref || "#strategy-call";
        if (fields.expiresAt !== undefined)
          data.expiresAt = fields.expiresAt ? new Date(fields.expiresAt) : null;
        if (fields.isActive !== undefined) data.isActive = !!fields.isActive;
        item = await db.offer.update({ where: { id }, data: data as never });
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    revalidatePath("/");
    return NextResponse.json({ item });
  } catch (e) {
    console.error("PATCH /api/homepage/items/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/homepage/items/[id]?type=trust-badges
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "homepage.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const type = req.nextUrl.searchParams.get("type");

    switch (type) {
      case "trust-badges":
        await db.trustBadge.delete({ where: { id } });
        break;
      case "client-logos":
        await db.clientLogo.delete({ where: { id } });
        break;
      case "testimonials":
        await db.testimonial.delete({ where: { id } });
        break;
      case "offers":
        await db.offer.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/homepage/items/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
