/*
 * Service worker — runtime caching for repeat visits.
 *
 * Scope is deliberately narrow. Only two classes of response are ever cached:
 *
 *   1. /_next/static/*  — content-hashed filenames, so a cached copy can never
 *                         be stale. Safe to serve from cache first.
 *   2. /_next/image*    — resized image variants, also hashed by parameters.
 *
 * Navigations are network-first and only fall back to cache when the network
 * fails, so an online visitor always gets fresh HTML. That cached copy exists
 * for offline use, not as a speed trick.
 *
 * /api/* is never cached. Several endpoints (/api/pages, /api/blog-posts) return
 * drafts to a signed-in user and only published content to anyone else, so
 * caching them here would risk serving unpublished content to a visitor.
 * Those routes rely on HTTP cache headers instead, which are session-aware.
 *
 * Nothing is precached on install: a precache would pin one build's assets and
 * hand visitors a stale app shell after every deploy.
 */

const VERSION = "climbix-v1";
const STATIC_CACHE = `${VERSION}-static`;
const IMAGE_CACHE = `${VERSION}-images`;
const PAGE_CACHE = `${VERSION}-pages`;

/** Cap on cached entries per cache, oldest evicted first. */
const STATIC_MAX = 120;
const IMAGE_MAX = 80;
const PAGE_MAX = 12;

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // Cache keys are insertion-ordered, so the head is the oldest.
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

self.addEventListener("install", (event) => {
  // Take over promptly rather than waiting for every tab to close, so a
  // freshly deployed build is picked up on the next navigation.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => !n.startsWith(VERSION))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  // Only store complete, successful, same-origin responses.
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
    void trimCache(cacheName, maxEntries);
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
      void trimCache(PAGE_CACHE, PAGE_MAX);
    }
    return response;
  } catch (err) {
    // Offline: serve the last good copy rather than a browser error page.
    const hit = await cache.match(request);
    if (hit) return hit;
    const anyHit = await cache.match("/");
    if (anyHit) return anyHit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API traffic, including when an admin is signed in.
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, STATIC_MAX));
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, IMAGE_MAX));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
  // Everything else falls through to the network untouched.
});
