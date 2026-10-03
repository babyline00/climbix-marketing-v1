/**
 * Cache headers for public read-only API responses.
 *
 * Several public endpoints return richer data to a signed-in user: /api/pages
 * and /api/blog-posts both drop the `status: "published"` filter when a session
 * exists, so an administrator sees drafts. A shared or browser cache that ignored
 * that would serve drafts to logged-out visitors, so the headers are chosen from
 * the session rather than applied unconditionally.
 *
 * Vary: Cookie is required in both cases. Without it a cache could reuse an
 * administrator's response for an anonymous visitor, or vice versa.
 */

/** How long an anonymous visitor may reuse a public JSON response from cache. */
const BROWSER_MAX_AGE = 60;
const SHARED_MAX_AGE = 300;
const STALE_WHILE_REVALIDATE = 600;

/**
 * @param hasSession whether the request carried a valid session.
 * @returns headers to merge into the JSON response.
 */
export function publicReadCacheHeaders(hasSession: boolean): Record<string, string> {
  if (hasSession) {
    // Admin views must always see the current database state, never a cached
    // copy that could include data they have since changed or deleted.
    return { "Cache-Control": "private, no-store", Vary: "Cookie" };
  }
  return {
    "Cache-Control": `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${SHARED_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    Vary: "Cookie",
  };
}
