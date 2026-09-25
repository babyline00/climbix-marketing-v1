import { NextRequest, NextResponse } from "next/server";
import { hashPassword, logActivity, rateLimitLogin } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";

// POST /api/auth/reset-password — consume a single-use token and set a new password
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";
    if (!rateLimitLogin(`reset:${ip}`, 10)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    let minLength = 8;
    try {
      minLength = Number(await getSetting("security.passwordMinLength")) || 8;
    } catch {
      /* default applies */
    }
    if (password.length < minLength) {
      return NextResponse.json(
        { error: `Password must be at least ${minLength} characters` },
        { status: 400 }
      );
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Password too long (max 128)" }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: reset.userId } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Account not found or deactivated" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(password), sessionVersion: { increment: 1 } },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "password_reset",
      module: "auth",
      details: "Password reset via email token",
    });

    return NextResponse.json({
      success: true,
      message: "Password updated. You can now sign in with your new password.",
    });
  } catch (e) {
    console.error("POST /api/auth/reset-password error", e);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
