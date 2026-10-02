# Deep Audit Plan — climbixmarketing.com

Technical, SEO, security, UX and conversion audit. Each section defines **what is
measured**, **how**, and **what counts as a failure**, so results are reproducible
rather than opinionated.

## Rules of evidence

1. **One metric, one source.** Do not copy a Lighthouse score from a third-party
   page; run it. Scores vary by machine, run and throttling profile.
2. **Label every number with its environment.** "Local standalone", "Vercel
   preview" and "production" are different systems. Never present local numbers as
   production capacity.
3. **A load number without an independent generator is not a capacity result.**
   See README.md § Honesty constraints.
4. **Record the commit.** `git rev-parse --short HEAD` next to every result.

---

## 1. Server and infrastructure

| Metric | Source | Failure condition |
| --- | --- | --- |
| Origin response time | k6 `http_req_duration`, 1 VU | p95 > 800 ms |
| Serverless function duration | Vercel dashboard → Functions | p95 approaching the plan `maxDuration` |
| Cold start | k6 with cache-busting query string | first request after idle > 2 s |
| 5xx rate | custom `server_errors` Rate | > 0.1 % |
| Function invocation limits | Vercel plan page | > 80 % of daily/monthly cap |
| DB connection pool | Prisma + Postgres `max_connections` | saturation under load |
| Memory | dashboard / `docker stats` | OOM kills, or > 85 % sustained |
| CDN cache hit ratio | Vercel dashboard → Edge Network | < 90 % for static pages |

**Note on the local box.** The standalone server has no CDN and no
`x-vercel-cache`, so cache-hit ratio is unmeasurable locally. Measure it in
production only.

**Check for `maxDuration`.** `next.config.ts` sets `output: "standalone"` and no
`maxDuration`, so functions inherit the plan default (10 s on Hobby). Under load
that is the most likely first failure.

---

## 2. Website and Core Web Vitals

Run `perf/browser-performance.js`. Thresholds follow Google's "good" boundaries.

| Metric | Good | Needs work | Poor |
| --- | --- | --- | --- |
| LCP | ≤ 2.5 s | ≤ 4.0 s | > 4.0 s |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| INP | ≤ 200 ms | ≤ 500 ms | > 500 ms |

Also record:

- **TTFB** — budget 800 ms.
- **Total page weight** — target < 1 MB compressed; > 2 MB is a defect.
- **Request count** per page. Above ~70 warrants investigation.
- **Largest JS chunk** — over 200 KB is usually an un-split dependency.
- **Third-party scripts** — count and bytes; every one is main-thread contention.
- **Long tasks** (> 50 ms) during load.
- **Image sizing** — any image served wider than its CSS box.

**INP requires real interaction** and is not produced by the current script.
Measure it with Chrome DevTools or Lighthouse interaction mode, and say which.

---

## 3. SEO

- `robots.txt` — must not block `/admin`, sitemap reference present, no
  `Disallow: /`.
- `sitemap.xml` — regenerate, then confirm every URL returns 200 and that
  `lastmod` values are real, not the build timestamp on every entry.
- **Canonicals** — self-referencing and absolute on every indexable page.
- **Indexability** — no `noindex` on pages that should rank; check
  `/admin/*` and `/api/*` are not indexable.
- **Redirects** — no chains, no loops, no 302 where 301 belongs.
- **Broken links** — crawl internal links, verify status codes.
- **Metadata** — unique title and description per page; check for truncation at
  ~60 / ~155 characters.
- **Structured data** — validate JSON-LD; must match visible content or it is a
  manual-action risk.
- **Internal linking** — orphan pages; pages reachable only from the sitemap.
- **OG/Twitter cards** — an absolute image URL, not a relative path.
- Lighthouse SEO category ≥ 95.

---

## 4. Security

| Check | Expected |
| --- | --- |
| HSTS | present, `max-age ≥ 31536000`, `includeSubDomains` |
| CSP | present and enforced (`Content-Security-Policy-Report-Only` is not enough) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` / `frame-ancestors` | set |
| `Referrer-Policy` | set |
| `Permissions-Policy` | camera/mic/geolocation restricted |
| Cookies | `HttpOnly`, `Secure`, `SameSite=Lax|Strict`, no session in `localStorage` |
| CSRF | state-changing routes reject cross-origin; check cookie-authenticated POSTs |
| Rate limiting | `/api/leads` and `/api/meetings` return 429 under burst |
| Admin exposure | `/admin` not indexed, not linked publicly, auth on every sub-route |
| Upload safety | executables rejected; uploads served from a separate origin where possible |
| Dependencies | `npm audit` — triage, don't just report |
| Secrets | no secrets in client bundles (`NEXT_PUBLIC_*` only) |

Note that `next.config.ts` sets HSTS only when `NODE_ENV === "production"`;
confirm it is actually present on the production domain.

---

## 5. Conversion

- **CTA destinations** — every primary CTA resolves; no dead or placeholder links.
- **Forms** — `/contact`, strategy call, audit request: validate, show success and
  error states, confirm a submission lands in the database.
- **AI Search Report flow** — completes end to end; no dead end, no silent failure.
- **Audit flow** — same, including the free-audit entry point.
- **Mobile UX** — tap targets ≥ 44 px, no horizontal scroll, forms usable with a
  keyboard, menu reachable by thumb.
- **Pricing** — internally consistent, CTA on the page, no contradicting plans.
- **Trust signals** — testimonials and logos resolve to real images; no lorem
  ipsum; no unverifiable claims.

---

## 6. Reporting

Fill in `RESULTS_TEMPLATE.md`. Every row needs a value, a source and a date. Write
"Not measured" where something was skipped — never leave a blank that reads as a
pass.
