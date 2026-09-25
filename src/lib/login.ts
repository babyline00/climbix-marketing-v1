import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  logActivity,
  rateLimitLogin,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { parsePermissions, SYSTEM_ROLES } from "@/lib/rbac";
import { prisma } from "@/lib/db-alias";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";


function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export async function handleLogin(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // Security settings (DB-backed with safe fallbacks — login must never break)
    let maxAttempts = 8;
    let sessionDays = 7;
    try {
      maxAttempts = Number(await getSetting("security.maxLoginAttempts")) || 8;
      sessionDays = Number(await getSetting("security.sessionDays")) || 7;
    } catch {
      /* defaults apply */
    }

    if (!rateLimitLogin(clientIp(req), maxAttempts)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      await logActivity({
        userName: email || "unknown",
        action: "login_failed",
        module: "auth",
        details: user ? "Account deactivated" : "Unknown email",
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      await logActivity({
        userId: user.id,
        userName: user.email,
        action: "login_failed",
        module: "auth",
        details: "Wrong password",
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Resolve role permissions
    const role = await prisma.role.findUnique({ where: { name: user.role } });
    const fallback = SYSTEM_ROLES.find((r) => r.name === user.role);
    const roleLabel = role?.label ?? fallback?.label ?? user.role;
    const permissions = role
      ? parsePermissions(role.permissions)
      : (fallback?.permissions ?? []);

    const token = createSessionToken(user, sessionDays);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "login",
      module: "auth",
      details: `Signed in as ${roleLabel}`,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel,
        permissions,
      },
    });

    // Set session cookie so all same-origin admin API calls authenticate automatically
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDays * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    console.error("login handler error", e);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
