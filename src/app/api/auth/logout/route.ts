import { NextRequest, NextResponse } from "next/server";
import { getSession, logActivity, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (session) {
    await prisma.user.update({ where: { id: session.user.id }, data: { sessionVersion: { increment: 1 } } });
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "logout",
      module: "auth",
      details: "Signed out",
    });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
