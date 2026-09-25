import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { ALL_PERMISSION, ALL_PERMISSION_KEYS } from "@/lib/rbac";

export const runtime = "nodejs";

// PATCH /api/roles/[id] — update a custom role's permissions / label / description
// Super Admin only (roles.manage permission is granted exclusively to SUPER_ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "roles.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    if (role.isSystem) {
      return NextResponse.json(
        { error: "System roles cannot be edited" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.permissions !== undefined) {
      if (!Array.isArray(body.permissions)) {
        return NextResponse.json({ error: "permissions must be an array" }, { status: 400 });
      }
      const valid = body.permissions.filter(
        (p: unknown): p is string =>
          typeof p === "string" &&
          (p === ALL_PERMISSION || ALL_PERMISSION_KEYS.includes(p))
      );
      data.permissions = JSON.stringify(valid);
    }
    if (body.label !== undefined) {
      const label = String(body.label).trim();
      if (!label) return NextResponse.json({ error: "Label cannot be empty" }, { status: 400 });
      data.label = label;
    }
    if (body.description !== undefined) {
      data.description = String(body.description);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.role.update({
      where: { id },
      data,
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "roles.update",
      module: "staff",
      details: `Updated role ${updated.label}`,
    });

    return NextResponse.json({
      role: {
        id: updated.id,
        name: updated.name,
        label: updated.label,
        description: updated.description,
        permissions: JSON.parse(updated.permissions || "[]"),
        isSystem: updated.isSystem,
      },
    });
  } catch (e) {
    console.error("PATCH /api/roles/[id] error", e);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
