/**
 * smoke.js — 10-user safety test.
 *
 * Purpose: prove the target is up and serving correct HTML before committing to
 * the full ramp. This is the only script intended to be run against production.
 *
 * Usage:
 *   k6 run --env BASE_URL=http://127.0.0.1:3100 perf/smoke.js
 *   BASE_URL=https://climbixmarketing.com k6 run perf/smoke.js
 *
 * Exits non-zero if any threshold in test-config.json is breached, so it can be
 * used as a gate before a load run.
 */
import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";

const config = JSON.parse(open("./test-config.json"));

// BASE_URL wins so the same script can target local, a preview, or production.
const BASE_URL = __ENV.BASE_URL || config.targets.local;
const SMOKE = config.smoke;

// 5xx is separated from 4xx on purpose: a 404 means we picked a bad path, while
// a 5xx means the server broke under load. Collapsing them hides the failure the
// test exists to catch.
const serverErrors = new Rate("server_errors");

function weightedPaths(paths) {
  const expanded = [];
  for (const p of paths) {
    for (let i = 0; i < p.weight; i++) expanded.push(p.path);
  }
  return expanded;
}

const PATHS = weightedPaths(config.paths);

export const options = {
  vus: SMOKE.vus,
  duration: SMOKE.duration,
  thresholds: config.thresholds,
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

export function setup() {
  const res = http.get(`${BASE_URL}/`, { tags: { name: "setup" } });
  if (res.status !== 200) {
    throw new Error(`Target not healthy: GET ${BASE_URL}/ returned ${res.status}`);
  }
  console.log(`Smoke test against ${BASE_URL} — ${SMOKE.vus} VUs for ${SMOKE.duration}`);
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];
  const res = http.get(`${data.baseUrl}${path}`, {
    tags: { name: path },
    headers: { Accept: "text/html" },
  });

  serverErrors.add(res.status >= 500);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "content-type is html": (r) => (r.headers["Content-Type"] || "").includes("text/html"),
    "body is not empty": (r) => (r.body || "").length > 500,
    "has a document title": (r) => /<title[^>]*>\s*\S/.test(r.body || ""),
    "no error marker in body": (r) => !/Internal Server Error|Application error/i.test(r.body || ""),
  });
}

export function handleSummary(data) {
  const m = data.metrics;
  const line = (k) => (m[k] && m[k].values ? m[k].values : {});
  const failed = m.http_req_failed ? line("http_req_failed")["rate"] : undefined;
  const checks = m.checks ? line("checks")["rate"] : undefined;
  const dur = line("http_req_duration");
  const errs = line("server_errors");

  const verdict = failed !== undefined && failed < 0.01 && checks !== undefined && checks > 0.99;
  console.log(`\n=== SMOKE ${verdict ? "PASS" : "FAIL"} ===`);
  console.log(`  target      ${BASE_URL}`);
  console.log(`  requests    ${m.http_reqs ? m.http_reqs.values.count : "?"}`);
  console.log(`  error rate  ${failed !== undefined ? (failed * 100).toFixed(2) + "%" : "?"} (target < 1%)`);
  console.log(`  5xx rate    ${errs.rate !== undefined ? (errs.rate * 100).toFixed(2) + "%" : "?"}`);
  console.log(`  checks      ${checks !== undefined ? (checks * 100).toFixed(2) + "%" : "?"} (target > 99%)`);
  console.log(`  p95 / p99   ${dur["p(95)"] !== undefined ? dur["p(95)"].toFixed(0) : "?"}ms / ${dur["p(99)"] !== undefined ? dur["p(99)"].toFixed(0) : "?"}ms`);
  console.log(`  iterations  ${m.iterations ? m.iterations.values.count : "?"}`);
  return { stdout: textSummary(data, { indent: "  ", disableColors: true }) };
}

function textSummary(data, opts) {
  // Avoid a dependency on jslib; the k6 built-in is not available without an
  // import, so emit a compact table ourselves.
  const rows = [];
  for (const [name, metric] of Object.entries(data.metrics)) {
    if (!metric.values) continue;
    const v = metric.values;
    const body = Object.entries(v)
      .map(([k, val]) => `${k}=${typeof val === "number" ? val.toFixed(3) : val}`)
      .join("  ");
    rows.push(`${name.padEnd(24)} ${body}`);
  }
  return `${rows.join("\n")}\n`;
}
