# Performance audit package

Load testing and page-performance measurement for `climbixmarketing.com`.

| File | Purpose |
| --- | --- |
| `test-config.json` | Single source of truth: targets, traffic mix, thresholds, stages, vitals budgets |
| `smoke.js` | 10-VU safety test. Run this before anything else |
| `load-test.js` | Staged ramp to 1,000 VUs with a 120 s soak |
| `report.js` | Turns raw k6 JSON into the per-stage table in the report |
| `browser-performance.js` | Real Chromium: TTFB, LCP, CLS, page weight |
| `DEEP_AUDIT_PLAN.md` | Server, website, SEO, security and conversion criteria |
| `RESULTS_TEMPLATE.md` | Report format |
| `results/` | Output. Generated, not committed |

## Prerequisites

```bash
# k6 — any recent version; developed against v2.3.0
curl -L https://github.com/grafana/k6/releases/latest \
  | tar -xz -C /tmp && install /tmp/k6-*/k6 /usr/local/bin/k6

# Playwright for the browser pass
npm i -D playwright
# A system Chromium is used automatically if one exists. To force it:
export CHROMIUM_PATH=/usr/bin/chromium
```

## Running

### 1. Start a target

For local work, run the built standalone server:

```bash
npm run build
set -a; source .env; set +a
PORT=3100 HOSTNAME=127.0.0.1 NODE_ENV=production node .next/standalone/server.js
```

### 2. Smoke test first

```bash
k6 run --env BASE_URL=http://127.0.0.1:3100 perf/smoke.js
```

Ten users for 30 seconds. Exits non-zero if any threshold is breached. If this
fails, a full run tells you nothing.

### 3. Load test

```bash
BASE_URL=http://127.0.0.1:3100 \
  k6 run --out json=perf/results/load.json perf/load-test.js

node perf/report.js perf/results/load.json
```

`report.js` streams the JSON line by line; a full run produces a large file.

### 4. Browser pass

```bash
BASE_URL=http://127.0.0.1:3100 node perf/browser-performance.js
```

### Targeting other environments

```bash
BASE_URL=https://climbixmarketing.com k6 run --env BASE_URL=... perf/smoke.js
```

`BASE_URL` always overrides `test-config.json`, so no file edits are needed
between targets.

## Traffic mix

Weighted, so the mix approximates a real session rather than hammering one page:

| Path | Weight |
| --- | ---: |
| `/` | 30 |
| `/pricing` | 15 |
| `/services` | 15 |
| `/case-studies` | 10 |
| `/blog` | 10 |
| `/services/ppc` | 5 |
| `/services/performance-marketing` | 5 |
| `/free-tools` | 5 |
| `/contact` | 5 |

All nine return 200 as of the last check. If a slug is removed, the corresponding
weight should go too — a 404 inflates the error rate and hides real failures.

## Thresholds

Defined in `test-config.json` and enforced by k6, so the exit code is the verdict.

| Metric | Threshold |
| --- | --- |
| `http_req_failed` | `rate < 0.01` |
| `http_req_duration` | `p(95) < 1500`, `p(99) < 3000` |
| `checks` | `rate > 0.99` |
| `server_errors` | `rate < 0.001` |

`server_errors` counts only 5xx. 4xx is tracked separately because a 404 means a
bad path choice while a 5xx means the server broke — merging them hides the
failure the test exists to catch.

## Honesty constraints

These matter more than the numbers.

**A load number is not a capacity result unless the generator is separate from
the target.** Running k6 and the app on one machine makes the box the bottleneck;
at high VU counts you are measuring the generator. The report has a field for
this. Fill it in honestly.

**Local numbers describe local.** The standalone server has no CDN, no edge cache
and no `x-vercel-cache`. Local TTFB says nothing about production TTFB.

**Static pages bypass the application.** Most of this traffic mix is prerendered
and served straight from disk or the edge, so a passing run says little about
function or database behaviour. The dynamic routes that actually invoke a function
are under `/api/*` — and `/api/leads` is deliberately rate-limited to 6/min and
`/api/meetings` to 5/min. Including them in a high-VU run will produce 429s by
design. Test them separately with dedicated thresholds.

**Cold starts need a cache-busting request.** A VU loop against warm prerendered
pages never measures a cold start.

**Unattended runs do not equal production traffic.** Real visitors cluster, use
browsers with different capabilities, and retry. k6 is a controlled experiment,
not a traffic model.

## Regenerating

`results/` holds raw JSON from each run. It is disposable — delete it and re-run.
`RESULTS_TEMPLATE.md` is the format for the write-up; produce a separate results
file per run and label the environment on every row.
