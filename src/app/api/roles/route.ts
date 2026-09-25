import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { ALL_PERMISSION, ALL_PERMISSION_KEYS, parsePermissions } from "@/lib/rbac";

export const runtime = "nodejs";

// GET /api/roles — list roles with parsed permissions + user counts
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "staff.view");
  if (isResponse(session)) return session;

  try {
    const [roles, counts] = await Promise.all([
      prisma.role.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);

    const countMap = new Map(counts.map((c) => [c.role, c._count.role]));

    return NextResponse.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        label: r.label,
        description: r.description,
        permissions: parsePermissions(r.permissions),
        isSystem: r.isSystem,
        userCount: countMap.get(r.name) ?? 0,
      })),
    });
  } catch (e) {
    console.error("GET /api/roles error", e);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}

// POST /api/roles — create a custom role (Super Admin only)
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "roles.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim().toUpperCase().replace(/\s+/g, "_");
    const label = String(body.label ?? "").trim();
    if (!name || !label) {
      return NextResponse.json({ error: "Name and label are required" }, { status: 400 });
    }
    if (!/^[A-Z0-9_]{2,40}$/.test(name)) {
      return NextResponse.json(
        { error: "Role key must be 2-40 characters (A-Z, 0-9, underscore)" },
        { status: 400 }
      );
    }

    const exists = await prisma.role.findUnique({ where: { name } });
    if (exists) {
      return NextResponse.json({ error: "A role with this key already exists" }, { status: 409 });
    }

    const permissions = Array.isArray(body.permissions)
      ? body.permissions.filter(
          (p: unknown): p is string =>
            typeof p === "string" &&
            (p === ALL_PERMISSION || ALL_PERMISSION_KEYS.includes(p))
        )
      : [];

    const role = await prisma.role.create({
      data: {
        name,
        label,
        description: String(body.description ?? ""),
        permissions: JSON.stringify(permissions),
        isSystem: false,
      },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "roles.create",
      module: "staff",
      details: `Created custom role ${role.label}`,
    });

    return NextResponse.json(
      {
        role: {
          id: role.id,
          name: role.name,
          label: role.label,
          description: role.description,
          permissions: JSON.parse(role.permissions || "[]"),
          isSystem: role.isSystem,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/roles error", e);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
