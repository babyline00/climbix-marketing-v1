import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { normalizeSource } from "@/lib/redirects";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "settings.manage");
  if (isResponse(session)) return session;
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body?.source !== undefined) data.source = normalizeSource(String(body.source));
    if (body?.destination !== undefined) {
      const destination = String(body.destination).trim();
      if (!destination) return NextResponse.json({ error: "Destination URL is required" }, { status: 400 });
      data.destination = destination;
    }
    if (body?.statusCode !== undefined) data.statusCode = body.statusCode === 302 ? 302 : 301;
    if (body?.enabled !== undefined) data.enabled = Boolean(body.enabled);

    const redirect = await prisma.redirect.update({ where: { id }, data });
    return NextResponse.json({ redirect });
  } catch (e) {
    console.error("PATCH /api/redirects error", e);
    return NextResponse.json({ error: "Failed to update redirect" }, { status: e instanceof Error && "P2025" in e ? 404 : 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requirePermission(req, "settings.manage");
  if (isResponse(session)) return session;
  try {
    const { id } = await ctx.params;
    await prisma.redirect.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/redirects error", e);
    return NextResponse.json({ error: "Failed to delete redirect" }, { status: 500 });
  }
}