import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/notifications — list + unread count
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "1";
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 15) || 15));

    const where = unreadOnly ? { readAt: null } : {};

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { readAt: null } }),
    ]);

    return NextResponse.json({ items, unreadCount });
  } catch (e) {
    console.error("GET /api/notifications error", e);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

// PATCH /api/notifications — mark one ({ id }) or all ({ all: true }) as read
export async function PATCH(req: NextRequest) {
  const session = await requirePermission(req, "dashboard.view");
  if (isResponse(session)) return session;

  try {
    const body = await req.json().catch(() => ({}));
    if (body.all) {
      await prisma.notification.updateMany({
        where: { readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }
    if (body.id) {
      await prisma.notification.update({
        where: { id: String(body.id) },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Provide id or all" }, { status: 400 });
  } catch (e) {
    console.error("PATCH /api/notifications error", e);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
