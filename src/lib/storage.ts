import "server-only";

import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
import {
  DIRECT_UPLOAD_SIZE_LIMIT,
  IMAGE_EXT_BY_MIME,
  MAX_DIRECT_UPLOAD_SIZE,
} from "@/lib/storage-policy";

export { DIRECT_UPLOAD_SIZE_LIMIT, MAX_DIRECT_UPLOAD_SIZE };

/**
 * Upload storage.
 *
 * Serverless platforms (Vercel, AWS Lambda) mount the app directory read-only,
 * so `public/uploads` can never be written at runtime there. Uploads therefore
 * go to Vercel Blob when BLOB_READ_WRITE_TOKEN is configured, and fall back to
 * local disk for `next dev` and self-hosted/standalone containers.
 */
export type StorageProvider = "blob" | "disk";

/** Subdirectory of `public/uploads` used for a given asset kind. */
export type UploadFolder = "media" | "documents";

const FOLDER_PREFIX: Record<UploadFolder, string> = {
  media: "uploads",
  documents: "uploads/documents",
};

/**
 * The Blob token, or null when Blob is not usable.
 *
 * Trimmed and length-checked rather than just truthy: an env var set to an
 * empty string — what you get from clearing a dashboard field or copying an
 * example env file — is truthy, which would select Blob and then fail every
 * write with an opaque auth error instead of falling back to disk.
 */
export function blobToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? token : null;
}

export function storageProvider(): StorageProvider {
  return blobToken() ? "blob" : "disk";
}

/** True when uploads are stored remotely rather than on the local filesystem. */
export function isRemoteStorage(): boolean {
  return storageProvider() === "blob";
}

/** MIME type recorded for an object that the browser uploaded directly. */
export function extForMime(mimeType: string): string {
  return IMAGE_EXT_BY_MIME[mimeType] ?? "";
}

/**
 * Resolve a path inside the uploads directory, refusing anything that escapes
 * it (`..`, absolute paths). `folder` maps to the same relative path that Blob
 * uses, so both providers share one layout.
 */
function resolveInUploads(folder: UploadFolder, storedName: string): string {
  const publicDir = path.resolve(process.cwd(), "public");
  const dir = path.resolve(publicDir, FOLDER_PREFIX[folder]);
  const resolved = path.resolve(dir, storedName);
  const relative = path.relative(dir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative === "") {
    throw new Error("Invalid upload path");
  }
  // Defence in depth: never let a write escape the public directory.
  if (!resolved.startsWith(publicDir + path.sep)) {
    throw new Error("Invalid upload path");
  }
  return resolved;
}

function blobPathname(folder: UploadFolder, storedName: string): string {
  return `${FOLDER_PREFIX[folder]}/${storedName}`;
}

export type StoredUpload = {
  /** Public URL to store on the database row. */
  url: string;
  /** Object key/pathname, used to delete the object later. */
  pathname: string;
};

/** Write bytes to the configured provider and return its public URL. */
export async function storeUpload(args: {
  folder: UploadFolder;
  storedName: string;
  body: Buffer;
  contentType?: string;
}): Promise<StoredUpload> {
  const { folder, storedName, body, contentType } = args;
  const pathname = blobPathname(folder, storedName);
  const token = blobToken();

  if (token) {
    const result = await put(pathname, body, {
      access: "public",
      addRandomSuffix: false, // storedName is already unique
      token,
      ...(contentType ? { contentType } : {}),
    });
    return { url: result.url, pathname };
  }

  const filePath = resolveInUploads(folder, storedName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);
  // Served as a static asset, so the URL is relative to `public`.
  const url = `/${path.relative(path.resolve(process.cwd(), "public"), filePath)
    .split(path.sep)
    .join("/")}`;
  return { url, pathname };
}

/**
 * Remove a previously stored upload.
 *
 * `url` is the value persisted on the database row: a blob URL for remote
 * storage, or a `/uploads/...` path for local disk. Deletion is best-effort —
 * callers must not fail the request because the object is already gone.
 */
export async function removeUpload(args: {
  folder: UploadFolder;
  storedName: string;
  url: string;
}): Promise<void> {
  const { folder, storedName, url } = args;
  const token = blobToken();
  try {
    if (token) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        await del(url, { token });
      }
      return;
    }

    const filePath = resolveInUploads(folder, storedName);
    if (existsSync(filePath)) await unlink(filePath);
  } catch (e) {
    console.error("removeUpload failed", { folder, storedName, message: (e as Error).message });
  }
}

/** Build a collision-resistant server-side filename from an original name. */
export function buildStoredName(originalName: string, fallbackExt = ""): string {
  const ext = (path.extname(originalName) || fallbackExt).toLowerCase();
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${stamp}-${rand}${ext}`;
}