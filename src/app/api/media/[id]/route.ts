import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";
import { removeUpload } from "@/lib/storage";

// DELETE /api/media/[id] — delete a media file
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(_req, "media.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const media = await db.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Remove the stored object (best effort — may already be gone)
    await removeUpload({
      folder: "media",
      storedName: media.storedName,
      url: media.url,
    });

    // Delete from database
    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/media/[id] error", e);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

// PATCH /api/media/[id] — update alt text / title
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requirePermission(req, "media.manage");
  if (isResponse(session)) return session;

  try {
    const { id } = await params;
    const body = await req.json();
    const { altText, title } = body;

    const data: Record<string, unknown> = {};
    if (altText !== undefined) data.altText = altText;
    if (title !== undefined) data.title = title;

    const media = await db.media.update({ where: { id }, data });
    return NextResponse.json({ media });
  } catch (e) {
    console.error("PATCH /api/media/[id] error", e);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}
