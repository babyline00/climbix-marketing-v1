"use client";

import { upload } from "@vercel/blob/client";

/**
 * Client-side upload helper.
 *
 * Files go straight from the browser to Blob storage when the deployment has it
 * configured, which avoids the 4.5 MB serverless request-body limit. Otherwise
 * this falls back to the multipart endpoint, which is correct for `next dev`
 * and for self-hosted containers writing to local disk.
 */

export type MediaUpload = {
  id: string;
  url: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  type: string;
  title: string | null;
  altText: string | null;
};

type UploadMeta = {
  title?: string | null;
  altText?: string | null;
};

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  const message = data && typeof data === "object" && "error" in data ? data.error : null;
  return typeof message === "string" && message ? message : fallback;
}

async function registerDirectUpload(
  file: File,
  blobUrl: string,
  meta: UploadMeta
): Promise<MediaUpload> {
  const res = await fetch("/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: blobUrl,
      filename: file.name,
      title: meta.title ?? null,
      altText: meta.altText ?? null,
    }),
  });

  if (!res.ok) throw new Error(await readError(res, "Upload failed"));
  const data = await res.json();
  return data.media as MediaUpload;
}

async function uploadDirect(file: File, meta: UploadMeta): Promise<MediaUpload> {
  // The browser decides the object path; the server verifies it with head().
  const { url } = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/media/upload-token",
    ...(meta.title ? { metadata: { title: meta.title } } : {}),
  });
  return registerDirectUpload(file, url, meta);
}

async function uploadMultipart(file: File, meta: UploadMeta): Promise<MediaUpload> {
  const formData = new FormData();
  formData.append("file", file);
  if (meta.title) formData.append("title", meta.title);
  if (meta.altText) formData.append("altText", meta.altText);

  const res = await fetch("/api/media", { method: "POST", body: formData });
  if (!res.ok) throw new Error(await readError(res, "Upload failed"));
  const data = await res.json();
  return data.media as MediaUpload;
}

/**
 * Upload a file and return its registered media record.
 *
 * `preferDirect` should come from the `directUpload` flag that GET /api/media
 * returns, so no extra round trip is needed to decide.
 */
export async function uploadMediaFile(
  file: File,
  meta: UploadMeta = {},
  preferDirect = true
): Promise<MediaUpload> {
  if (preferDirect) {
    try {
      return await uploadDirect(file, meta);
    } catch (e) {
      // A direct-upload failure must not silently double-upload through the
      // multipart route, so surface it unless the route is simply missing.
      if (e instanceof TypeError) throw e;
      console.error("Direct upload failed, falling back to multipart", e);
    }
  }
  return uploadMultipart(file, meta);
}