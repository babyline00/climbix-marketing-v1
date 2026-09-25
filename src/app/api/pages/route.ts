import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, isResponse, requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// GET /api/pages — public published pages; authenticated content users can see drafts
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (session && !can(session.permissions, "content.view")) {
      return NextResponse.json({ error: "You do not have permission to view content" }, { status: 403 });
    }
    const pages = await db.page.findMany({
      where: session ? undefined : { status: "published" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { children: { where: session ? undefined : { status: "published" } } },
    });
    return NextResponse.json({ pages });
  } catch (e) {
    console.error("GET /api/pages error", e);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new page
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { title, slug, content, status, template, parentId, order, schemaJson } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        content: content || JSON.stringify([]),
        status: status || "published",
        template: template || "standard",
        parentId: parentId || null,
        order: order ?? 0,
        schemaJson: schemaJson && String(schemaJson).trim() ? String(schemaJson).trim() : null,
      },
    });

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
