import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

// GET /api/clients/[id] — client with projects & leads
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.view");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: { orderBy: { createdAt: "desc" } },
        leads: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ client });
  } catch (e) {
    console.error("GET /api/clients/[id] error", e);
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 });
  }
}

// PATCH /api/clients/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    const fields = ["name", "company", "email", "phone", "whatsapp", "website", "industry", "country", "city", "address", "status", "notes"];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f] === "" ? null : body[f];
    }
    if (data.name === null) {
      return NextResponse.json({ error: "Client name cannot be empty" }, { status: 400 });
    }

    const client = await prisma.client.update({ where: { id }, data });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "client.update",
      module: "clients",
      details: `Updated client ${client.name}`,
    });

    return NextResponse.json({ client });
  } catch (e) {
    console.error("PATCH /api/clients/[id] error", e);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "leads.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const client = await prisma.client.delete({ where: { id } });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "client.delete",
      module: "clients",
      details: `Deleted client ${client.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/clients/[id] error", e);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
