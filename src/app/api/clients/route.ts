import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/clients — search + filter + pagination (server-side)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "leads.view");
  if (isResponse(session)) return session;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(searchParams.get("pageSize") ?? 20) || 20));
    const q = (searchParams.get("q") ?? "").trim();
    const status = searchParams.get("status") ?? "all";

    const where = {
      ...(status !== "all" ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { company: { contains: q } },
              { email: { contains: q } },
              { city: { contains: q } },
              { industry: { contains: q } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { projects: true, leads: true } } },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((c) => ({ ...c, projectCount: c._count.projects, leadCount: c._count.leads, _count: undefined })),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e) {
    console.error("GET /api/clients error", e);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

// POST /api/clients — create client
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        company: body.company || null,
        email: body.email || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        website: body.website || null,
        industry: body.industry || null,
        country: body.country || null,
        city: body.city || null,
        address: body.address || null,
        status: body.status || "active",
        notes: body.notes || null,
      },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "client.create",
      module: "clients",
      details: `Created client ${client.name}`,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    console.error("POST /api/clients error", e);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
