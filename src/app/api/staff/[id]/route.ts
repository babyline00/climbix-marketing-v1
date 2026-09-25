import { NextRequest, NextResponse } from "next/server";
import { hashPassword, isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
};

// PATCH /api/staff/[id] — update name / role / active / password
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "staff.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSuper = session.user.role === "SUPER_ADMIN";

    // Guard: only Super Admin can modify a Super Admin account
    if (target.role === "SUPER_ADMIN" && !isSuper) {
      return NextResponse.json(
        { error: "Only a Super Admin can modify Super Admin accounts" },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      data.name = name;
    }
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone).trim() : null;
    if (body.password !== undefined) {
      const password = String(body.password);
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      data.passwordHash = hashPassword(password);
    }

    if (body.role !== undefined) {
      const role = String(body.role);
      const roleExists = await prisma.role.findUnique({ where: { name: role } });
      if (!roleExists) {
        return NextResponse.json({ error: "Unknown role" }, { status: 400 });
      }
      if (role === "SUPER_ADMIN" && !isSuper) {
        return NextResponse.json(
          { error: "Only a Super Admin can grant the Super Admin role" },
          { status: 403 }
        );
      }
      // Guard: cannot demote yourself if you are the last active Super Admin
      if (target.id === session.user.id && target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
        const activeSupers = await prisma.user.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });
        if (activeSupers <= 1) {
          return NextResponse.json(
            { error: "You are the last active Super Admin — promote another Super Admin first" },
            { status: 409 }
          );
        }
      }
      data.role = role;
    }

    if (body.isActive !== undefined) {
      const isActive = Boolean(body.isActive);
      // Guard: cannot deactivate yourself
      if (target.id === session.user.id && !isActive) {
        return NextResponse.json(
          { error: "You cannot deactivate your own account" },
          { status: 409 }
        );
      }
      // Guard: cannot deactivate the last active Super Admin
      if (target.role === "SUPER_ADMIN" && target.isActive && !isActive) {
        const activeSupers = await prisma.user.count({
          where: { role: "SUPER_ADMIN", isActive: true },
        });
        if (activeSupers <= 1) {
          return NextResponse.json(
            { error: "Cannot deactivate the last active Super Admin" },
            { status: 409 }
          );
        }
      }
      data.isActive = isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_FIELDS,
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "staff.update",
      module: "staff",
      details: `Updated ${user.name} (${user.email}) — ${Object.keys(data).join(", ")}`,
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error("PATCH /api/staff/[id] error", e);
    return NextResponse.json({ error: "Failed to update staff user" }, { status: 500 });
  }
}

// DELETE /api/staff/[id] — remove a staff user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "staff.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSuper = session.user.role === "SUPER_ADMIN";
    if (target.role === "SUPER_ADMIN" && !isSuper) {
      return NextResponse.json(
        { error: "Only a Super Admin can delete Super Admin accounts" },
        { status: 403 }
      );
    }
    if (target.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 409 }
      );
    }
    if (target.role === "SUPER_ADMIN") {
      const activeSupers = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (activeSupers <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last active Super Admin" },
          { status: 409 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "staff.delete",
      module: "staff",
      details: `Deleted ${target.name} (${target.email})`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/staff/[id] error", e);
    return NextResponse.json({ error: "Failed to delete staff user" }, { status: 500 });
  }
}
