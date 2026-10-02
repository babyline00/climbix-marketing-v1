/**
 * report.js — turn k6's raw JSON output into the per-stage table used by
 * RESULTS_TEMPLATE.md.
 *
 * Usage:
 *   node perf/report.js perf/results/load.json
 *
 * Input is read line-by-line because a 1,000-VU run produces a large file that
 * should not be held in memory as one string. Latency samples are kept for exact
 * percentiles; that is the only unbounded structure and is fine at this scale.
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const input = process.argv[2];
if (!input) {
  console.error("usage: node perf/report.js <k6-json-output>");
  process.exit(1);
}

const stages = new Map(); // name -> {durations:[], failed:0, checks:{pass:0,fail:0}, reqs:0, maxVus:0}
const totals = { reqs: 0, maxVus: 0, iterations: 0 };

function stage(name) {
  if (!stages.has(name)) {
    stages.set(name, { durations: [], failed: 0, failedSamples: 0, checksPass: 0, checksFail: 0, reqs: 0, maxVus: 0 });
  }
  return stages.get(name);
}

function pct(sorted, p) {
  if (!sorted.length) return NaN;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

const rl = readline.createInterface({
  input: fs.createReadStream(input),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (!line.trim()) return;
  let m;
  try {
    m = JSON.parse(line);
  } catch {
    return; // partial trailing line from an interrupted run
  }

  // In k6's JSON output the tags hang off data.tags, not off the top level.
  const tags = (m.data && m.data.tags) || m.tags || null;
  const value = m.data ? m.data.value : undefined;

  // type:"Metric" lines are metric *definitions* emitted at the end of the run
  // (data.name, data.type, no value). Only type:"Point" lines are samples.
  if (m.type === "Metric") return;

  if (m.type !== "Point" || typeof value !== "number") return;

  // Sample points carrying a stage tag can be attributed to a load stage.
  if (tags && tags.stage) {
    const s = stage(tags.stage);
    if (m.metric === "http_req_duration") s.durations.push(value);
    else if (m.metric === "http_req_failed") {
      s.failedSamples++;
      if (value > 0) s.failed++;
    } else if (m.metric === "http_reqs") {
      // One point per request; tagged with the request's own tags.
      s.reqs += value;
      totals.reqs += value;
    }
    return;
  }

  // Untagged points are the periodic counters and the live VU gauge.
  if (m.metric === "http_reqs") totals.reqs += value;
  else if (m.metric === "iterations") totals.iterations += value;
  else if (m.metric === "vus" || m.metric === "vus_max") {
    totals.maxVus = Math.max(totals.maxVus, value);
  }
});

rl.on("close", () => {
  const rows = [];
  let allDurations = [];
  let allFailed = 0;
  let allSamples = 0;

  for (const [name, s] of stages) {
    const d = s.durations.slice().sort((a, b) => a - b);
    allDurations = allDurations.concat(s.durations);
    allFailed += s.failed;
    allSamples += s.failedSamples;
    if (!d.length) continue;
    rows.push({
      stage: name,
      requests: s.reqs,
      avg: d.reduce((a, b) => a + b, 0) / d.length,
      p50: pct(d, 50),
      p95: pct(d, 95),
      p99: pct(d, 99),
      max: d[d.length - 1],
      errRate: s.failedSamples ? (s.failed / s.failedSamples) * 100 : 0,
    });
  }

  allDurations.sort((a, b) => a - b);

  const fmt = (n, w = 6) => (Number.isFinite(n) ? n.toFixed(w <= 5 ? 2 : 0) : "-").padStart(w);
  const w = Math.max(20, ...rows.map((r) => r.stage.length));

  console.log(`\nTotals: ${totals.reqs} requests, ${totals.iterations} iterations, peak ${totals.maxVus} VUs`);
  console.log(`Overall: p50 ${fmt(pct(allDurations, 50), 0)}ms  p95 ${fmt(pct(allDurations, 95), 0)}ms  ` +
              `p99 ${fmt(pct(allDurations, 99), 0)}ms  max ${fmt(allDurations[allDurations.length - 1], 0)}ms  ` +
              `errors ${((allFailed / (allSamples || 1)) * 100).toFixed(2)}%`);

  if (!rows.length) {
    console.log("\nNo per-stage samples found. Was the run started with this version of load-test.js?");
    process.exit(0);
  }

  console.log(`\n| Stage | Requests | avg | p50 | p95 | p99 | max | Error % |`);
  console.log(`| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |`);
  for (const r of rows) {
    console.log(
      `| ${r.stage.padEnd(w)} | ${String(r.requests).padStart(8)} | ${fmt(r.avg)} | ${fmt(r.p50)} | ` +
      `${fmt(r.p95)} | ${fmt(r.p99)} | ${fmt(r.max)} | ${r.errRate.toFixed(2)} |`
    );
  }

  const out = path.join(path.dirname(input), "stages.json");
  fs.writeFileSync(out, JSON.stringify({ totals, rows }, null, 2));
  console.log(`\nWrote ${out}`);
});
