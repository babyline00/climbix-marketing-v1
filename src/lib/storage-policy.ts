/**
 * Upload policy shared by the API routes and the client-token endpoint.
 * Kept free of server-only imports so both sides can use it.
 */

/**
 * Vercel caps serverless request bodies at 4.5 MB, so files larger than this
 * can only be uploaded through the browser-direct (blob) path.
 */
export const DIRECT_UPLOAD_SIZE_LIMIT = 4 * 1024 * 1024;

/** Upper bound enforced on browser-direct uploads, which bypass that cap. */
export const MAX_DIRECT_UPLOAD_SIZE = 200 * 1024 * 1024;

/** Local-disk limit for documents (matches the historical behaviour). */
export const MAX_LOCAL_DOCUMENT_SIZE = 25 * 1024 * 1024;

// Image formats that cannot execute script in the visitor's page. Uploads live
// on the site's own origin, so SVG and friends are excluded.
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Executables and server-side scripts that must never be accepted. */
export const BLOCKED_EXTENSIONS = [
  ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".sh", ".bash",
  ".ps1", ".jar", ".apk", ".app", ".deb", ".rpm", ".php", ".jsp",
  ".asp", ".aspx", ".dll", ".so", ".bin", ".wsf", ".vbs",
];

export const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};