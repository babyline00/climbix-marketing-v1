import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";

export const runtime = "nodejs";

const DOCUMENT_CATEGORIES = ["general", "contract", "proposal", "invoice", "report", "design", "other"];
const RELATED_TYPES = ["project", "client", "lead", "staff"] as const;

// PATCH /api/documents/[id] — rename, recategorize, reassign, edit notes
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "documents.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const data: Record<string, string | null> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      if (name.length > 200)
        return NextResponse.json({ error: "Name too long (max 200 chars)" }, { status: 400 });
      data.name = name;
    }
    if (body.category !== undefined) {
      if (!DOCUMENT_CATEGORIES.includes(String(body.category)))
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      data.category = String(body.category);
    }
    if (body.notes !== undefined) {
      data.notes = body.notes ? String(body.notes) : null;
    }
    if (body.relatedType !== undefined) {
      const rt = String(body.relatedType || "");
      const relatedId = String(body.relatedId || "").trim();
      if (!rt || rt === "none") {
        data.relatedType = null;
        data.relatedId = null;
        data.relatedName = null;
      } else {
        if (!(RELATED_TYPES as readonly string[]).includes(rt))
          return NextResponse.json({ error: "Invalid related type" }, { status: 400 });
        if (!relatedId)
          return NextResponse.json({ error: `Please select the ${rt}` }, { status: 400 });
        const model = rt === "staff" ? "user" : rt;
        const delegate = (prisma as unknown as Record<string, { findUnique: (args: Record<string, unknown>) => Promise<unknown> }>)[model];
        const record = (await delegate?.findUnique({
          where: { id: relatedId },
          select: { name: true },
        })) as { name: string } | null;
        if (!record)
          return NextResponse.json({ error: `Selected ${rt} no longer exists` }, { status: 400 });
        data.relatedType = rt;
        data.relatedId = relatedId;
        data.relatedName = record.name;
      }
    }

    const updated = await prisma.document.update({ where: { id }, data });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "document.update",
      module: "documents",
      details: `Updated document ${updated.name}`,
    });

    return NextResponse.json({ document: updated });
  } catch (e) {
    console.error("PATCH /api/documents/[id] error", e);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

// DELETE /api/documents/[id] — remove record and file from disk
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "documents.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await prisma.document.delete({ where: { id } });

    // Best-effort file removal (record already gone)
    try {
      await unlink(path.join(process.cwd(), "public", "uploads", "documents", doc.storedName));
    } catch {
      /* file may already be gone */
    }

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "document.delete",
      module: "documents",
      details: `Deleted document ${doc.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/documents/[id] error", e);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
