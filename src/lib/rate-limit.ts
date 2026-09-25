/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments; protects costly endpoints
 * (LLM chat + ElevenLabs TTS) from abuse.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically evict expired buckets so the map cannot grow unbounded.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000 && buckets.size < 5_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSec: 0,
  };
}

/** Extract a best-effort client identifier from request headers. */
export function clientKey(
  req: Request,
  namespace: string
): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    fwd?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${namespace}:${ip}`;
}
