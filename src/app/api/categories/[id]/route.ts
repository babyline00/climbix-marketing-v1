import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";

// PATCH /api/categories/[id] — update a category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, type, parentId, order } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (type !== undefined) data.type = type;
    if (parentId !== undefined) data.parentId = parentId || null;
    if (order !== undefined) data.order = order;

    const category = await db.category.update({ where: { id }, data });
    return NextResponse.json({ category });
  } catch (e) {
    console.error("PATCH /api/categories/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] — delete a category
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(_req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    // Delete children first
    await db.category.deleteMany({ where: { parentId: id } });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/categories/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
