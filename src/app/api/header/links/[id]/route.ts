import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission } from "@/lib/auth";

// PATCH /api/header/links/[id] — update a single link (label/href/kind/isActive/position)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: {
      label?: string;
      href?: string;
      kind?: string;
      isActive?: boolean;
      position?: number;
    } = {};

    if (typeof body?.label === "string" && body.label.trim()) {
      data.label = body.label.trim();
    }
    if (typeof body?.href === "string" && body.href.trim()) {
      data.href = body.href.trim();
    }
    if (
      typeof body?.kind === "string" &&
      ["link", "services", "industries", "blog", "pricing"].includes(body.kind)
    ) {
      data.kind = body.kind;
    }
    if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body?.position === "number") data.position = body.position;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const link = await db.headerLink.update({ where: { id }, data });

    revalidatePath("/");
    return NextResponse.json({ link });
  } catch (e) {
    console.error("PATCH /api/header/links/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update header link" },
      { status: 500 }
    );
  }
}

// DELETE /api/header/links/[id] — delete a custom link (system links are protected)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(_req, "header.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const link = await db.headerLink.findUnique({ where: { id } });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    if (link.isSystem) {
      return NextResponse.json(
        { error: "System links cannot be deleted — deactivate them instead." },
        { status: 409 }
      );
    }

    await db.headerLink.delete({ where: { id } });

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/header/links/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete header link" },
      { status: 500 }
    );
  }
}
