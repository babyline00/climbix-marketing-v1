import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        roleLabel: session.roleLabel,
        permissions: session.permissions,
      },
    });
  } catch (e) {
    console.error("GET /api/auth/me error", e);
    return NextResponse.json(
      { error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}
