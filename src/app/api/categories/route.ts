import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// GET /api/categories — list all categories (with children)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "content.view");
  if (isResponse(session)) return session;

  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { children: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("GET /api/categories error", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — create a new category
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const { name, slug, type, parentId, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        type: type || "blog",
        parentId: parentId || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    console.error("POST /api/categories error", e);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
