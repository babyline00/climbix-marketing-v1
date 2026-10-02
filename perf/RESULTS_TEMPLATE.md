# Performance Report — <target>

Copy this file, fill every cell, and delete the guidance. **Do not leave a cell
blank: write `Not measured` or `N/A (reason)`.** An empty cell reads as a pass.

## Run identity

| Field | Value |
| --- | --- |
| Target | |
| Environment | local standalone / Vercel preview / production |
| Commit | |
| Date (UTC) | |
| Generator | k6 v__, on __ cores, __ GB RAM |
| Generator independent of target? | yes / **no** |

> If "Generator independent of target?" is **no**, the concurrency numbers below
> describe the generator's limits, not the application's capacity. Say so in the
> summary and do not publish them as a capacity result.

---

## 1. Load profile

Staged ramp, executed as configured in `test-config.json`:

```
10 → 50 → 100 → 250 → 500 → 750 → 1000 VUs → 120s soak → ramp down
```

| Stage | Requests | avg | p50 | p95 | p99 | max | Error % |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | | | | | | | |
| ramp-50 | | | | | | | |
| ramp-100 | | | | | | | |
| ramp-250 | | | | | | | |
| ramp-500 | | | | | | | |
| ramp-750 | | | | | | | |
| ramp-1000 | | | | | | | |
| soak-1000 | | | | | | | |

Generate this table with:

```bash
node perf/report.js perf/results/load.json
```

## 2. SLO verdict

| Metric | Target | Measured | Verdict |
| --- | --- | --- | --- |
| HTTP error rate | < 1 % | | |
| p95 response | < 1.5 s | | |
| p99 response | < 3 s | | |
| Functional checks | > 99 % | | |
| 5xx rate | ≈ 0 | | |
| Recovery after test | required | | |

Recovery means: within one stage after load stops, error rate returns to baseline
and p95 returns to pre-test values. Record the observation, not an assumption.

## 3. Core Web Vitals

From `perf/browser-performance.js`, medians across all routes and both viewports.

| Metric | Median | p75 | Worst route | Budget | Verdict |
| --- | ---: | ---: | --- | ---: | --- |
| TTFB | | | | 800 ms | |
| LCP | | | | 2.5 s | |
| CLS | | | | 0.1 | |
| INP | | | | 200 ms | |

## 4. Page weight

| Route | Desktop KB | Mobile KB | Requests | Largest asset |
| --- | ---: | ---: | ---: | --- |
| / | | | | |
| /pricing | | | | |
| /services | | | | |
| /blog | | | | |
| /free-tools | | | | |
| /contact | | | | |

Total page weight is measured as bytes on the wire via CDP `encodedDataLength`,
after compression.

## 5. Server

| Metric | Value | Source |
| --- | --- | --- |
| CPU | | |
| RAM | | |
| Network | | |
| Function invocations | | |
| DB connections | | |
| CDN cache hit ratio | | |

## 6. SEO

| Check | Result | Notes |
| --- | --- | --- |
| robots.txt | | |
| sitemap.xml | | |
| Canonicals | | |
| Indexability | | |
| Redirects | | |
| Broken links | | |
| Metadata | | |
| Schema | | |
| Internal linking | | |

## 7. Security

| Check | Result | Notes |
| --- | --- | --- |
| HSTS | | |
| CSP | | |
| Security headers | | |
| Cookies | | |
| CSRF | | |
| Rate limiting | | |
| Admin exposure | | |

## 8. Conversion

| Check | Result | Notes |
| --- | --- | --- |
| CTA destinations | | |
| Forms | | |
| AI Search Report flow | | |
| Audit flow | | |
| Mobile UX | | |
| Pricing consistency | | |
| Trust signals | | |

## 9. Findings

Ordered by user impact, each with evidence. Separate "observed" from "suspected".

| # | Severity | Finding | Evidence | Action |
| --- | --- | --- | --- | --- |
| 1 | | | | |

## 10. Summary

State plainly what was and was not measured. List what would need to happen to
produce a credible production capacity number.
