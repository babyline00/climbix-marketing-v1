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

// GET /api/staff — list all users (permission: staff.view)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "staff.view");
  if (isResponse(session)) return session;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: PUBLIC_FIELDS,
    });
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users, roles });
  } catch (e) {
    console.error("GET /api/staff error", e);
    return NextResponse.json({ error: "Failed to load staff" }, { status: 500 });
  }
}

// POST /api/staff — create a staff user (permission: staff.manage)
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "staff.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "STAFF");
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const roleExists = await prisma.role.findUnique({ where: { name: role } });
    if (!roleExists) {
      return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    }

    // Only Super Admin can mint another Super Admin
    if (role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only a Super Admin can create Super Admin accounts" },
        { status: 403 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        phone,
        isActive: body.isActive === false ? false : true,
      },
      select: PUBLIC_FIELDS,
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "staff.create",
      module: "staff",
      details: `Created ${user.name} (${user.email}) as ${role}`,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("POST /api/staff error", e);
    return NextResponse.json({ error: "Failed to create staff user" }, { status: 500 });
  }
}
