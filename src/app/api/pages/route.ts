import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, isResponse, requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { publicReadCacheHeaders } from "@/lib/cache-headers";
import { MAX_PAGE_CONTENT_CHARS, normalizeRenderMode } from "@/lib/shortcodes";
import { listPages, isMissingRenderMode } from "@/lib/page-queries";
import { checkJsonLd } from "@/lib/jsonld";

// GET /api/pages — public published pages; authenticated content users can see drafts
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (session && !can(session.permissions, "content.view")) {
      return NextResponse.json({ error: "You do not have permission to view content" }, { status: 403 });
    }
    const pages = await listPages({
      where: session ? undefined : { status: "published" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { children: { where: session ? undefined : { status: "published" } } },
    });
    return NextResponse.json(
      { pages },
      { headers: publicReadCacheHeaders(session !== null) }
    );
  } catch (e) {
    console.error("GET /api/pages error", e);
    // listPages already absorbs a missing renderMode column, so reaching here
    // means a genuine failure rather than an unapplied migration.
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new page
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { title, slug, content, status, template, parentId, order, schemaJson, renderMode } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const mode = normalizeRenderMode(renderMode);
    if (mode === null) {
      return NextResponse.json(
        { error: "Invalid render mode" },
        { status: 400 }
      );
    }

    // A complete HTML page carries its own CSS and JS inline, so this is
    // capped well above the rich-text case but still far under the 4.5MB
    // serverless request-body limit.
    const bodyContent = String(content ?? "");
    if (bodyContent.length > MAX_PAGE_CONTENT_CHARS) {
      return NextResponse.json(
        { error: `Content too large (max ${MAX_PAGE_CONTENT_CHARS.toLocaleString()} characters)` },
        { status: 413 }
      );
    }

    // Validated up front: a malformed JSON-LD blob still renders, it just
    // silently drops the page's rich result, so nothing would report it later.
    const jsonLd = checkJsonLd(schemaJson);
    if (!jsonLd.ok) {
      return NextResponse.json({ error: jsonLd.error }, { status: 400 });
    }
    const schemaValue =
      typeof schemaJson === "string" && schemaJson.trim() ? schemaJson.trim() : null;

    // Check slug uniqueness
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    let page;
    try {
      page = await db.page.create({
        data: {
          title,
          slug,
          content: bodyContent || JSON.stringify([]),
          status: status || "published",
          template: template || "standard",
          renderMode: mode,
          parentId: parentId || null,
          order: order ?? 0,
          schemaJson: schemaValue,
        },
      });
    } catch (error) {
      // The production database may not have received the renderMode column
      // yet. Say so plainly instead of surfacing a generic 500.
      if (isMissingRenderMode(error)) {
        return NextResponse.json(
          {
            error:
              "This database is missing the Page.renderMode column, so pages cannot be saved yet. Apply the pending schema migration and retry.",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    revalidatePath("/");
    revalidatePath(`/${page.slug}`);

    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    console.error("POST /api/pages error", e);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
