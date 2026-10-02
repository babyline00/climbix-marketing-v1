import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isResponse, requirePermission } from "@/lib/auth";
import { blobToken } from "@/lib/storage";
import { ALLOWED_IMAGE_TYPES, BLOCKED_EXTENSIONS, MAX_DIRECT_UPLOAD_SIZE } from "@/lib/storage-policy";

export const runtime = "nodejs";

/**
 * Issues a short-lived client token so the browser can push files to Blob
 * directly. This bypasses the 4.5 MB serverless request-body limit that
 * /api/media and /api/documents are subject to.
 *
 * Returns 404 when Blob is not configured so callers fall back to the
 * multipart endpoints.
 */
export async function POST(req: NextRequest) {
  const session = await requirePermission(req, "media.manage");
  if (isResponse(session)) return session;

  if (!blobToken()) {
    return NextResponse.json({ error: "Direct upload not configured" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // handleUpload dispatches on `type`: the client-token request is the only one
  // that needs a permission check, the completion callback is signed by Blob.
  const isTokenRequest =
    typeof body === "object" &&
    body !== null &&
    (body as { type?: unknown }).type === "blob.generate-client-token";

  if (isTokenRequest) {
    const pathname = (body as { payload?: { pathname?: unknown } }).payload?.pathname;
    const name = typeof pathname === "string" ? pathname : "";
    const filename = name.split("/").pop() || "";
    const ext = filename.includes(".")
      ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
      : "";

    // Same restrictions the server-side multipart routes enforce. Extensions
    // are checked here; the content type is enforced by allowedContentTypes
    // below and re-verified with head() at registration.
    if (!ext) {
      return NextResponse.json({ error: "File name must have an extension" }, { status: 400 });
    }
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type "${ext}" is not allowed` },
        { status: 400 }
      );
    }
  }

  try {
    // handleUpload returns a plain JSON body (the client token, or an ack for
    // the completion callback), so it must be wrapped in a Response.
    const result = await handleUpload({
      body: body as Parameters<typeof handleUpload>[0]["body"],
      request: req,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: MAX_DIRECT_UPLOAD_SIZE,
        // Objects are served from a public origin, so the allow-list is what
        // stops an HTML/SVG upload from being served as script. Anything not
        // listed here is refused by Blob before a byte is stored.
        allowedContentTypes: [
          ...ALLOWED_IMAGE_TYPES,
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/plain",
          "text/csv",
          "application/zip",
        ],
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("direct media upload completed", { url: blob.url, by: session.user.id });
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/media/upload-token error", e);
    return NextResponse.json({ error: "Failed to prepare upload" }, { status: 500 });
  }
}