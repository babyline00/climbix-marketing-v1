import { NextRequest, NextResponse } from "next/server";
import { hashPassword, isResponse, logActivity, requireAuth, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { getSetting } from "@/lib/settings";

export const runtime = "nodejs";

// POST /api/auth/change-password — signed-in user changes their own password
export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    let minLength = 8;
    try {
      minLength = Number(await getSetting("security.passwordMinLength")) || 8;
    } catch {
      /* default applies */
    }
    if (newPassword.length < minLength) {
      return NextResponse.json(
        { error: `New password must be at least ${minLength} characters` },
        { status: 400 }
      );
    }
    if (newPassword.length > 128) {
      return NextResponse.json({ error: "Password too long (max 128)" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (verifyPassword(newPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "New password must be different from the current one" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword), sessionVersion: { increment: 1 } },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "password_changed",
      module: "auth",
      details: "User changed their own password",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/auth/change-password error", e);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
