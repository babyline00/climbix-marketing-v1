import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isResponse, requirePermission, logActivity } from "@/lib/auth";
import { EMPTY_SERVICE_DATA, getAdminServices, slugify } from "@/lib/service-data";

function revalidateService(slug: string) {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
}

function parsePrune(body: Record<string, unknown>) {
  const data =
    (body.data as Record<string, unknown>) ?? EMPTY_SERVICE_DATA;
  const cardPoints = Array.isArray(body.cardPoints)
    ? body.cardPoints
        .filter((p) => typeof p === "string")
        .map((p) => String(p))
    : [];
  return {
    slug: slugify(String(body.slug || body.name || "")),
    name: String(body.name || ""),
    shortName: String(body.shortName || body.name || ""),
    tagline: String(body.tagline || ""),
    icon: String(body.icon || "sparkles"),
    accent: String(body.accent || "from-brand-500/20 to-brand-700/10"),
    border: String(body.border || "border-brand-500/30"),
    cardDesc: String(body.cardDesc || ""),
    cardPoints,
    data,
    isActive: body.isActive !== false,
    position:
      typeof body.position === "number" ? body.position : 0,
  };
}

// GET /api/services — full merged catalog (admin). Public site renders
// server-side via getServices() and never hits this endpoint.
export async function GET(_req: NextRequest) {
  const session = await requirePermission(_req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const services = await getAdminServices();
    return NextResponse.json({ services });
  } catch (e) {
    console.error("GET /api/services error", e);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST /api/services — create a new service
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "content.manage");
  if (isResponse(session)) return session;

  try {
    const body = parsePrune((await req.json()) ?? {});
    if (!body.slug) {
      return NextResponse.json({ error: "A slug is required" }, { status: 400 });
    }
    if (!body.name) {
      return NextResponse.json({ error: "A name is required" }, { status: 400 });
    }

    const existing = await db.service.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${body.slug}" is already in use` },
        { status: 409 }
      );
    }

    const row = await db.service.create({
      data: {
        ...body,
        data: JSON.stringify(body.data),
        cardPoints: JSON.stringify(body.cardPoints),
      } as never,
    });

    revalidateService(body.slug);
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "service.create",
      module: "content",
      details: `Created service ${body.slug}`,
    });
    return NextResponse.json({ service: row }, { status: 201 });
  } catch (e) {
    console.error("POST /api/services error", e);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}