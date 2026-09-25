import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { isResponse, requirePermission } from "@/lib/auth";

function validateImageBuffer(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;

  const first16 = buffer.subarray(0, 16);
  const matchesJpeg = first16[0] === 0xff && first16[1] === 0xd8 && first16[2] === 0xff;
  const matchesPng =
    first16[0] === 0x89 &&
    first16[1] === 0x50 &&
    first16[2] === 0x4e &&
    first16[3] === 0x47;
  const matchesGif =
    first16[0] === 0x47 &&
    first16[1] === 0x49 &&
    first16[2] === 0x46 &&
    first16[3] === 0x38;
  const matchesWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const matchesAvif =
    buffer.subarray(0, 4).toString("ascii") === "ftyp" ||
    buffer.subarray(4, 8).toString("ascii") === "ftyp";

  const imageMimeMatches = {
    "image/jpeg": matchesJpeg,
    "image/png": matchesPng,
    "image/gif": matchesGif,
    "image/webp": matchesWebp,
    "image/avif": matchesAvif,
  } as const;

  return Boolean(imageMimeMatches[mimeType as keyof typeof imageMimeMatches]);
}

// GET /api/media — list all media
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "media.view");
  if (isResponse(session)) return session;

  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ media });
  } catch (e) {
    console.error("GET /api/media error", e);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST /api/media — upload a new media file
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "media.manage");
  if (isResponse(session)) return session;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || null;
    const title = (formData.get("title") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine file type
    const mimeType = file.type || "application/octet-stream";
    let type = "document";
    if (mimeType.startsWith("image/")) type = "image";
    else if (mimeType.startsWith("video/")) type = "video";

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    // Files served from the public uploads directory share this site's origin.
    // Restrict image uploads to formats that cannot execute script in the visitor's page.
    const allowedImageTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ]);
    if (type === "image" && !allowedImageTypes.has(mimeType)) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, GIF, or AVIF image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (type === "image" && !validateImageBuffer(buffer, mimeType)) {
      return NextResponse.json(
        { error: "Invalid or unsupported image file." },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext =
      path.extname(file.name) ||
      (type === "image"
        ? mimeType === "image/png"
          ? ".png"
          : mimeType === "image/jpeg"
            ? ".jpg"
            : mimeType === "image/webp"
              ? ".webp"
              : mimeType === "image/gif"
                ? ".gif"
                : mimeType === "image/avif"
                  ? ".avif"
                  : ".png"
        : type === "video"
          ? ".mp4"
          : "");
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(uploadsDir, storedName);

    await writeFile(filePath, buffer);

    // Save to database
    const media = await db.media.create({
      data: {
        filename: file.name,
        storedName,
        url: `/uploads/${storedName}`,
        mimeType,
        size: file.size,
        altText,
        title,
        type,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (e) {
    console.error("POST /api/media error", e);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
