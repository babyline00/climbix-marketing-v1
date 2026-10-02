import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { db } from "@/lib/db";
import { isResponse, requirePermission } from "@/lib/auth";
import {
  DIRECT_UPLOAD_SIZE_LIMIT,
  MAX_DIRECT_UPLOAD_SIZE,
  blobToken,
  buildStoredName,
  isRemoteStorage,
  removeUpload,
  storeUpload,
} from "@/lib/storage";
import {
  ALLOWED_IMAGE_TYPES,
  BLOCKED_EXTENSIONS,
  IMAGE_EXT_BY_MIME,
} from "@/lib/storage-policy";

export const runtime = "nodejs";

// Serverless platforms reject request bodies over 4.5 MB, so the multipart path
// can only accept files below that limit. Bigger files use the browser-direct
// path in /api/media/upload-token, which bypasses the function entirely.
const MAX_MULTIPART_SIZE = DIRECT_UPLOAD_SIZE_LIMIT;

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
    "image/webp": matchesWebp,
    "image/gif": matchesGif,
    "image/avif": matchesAvif,
  } as const;

  return Boolean(imageMimeMatches[mimeType as keyof typeof imageMimeMatches]);
}

function classifyType(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/media — list all media
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "media.view");
  if (isResponse(session)) return session;

  try {
    const media = await db.media.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      media,
      // Lets the client pick the browser-direct upload path without probing.
      directUpload: isRemoteStorage(),
      maxDirectUploadSize: MAX_DIRECT_UPLOAD_SIZE,
    });
  } catch (e) {
    console.error("GET /api/media error", e);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

/**
 * Register a file the browser already pushed straight to Blob storage.
 *
 * The object is verified with `head()` so a caller cannot register an arbitrary
 * external URL as site media — the object must exist in the store that this
 * deployment's token can reach.
 */
async function registerDirectUpload(body: Record<string, unknown>) {
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const altText = typeof body.altText === "string" ? body.altText : null;
  const title = typeof body.title === "string" ? body.title : null;

  if (!url) return jsonError("No file provided", 400);
  if (!filename) return jsonError("File name is required", 400);
  if (filename.length > 200) return jsonError("File name too long (max 200 chars)", 400);
  if (!url.startsWith("https://")) return jsonError("Invalid upload URL", 400);

  // The browser supplied both the URL and the filename, so re-check the
  // extension rather than trusting what was requested at token time.
  const ext = path.extname(filename).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return jsonError(`File type "${ext}" is not allowed`, 400);
  }

  let metadata;
  try {
    metadata = await head(url, { token: blobToken() ?? "" });
  } catch {
    return jsonError("Uploaded file could not be verified", 400);
  }

  // head() only resolves objects on this store, so the URL is known to belong
  // to us. Discard the object when it turns out to be unacceptable.
  const dispose = () => removeUpload({ folder: "media", storedName: filename, url });

  if (!isRemoteStorage()) {
    // No usable Blob token, so there is no store the object could be in.
    return jsonError("Direct upload is not configured", 400);
  }

  const mimeType = metadata.contentType || "application/octet-stream";
  const size = metadata.size;
  if (size <= 0) {
    await dispose();
    return jsonError("File is empty", 400);
  }
  if (size > MAX_DIRECT_UPLOAD_SIZE) {
    await dispose();
    return jsonError("File too large", 400);
  }

  const type = classifyType(mimeType);
  // Files served from the uploads directory share this site's origin.
  // Restrict image uploads to formats that cannot execute script in the page.
  if (type === "image" && !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    await dispose();
    return jsonError("Use a JPG, PNG, WebP, GIF, or AVIF image.", 400);
  }

  // The browser chose the object key (with a random suffix), so derive the
  // stored name from the object path rather than the original filename.
  const objectName = decodeURIComponent(new URL(url).pathname.split("/").pop() || filename);

  const media = await db.media.create({
    data: {
      filename,
      storedName: objectName,
      url,
      mimeType,
      size,
      altText,
      title,
      type,
    },
  });

  return NextResponse.json({ media }, { status: 201 });
}

// POST /api/media — upload a new media file
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "media.manage");
  if (isResponse(session)) return session;

  try {
    if ((req.headers.get("content-type") || "").includes("application/json")) {
      return await registerDirectUpload((await req.json()) as Record<string, unknown>);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || null;
    const title = (formData.get("title") as string) || null;

    if (!file) {
      return jsonError("No file provided", 400);
    }

    const mimeType = file.type || "application/octet-stream";
    const type = classifyType(mimeType);

    if (file.size === 0) {
      return jsonError("File is empty", 400);
    }
    if (file.size > MAX_MULTIPART_SIZE) {
      return jsonError(
        `File too large for direct upload (max ${Math.floor(MAX_MULTIPART_SIZE / (1024 * 1024))}MB). ` +
          "Refresh and retry — larger files switch to direct storage upload.",
        400
      );
    }

    // Uploads land in the web root, so executables and server-side scripts are
    // refused regardless of the declared MIME type.
    const ext = path.extname(file.name).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return jsonError(`File type "${ext}" is not allowed`, 400);
    }

    if (type === "image" && !ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return jsonError("Use a JPG, PNG, WebP, GIF, or AVIF image.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (type === "image" && !validateImageBuffer(buffer, mimeType)) {
      return jsonError("Invalid or unsupported image file.", 400);
    }

    const storedName = buildStoredName(file.name, IMAGE_EXT_BY_MIME[mimeType] ?? "");

    let url: string;
    try {
      ({ url } = await storeUpload({
        folder: "media",
        storedName,
        body: buffer,
        contentType: mimeType,
      }));
    } catch (e) {
      // A read-only filesystem on a serverless platform is the most likely
      // cause, so name the fix instead of returning a bare 500.
      console.error("POST /api/media storage error", e);
      return jsonError(
        isRemoteStorage()
          ? "Failed to save file to storage"
          : "Failed to save file to disk. If this is a serverless deployment, set BLOB_READ_WRITE_TOKEN.",
        500
      );
    }

    try {
      const media = await db.media.create({
        data: {
          filename: file.name,
          storedName,
          url,
          mimeType,
          size: file.size,
          altText,
          title,
          type,
        },
      });

      return NextResponse.json({ media }, { status: 201 });
    } catch (e) {
      // Record failed — don't leave an orphaned object behind.
      await removeUpload({ folder: "media", storedName, url });
      console.error("POST /api/media database error", e);
      return jsonError("Failed to save media record", 500);
    }
  } catch (e) {
    console.error("POST /api/media error", e);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}