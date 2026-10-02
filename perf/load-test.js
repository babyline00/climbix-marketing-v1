/**
 * load-test.js — staged ramp 10 → 50 → 100 → 250 → 500 → 750 → 1,000 VUs,
 * a 120s soak at 1,000, then a ramp down. Stages come from test-config.json.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3100 \
 *   k6 run --out json=perf/results/load.json perf/load-test.js
 *
 * Every request is tagged with the stage it belongs to, so the per-stage table in
 * RESULTS_TEMPLATE.md can be filled from real data rather than eyeballed:
 *
 *   node perf/report.js perf/results/load.json
 *
 * A note on honesty: run this against a load generator that is NOT the target
 * server. When both share one machine the numbers describe the generator, not the
 * application. See README.md.
 */
import http from "k6/http";
import { check } from "k6";
import { Rate } from "k6/metrics";
import exec from "k6/execution";

const config = JSON.parse(open("./test-config.json"));
const BASE_URL = __ENV.BASE_URL || config.targets.local;

// Convert the named stages in the config into k6's {duration,target} pairs.
const STAGES = config.stages.map((s) => ({ duration: s.duration, target: s.target }));

const serverErrors = new Rate("server_errors");

function parseDuration(s) {
  const m = /^(\d+)(s|m)$/.exec(s.trim());
  if (!m) throw new Error(`Unparseable duration: ${s}`);
  return (m[1] * (m[2] === "m" ? 60 : 1));
}

// Cumulative boundaries so each request can be attributed to a stage.
const TIMELINE = (() => {
  let acc = 0;
  return config.stages.map((s) => {
    const entry = { name: s.name, start: acc, end: acc + parseDuration(s.duration), target: s.target };
    acc = entry.end;
    return entry;
  });
})();

const TOTAL_SECONDS = TIMELINE[TIMELINE.length - 1].end;

function stageAt(elapsedSec) {
  for (const s of TIMELINE) {
    if (elapsedSec >= s.start && elapsedSec < s.end) return s.name;
  }
  return "after";
}

function weightedPaths(paths) {
  const expanded = [];
  for (const p of paths) {
    for (let i = 0; i < p.weight; i++) expanded.push(p.path);
  }
  return expanded;
}

const PATHS = weightedPaths(config.paths);

export const options = {
  stages: STAGES,
  thresholds: config.thresholds,
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
  discardResponseBodies: false,
};

export function setup() {
  const res = http.get(`${BASE_URL}/`, { tags: { name: "setup" } });
  if (res.status !== 200) {
    throw new Error(`Target not healthy: GET ${BASE_URL}/ returned ${res.status}`);
  }
  console.log(`Load test against ${BASE_URL}`);
  console.log(`Plan: ${config.stages.map((s) => `${s.target}@${s.duration}`).join(" -> ")}`);
  console.log(`Total duration: ${Math.round(TOTAL_SECONDS / 60)}m${TOTAL_SECONDS % 60}s`);
  return { baseUrl: BASE_URL, startedAt: Date.now() };
}

export default function (data) {
  const stage = stageAt((Date.now() - data.startedAt) / 1000);
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];

  const res = http.get(`${data.baseUrl}${path}`, {
    tags: { name: path, stage },
    headers: { Accept: "text/html" },
  });

  serverErrors.add(res.status >= 500);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "content-type is html": (r) => (r.headers["Content-Type"] || "").includes("text/html"),
    "has a document title": (r) => /<title[^>]*>\s*\S/.test(r.body || ""),
  });
}

export function handleSummary(data) {
  const v = (k, f) => {
    const m = data.metrics[k];
    return m && m.values && m.values[f] !== undefined ? m.values[f] : NaN;
  };
  const failed = v("http_req_failed", "rate");
  const checks = v("checks", "rate");
  const pass = failed < 0.01 && checks > 0.99;

  console.log(`\n=== LOAD TEST ${pass ? "PASS" : "FAIL"} ===`);
  console.log(`  target      ${BASE_URL}`);
  console.log(`  iterations  ${v("iterations", "count")}`);
  console.log(`  requests    ${v("http_reqs", "count")}`);
  console.log(`  error rate  ${(failed * 100).toFixed(2)}%  (target < 1%)`);
  console.log(`  5xx rate    ${(v("server_errors", "rate") * 100).toFixed(2)}%  (target < 0.1%)`);
  console.log(`  checks      ${(checks * 100).toFixed(2)}%  (target > 99%)`);
  console.log(`  p95 / p99   ${v("http_req_duration", "p(95)").toFixed(0)}ms / ${v("http_req_duration", "p(99)").toFixed(0)}ms`);
  console.log(`  max         ${v("http_req_duration", "max").toFixed(0)}ms`);

  const raw = `METRICS_JSON ${JSON.stringify({
    target: BASE_URL,
    iterations: v("iterations", "count"),
    requests: v("http_reqs", "count"),
    failed_rate: failed,
    server_errors_rate: v("server_errors", "rate"),
    checks_rate: checks,
    p95: v("http_req_duration", "p(95)"),
    p99: v("http_req_duration", "p(99)"),
    max: v("http_req_duration", "max"),
    data_sent: v("data_sent", "count"),
    data_received: v("data_received", "count"),
  })}`;

  return { stdout: raw, "perf/results/load-summary.json": JSON.stringify(data.metrics, null, 2) };
}
