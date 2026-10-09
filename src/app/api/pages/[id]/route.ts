import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission, logActivity } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MAX_PAGE_CONTENT_CHARS, normalizeRenderMode } from "@/lib/shortcodes";
import { checkJsonLd } from "@/lib/jsonld";
import {
  findPageById,
  findPageBySlug,
  isMissingRenderMode,
} from "@/lib/page-queries";

function revalidatePage(slug: string) {
  revalidatePath("/");
  revalidatePath(`/${slug}`);
}

// Static-backed rows are addressed as "system:<slug>" (or legacy "system-<slug>")
// so that editing a built-in page upserts the override row instead of erroring.
function resolveKey(id: string): { slug?: string; rowId?: string } {
  if (id.startsWith("system:")) return { slug: id.slice("system:".length) };
  if (id.startsWith("system-")) return { slug: id.slice("system-".length) };
  return { rowId: id };
}

// GET /api/pages/[id] — get a single page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { slug, rowId } = resolveKey(id);
    const page = slug
      ? await findPageBySlug(slug, { children: true })
      : await findPageById(rowId as string, { children: true });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (e) {
    console.error("GET /api/pages/[id] error", e);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// PATCH /api/pages/[id] — update (upserts built-in rows by slug)
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
    if (body.title !== undefined) data.title = String(body.title);
    if (body.slug !== undefined) data.slug = String(body.slug);
    if (body.content !== undefined) data.content = String(body.content);
    if (body.status !== undefined) data.status = String(body.status);
    if (body.template !== undefined) data.template = String(body.template);
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    if (body.order !== undefined) data.order = body.order;
    if (body.schemaJson !== undefined) {
      const jsonLd = checkJsonLd(body.schemaJson);
      if (!jsonLd.ok) {
        return NextResponse.json({ error: jsonLd.error }, { status: 400 });
      }
      const s = String(body.schemaJson ?? "").trim();
      data.schemaJson = s || null;
    }
    if (body.renderMode !== undefined) {
      const mode = normalizeRenderMode(body.renderMode);
      if (mode === null) {
        return NextResponse.json({ error: "Invalid render mode" }, { status: 400 });
      }
      data.renderMode = mode;
    }
    if (body.content !== undefined) {
      const next = String(body.content ?? "");
      if (next.length > MAX_PAGE_CONTENT_CHARS) {
        return NextResponse.json(
          { error: `Content too large (max ${MAX_PAGE_CONTENT_CHARS.toLocaleString()} characters)` },
          { status: 413 }
        );
      }
      data.content = next;
    }

    let page;
    if (slug) {
      if (data.slug && data.slug !== slug) {
        const conflict = await db.page.findUnique({
          where: { slug: String(data.slug) },
        });
        const existing = await db.page.findUnique({ where: { slug } });
        if (conflict && conflict.id !== existing?.id) {
          return NextResponse.json(
            { error: `Slug "${String(data.slug)}" is already in use` },
            { status: 409 }
          );
        }
      }
      const existing = await db.page.findUnique({ where: { slug } });
      page = existing
        ? await db.page.update({ where: { id: existing.id }, data: data as never })
        : await db.page.create({
            data: {
              title: String(data.title || body.title || ""),
              slug: String(data.slug || slug),
              content: data.content ? String(data.content) : "<p></p>",
              status: String(data.status || "published"),
              template: String(data.template || "standard"),
              renderMode: String(data.renderMode || "inline"),
              order: typeof data.order === "number" ? data.order : 0,
              schemaJson: data.schemaJson ? String(data.schemaJson) : null,
            } as never,
          });
    } else {
      if (!rowId) return NextResponse.json({ error: "Bad id" }, { status: 400 });
      page = await db.page
        .update({ where: { id: rowId }, data: data as never })
        .catch(() => null);
      if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidatePage(String(data.slug || slug || page.slug));
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "page.update",
      module: "content",
      details: `Updated page ${page.slug}`,
    });
    return NextResponse.json({ page });
  } catch (e) {
    // Writes cannot degrade the way reads can: Prisma's UPDATE always returns
    // the full row, so a database missing renderMode rejects every update.
    if (isMissingRenderMode(e)) {
      return NextResponse.json(
        {
          error:
            "This database is missing the Page.renderMode column, so pages cannot be updated yet. Apply the pending schema migration and retry.",
        },
        { status: 503 }
      );
    }
    console.error("PATCH /api/pages/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] — delete (built-in resets the row → defaults)
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
      await db.page.deleteMany({ where: { slug } });
      revalidatePage(slug);
    } else if (rowId) {
      const page = await db.page.findUnique({ where: { id: rowId } });
      if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await db.page.delete({ where: { id: rowId } });
      revalidatePage(page.slug);
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "page.delete",
      module: "content",
      details: `Deleted page ${slug || rowId || ""}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/pages/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}