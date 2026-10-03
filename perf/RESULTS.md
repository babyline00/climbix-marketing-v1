# Performance Report — local standalone (`http://127.0.0.1:3100`)

## Run identity

| Field | Value |
| --- | --- |
| Target | local Next.js standalone server, `next build` output |
| Environment | local, 12 cores / 15 GB RAM shared with k6 and Postgres |
| Commits | baseline `d6621e5`+working tree → optimised `4a47899` |
| Date | 2026-10-02 |
| Generator | k6 v2.3.0 on the same machine as the target |
| Generator independent of target? | **no** |
| Browser | system Chromium via Playwright 1.63.0 |

> Because the generator shares the machine with the target, the concurrency
> figures below describe **this box's ceiling**, not production capacity. They
> are valid for comparing two builds on identical hardware, which is how they
> are used here. They are not a capacity claim.

---

## 1. Core Web Vitals

Medians over 7 routes × 2 viewports, measured with CDP observers.

| Metric | Before | After | Change | Target | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| LCP | 936 ms | 236 ms | **−75 %** | < 1,000 ms | PASS |
| FCP | 306 ms | 228 ms | −25 % | < 500 ms | PASS |
| TTFB | 18 ms | 13 ms | −28 % | < 100 ms | PASS |
| CLS | 0.000 | 0.000 | — | < 0.1 | PASS |
| INP | — | — | — | < 200 ms | **NOT MEASURED** |

Per-route LCP (desktop / mobile), before → after:

| Route | Before | After |
| --- | ---: | ---: |
| `/` | 1204 ms | 368 ms |
| `/services` | 256 ms | 216 ms |
| `/services/ppc` | 976 ms | 240 ms |
| `/pricing` | 1108 ms | 248 ms |
| `/blog` | 1000 ms | 236 ms |
| `/free-tools` | 324 ms | 244 ms |
| `/contact` | 196 ms | 228 ms |

Every route now reports LCP equal to FCP, i.e. LCP is bounded by first paint
rather than by an animation.

**INP was not credibly measured.** Two attempts produced only 1 and 2 scored
interactions. A single 136 ms reading was discarded rather than reported as a
pass — n=1 is not a sample. Automated interaction also navigates away from the
page, which tears down the observer. Measure it with Lighthouse interaction
mode, the DevTools Performance panel on a real user flow, or `web-vitals` RUM in
production.

## 2. Page weight

Transfer bytes via CDP `encodedDataLength` (post-compression, not `content-length`,
which is absent on compressed responses).

| Route | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | ---: | ---: | ---: | ---: |
| `/` | 1185 KB | 809 KB (−32 %) | 933 KB | 571 KB (−39 %) |
| `/pricing` | 1137 KB | 764 KB (−33 %) | 887 KB | 527 KB (−41 %) |
| `/services` | 1297 KB | 914 KB (−30 %) | 575 KB | 575 KB |
| `/blog` | 1280 KB | 895 KB (−30 %) | 1037 KB | 663 KB |

Homepage asset breakdown, raw bytes:

| Metric | Before | After |
| --- | ---: | ---: |
| JS chunks | 19 | 15 |
| JS raw | 2,778 KB | 1,176 KB (−58 %) |
| JS gzipped | — | 368 KB |
| Admin-only JS+CSS in payload | 1,630 KB (tiptap 998, recharts 414, recharts CSS 219) | 0 KB |

## 2b. Repeat-visit caching

Measured with a fresh browser context (empty HTTP cache, no service worker)
against the same context after it had been primed.

| Metric | Cold (first visit) | Warm (repeat visit) | Change |
| --- | ---: | ---: | ---: |
| Transferred bytes | 685 KB | 0 KB | **−100 %** |
| First Contentful Paint | 336 ms | 156 ms | **−54 %** |
| TTFB | 61 ms | 10 ms | −84 % |
| DOMContentLoaded | 141 ms | 57 ms | −60 % |
| Requests | 59 | 75 | +16 |

Transfer of 0 KB means every subresource was served from the service worker or
the HTTP cache. Request count rises because cached navigation still issues the
subresource requests; they resolve locally rather than over the network.

Three layers, each with a different safety rule:

**HTTP cache headers on public reads** (`src/lib/cache-headers.ts`). Anonymous
visitors get `public, max-age=60, s-maxage=300, stale-while-revalidate=600` with
`Vary: Cookie`; a signed-in user gets `private, no-store`. The split is required
because `/api/pages` and `/api/blog-posts` drop the `status: "published"` filter
when a session exists, so one shared cache policy would either leak drafts to
the public or serve admins stale data. Both paths verified.

**Service worker** (`public/sw.js`). Caches only `/_next/static/*`
(content-hashed, so a cached entry cannot be stale) and `/_next/image`, both
cache-first. Capped at 120 and 80 entries with oldest-first eviction. Nothing is
precached on install, because a precache pins one build and hands visitors a
stale shell after every deploy.

**Offline fallback.** Navigations are network-first; the cached copy is used
only when the network fails. Verified: with the network disabled the homepage
still returns 200 with correct content.

Deliberately not cached: `/api/*`, in both layers. Verified no API entry appears
in any service-worker cache.

The agent widget previously fetched `/api/agent/config` with `cache: "no-store"`,
which defeated any caching; it now uses the HTTP cache.

First-load performance is unaffected: median LCP 224 ms, TTFB 18 ms, CLS 0.000
with the worker registered.

## 3. Load test

Staged ramp 10 → 1,000 VUs, 120 s soak, ramp down. Thresholds: error rate
< 1 %, p95 < 1,500 ms, p99 < 3,000 ms, checks > 99 %, 5xx ≈ 0.

| Metric | Before | After | Change | Target | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| Requests completed | 308,315 | 422,192 | **+37 %** | — | — |
| Iterations | 308,314 | 422,191 | +37 % | — | — |
| p50 | 980 ms | 853 ms | −13 % | — | — |
| p95 | 1588 ms | 1084 ms | **−32 %** | < 1500 ms | **before FAIL → after PASS** |
| p99 | 2398 ms | 1189 ms | **−50 %** | < 3000 ms | PASS |
| Error rate | 1.90 % | 1.09 % | −43 % | < 1 % | still FAIL |
| Functional checks | 98.10 % | 98.91 % | +0.8 pt | > 99 % | still FAIL |
| 5xx rate | 0.00 % | 0.00 % | — | ≈ 0 | PASS |
| Max latency | 60,016 ms | 60,007 ms | — | — | timeout |

### Per stage

| Stage | VUs | avg before | avg after | Δ | p95 before | p95 after | Δ | err% before | err% after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 10 | 13 ms | 10 ms | −23 % | 30 ms | 25 ms | −17 % | 0.00 | 0.00 |
| ramp-50 | 50 | 74 ms | 59 ms | −20 % | 155 ms | 106 ms | −32 % | 0.00 | 0.00 |
| ramp-100 | 100 | 202 ms | 156 ms | −23 % | 277 ms | 233 ms | −16 % | 0.00 | 0.00 |
| ramp-250 | 250 | 422 ms | 360 ms | −15 % | 602 ms | 534 ms | −11 % | 0.00 | 0.00 |
| ramp-500 | 500 | 1085 ms | 842 ms | −22 % | 1190 ms | 946 ms | −20 % | 0.22 | 0.06 |
| ramp-750 | 750 | 1943 ms | 1451 ms | −25 % | 2000 ms | 1144 ms | −43 % | 1.42 | 0.78 |
| ramp-1000 | 1000 | 1470 ms | 1222 ms | −17 % | 1960 ms | 1132 ms | −42 % | 4.71 | 2.40 |
| soak-1000 | 1000 | 1378 ms | 1064 ms | −23 % | 1686 ms | 994 ms | −41 % | 5.50 | 2.97 |
| ramp-down | — | 983 ms | 720 ms | −27 % | 1575 ms | 976 ms | −38 % | 1.52 | 0.57 |

### Why the remaining thresholds fail

Latency grows linearly with VUs in both runs, with throughput plateauing near
350–420 req/s. Linear growth plus zero 5xx plus a 60 s ceiling is **queueing**,
not application errors: the single-process Node server and k6 are contending for
the same 12 cores. The 1.09 % failures are k6 hitting its default 60 s request
timeout, not the server returning errors.

The fix is infrastructure, not code: run the generator away from the target, and
put a CDN in front so static pages never reach the origin. Note that almost all
of this traffic mix is prerendered, so a large share of these requests are
static file reads rather than application work.

## 4. Server

Not measured. CPU, RAM, event-loop lag, file descriptors and GC were not
collected during the run. Requires a separate run with the generator off-box.

| Metric | Value |
| --- | --- |
| CPU | Not measured |
| RAM | Not measured |
| Event loop | Not measured |
| DB connections | Not measured |
| CDN cache hit ratio | Not measurable locally (no CDN, no `x-vercel-cache`) |

## 5. Database

| Item | Finding |
| --- | --- |
| `Media(createdAt)` index added | Matches `GET /api/media`, which sorts every row newest-first with no `take`. Verified created. |
| `BlogPost(status, publishedAt)` index added | Matches three call sites filtering `status` and ordering `publishedAt`. Verified created. |
| Measured gain | **None.** `EXPLAIN` still returns `Seq Scan on "Media"`, correctly — at 21 rows Postgres will not choose an index. `BlogPost` has 0 rows. Preventive only. |

Seven models carry a `createdAt` column with no index. Only the two used by an
actual sort were indexed; the rest were left alone rather than indexed speculatively.

`contains` search in `/api/search` cannot use a btree index and would need
trigram or full-text indexing. Not changed — not worth it at current row counts.

## 6. SEO

Not measured in this pass. Required checks: sitemap `lastmod` accuracy,
canonicals, indexability, redirect chains, broken internal links, per-page
metadata uniqueness, JSON-LD validity. The audit procedure is in
`DEEP_AUDIT_PLAN.md` § 3.

## 7. Security

Not measured in this pass. One relevant fact from earlier work: HSTS is emitted
only when `NODE_ENV === "production"` and must be confirmed present on the live
domain. See `DEEP_AUDIT_PLAN.md` § 4.

## 8. Conversion

Not measured. The `#admin` regression check *was* performed, since the lazy-load
change touched it: the panel renders on `/#admin`, 17 chunks fetch on demand,
and the footer link plus notification-email deep links still work.

## 9. Findings

| # | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| 1 | High | Public homepage shipped the admin bundle. A static import of `AdminPanel` pulled tiptap (998 KB) and recharts (414 KB + 219 KB CSS) into the initial payload. | Import trace; 19 → 15 chunks, 2778 → 1176 KB |
| 2 | High | Above-the-fold headings faded in from `opacity: 0`, so LCP waited for the animation rather than for paint. | Homepage LCP 1204 ms vs FCP 306 ms |
| 3 | Medium | `report.js` mis-parsed k6 output and printed `NaN` totals. Per-stage latency was always right; totals were wrong. | `type:"Metric"` lines have no `value` |
| 4 | Medium | All six Prisma migrations are unapplied to the dev database; it was created with `db push`. Dev/prod schema drift is invisible. | `prisma migrate status` |
| 5 | Medium | framer-motion is 80 KB gzipped of the 368 KB homepage JS, across 24 site components. | Bundle analysis |
| 6 | Low | Seven models have an unindexed `createdAt`; two sorts are now indexed. | `EXPLAIN` Seq Scan |
| 7 | Low | INP has no credible measurement. | n=1 and n=2 interaction samples discarded |
| 8 | Info | Page-weight measurement using `content-length` undercounted 78 KB against an actual 1.1 MB, because compressed responses omit the header. | `browser-performance.js` now reads CDP `encodedDataLength` |
| 9 | Medium | Repeat visits re-downloaded the whole site: no browser cache on API reads and no service worker. | Warm visit transferred 685 KB |
| 10 | Medium | `/api/agent/config` was fetched with `cache: "no-store"`, forcing a round trip on every page load. | `voice-agent-widget.tsx` |

## 10. What a production capacity number would require

1. k6 on separate infrastructure, or a managed load-test service.
2. Simultaneous observation of Vercel function metrics, edge cache hit ratio,
   and Postgres connection/IO stats.
3. A traffic mix that includes the dynamic `/api/*` routes. The current mix is
   almost entirely prerendered, so it largely bypasses the application.
   `/api/leads` (6/min) and `/api/meetings` (5/min) are deliberately
   rate-limited and will 429 by design — they need their own thresholds.
5. Cold-start measurement, which needs cache-busting requests between idle
   periods.
6. INP from real interaction, ideally RUM in production.

## 11. Reproducing

```bash
npm run build
set -a; source .env; set +a
PORT=3100 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js

k6 run --quiet perf/smoke.js
BASE_URL=http://127.0.0.1:3100 k6 run --out json=perf/results/load.json perf/load-test.js
node perf/report.js perf/results/load.json
BASE_URL=http://127.0.0.1:3100 node perf/browser-performance.js
```
