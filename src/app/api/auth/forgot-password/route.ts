import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitLogin } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/auth/forgot-password — always responds generically (no account enumeration).
// A single-use reset link is emailed through the internal email system (Email Log);
// once SMTP is configured in Settings the same message is deliverable externally.
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "local";
    if (!rateLimitLogin(`forgot:${ip}`, 5)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const generic = {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent. Ask an administrator if you cannot access your email.",
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json(generic);
    }

    // Single-use token, valid for 1 hour — previous unused tokens are voided
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetLink = `/admin-reset?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Climbix Marketing — Password Reset",
      type: "password_reset",
      body: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#080d19">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your admin account password. This link is valid for <strong>1 hour</strong> and can be used only once:</p>
          <p><a href="${resetLink}" style="display:inline-block;background:#FF6B2C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a></p>
          <p style="font-size:12px;color:#64748b">Or open the admin panel and paste this token: <code>${token.slice(0, 8)}…</code></p>
          <p style="font-size:12px;color:#64748b">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.email,
        action: "password_reset_requested",
        module: "auth",
        details: "Reset link generated",
      },
    });

    return NextResponse.json(generic);
  } catch (e) {
    console.error("POST /api/auth/forgot-password error", e);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
