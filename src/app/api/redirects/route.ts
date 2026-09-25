import { NextRequest, NextResponse } from "next/server";
import { isResponse, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import { normalizeSource } from "@/lib/redirects";

export const runtime = "nodejs";

// GET /api/redirects — list all redirects (admin)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "settings.view");
  if (isResponse(session)) return session;
  try {
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ redirects });
  } catch (e) {
    console.error("GET /api/redirects error", e);
    return NextResponse.json({ error: "Failed to load redirects" }, { status: 500 });
  }
}

// POST /api/redirects — create { source, destination, statusCode?, enabled? }
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "settings.manage");
  if (isResponse(session)) return session;
  try {
    const body = await req.json();
    const source = normalizeSource(body?.source || "");
    const destination = String(body?.destination || "").trim();
    if (!source || source === "/") {
      return NextResponse.json({ error: "Source path is required and cannot be /" }, { status: 400 });
    }
    if (!destination) {
      return NextResponse.json({ error: "Destination URL is required" }, { status: 400 });
    }
    if (!destination.startsWith("/") && !/^https?:\/\//.test(destination)) {
      return NextResponse.json({ error: "Destination must be a path or full URL" }, { status: 400 });
    }
    const statusCode = body?.statusCode === 302 ? 302 : 301;

    const existing = await prisma.redirect.findUnique({ where: { source } });
    if (existing) {
      return NextResponse.json({ error: `A redirect for "${source}" already exists` }, { status: 409 });
    }

    const redirect = await prisma.redirect.create({
      data: {
        source,
        destination,
        statusCode,
        enabled: body?.enabled !== false,
      },
    });
    return NextResponse.json({ redirect }, { status: 201 });
  } catch (e) {
    console.error("POST /api/redirects error", e);
    return NextResponse.json({ error: "Failed to create redirect" }, { status: 500 });
  }
}