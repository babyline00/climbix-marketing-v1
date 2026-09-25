import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission, logActivity } from "@/lib/auth";
import { slugify } from "@/lib/service-data";

function revalidateService(slug: string) {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
}

// Static-backed rows are addressed as "static:<slug>" so that editing a
// seeded default upserts the override row instead of erroring.
function resolveKey(id: string): { slug?: string; rowId?: string } {
  if (id.startsWith("static:")) return { slug: id.slice("static:".length) };
  return { rowId: id };
}

// GET /api/services/[id] — one row (by id or static:slug)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(_req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const { slug, rowId } = resolveKey(id);
    const row = slug
      ? await db.service.findUnique({ where: { slug } })
      : await db.service.findUnique({ where: { id: rowId } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ service: row });
  } catch (e) {
    console.error("GET /api/services/[id] error", e);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// PATCH /api/services/[id] — update (upserts static-backed rows by slug)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = (await req.json()) ?? {};
    const { slug, rowId } = resolveKey(id);

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name || "");
    if (body.shortName !== undefined) data.shortName = String(body.shortName);
    if (body.tagline !== undefined) data.tagline = String(body.tagline);
    if (body.icon !== undefined) data.icon = String(body.icon);
    if (body.accent !== undefined) data.accent = String(body.accent);
    if (body.border !== undefined) data.border = String(body.border);
    if (body.cardDesc !== undefined) data.cardDesc = String(body.cardDesc);
    if (Array.isArray(body.cardPoints))
      data.cardPoints = JSON.stringify(body.cardPoints.map(String));
    if (body.data && typeof body.data === "object")
      data.data = JSON.stringify(body.data);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (typeof body.position === "number") data.position = body.position;
    if (body.slug) data.slug = slugify(String(body.slug));

    let row;
    if (slug) {
      const existing = await db.service.findUnique({ where: { slug } });
      if (data.slug && data.slug !== slug) {
        const conflict = await db.service.findUnique({
          where: { slug: String(data.slug) },
        });
        if (conflict && conflict.id !== existing?.id) {
          return NextResponse.json(
            { error: `Slug "${String(data.slug)}" is already in use` },
            { status: 409 }
          );
        }
      }
      row = existing
        ? await db.service.update({ where: { id: existing.id }, data: data as never })
        : await db.service.create({
            // Sparse override rows: undefined/empty fields stay empty so the
            // merge layer keeps the static default visible (e.g. toggling a
            // never-edited service inactive must not blank out its name).
            data: {
              slug: String(data.slug || slug),
              name: data.name ? String(data.name) : "",
              shortName: data.shortName ? String(data.shortName) : "",
              tagline: data.tagline ? String(data.tagline) : "",
              icon: data.icon ? String(data.icon) : "sparkles",
              accent: data.accent
                ? String(data.accent)
                : "from-brand-500/20 to-brand-700/10",
              border: data.border
                ? String(data.border)
                : "border-brand-500/30",
              cardDesc: data.cardDesc ? String(data.cardDesc) : "",
              cardPoints: String(data.cardPoints || "[]"),
              data: String(data.data || "{}"),
              position: typeof data.position === "number" ? data.position : 0,
            } as never,
          });
    } else {
      if (!rowId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
      row = await db.service.update({ where: { id: rowId }, data: data as never }).catch(() => null);
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidateService(String(data.slug || slug || row.slug));
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "service.update",
      module: "content",
      details: `Updated service ${row.slug}`,
    });
    return NextResponse.json({ service: row });
  } catch (e) {
    console.error("PATCH /api/services/[id] error", e);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE /api/services/[id] — remove (static: resets the row → defaults)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const { slug, rowId } = resolveKey(id);

    if (slug) {
      await db.service.deleteMany({ where: { slug } });
      revalidateService(slug);
    } else if (rowId) {
      const row = await db.service.findUnique({ where: { id: rowId } });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await db.service.delete({ where: { id: rowId } });
      revalidateService(row.slug);
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "service.delete",
      module: "content",
      details: `Deleted service ${slug || rowId || ""}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/services/[id] error", e);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}