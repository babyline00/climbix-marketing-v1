/**
 * browser-performance.js — real-browser page performance, not just HTTP timing.
 *
 * k6 tells you the server answered. This tells you what a person experienced:
 * TTFB, LCP, CLS, total transfer weight, long tasks and render-blocking
 * resources. Those are the metrics Google actually uses for Core Web Vitals, and
 * they are invisible to a load test because they happen after the response.
 *
 * Usage:
 *   node perf/browser-performance.js
 *   BASE_URL=https://climbixmarketing.com node perf/browser-performance.js
 *
 * Requires Playwright with a Chromium build:
 *   npm i -D playwright && npx playwright install --with-deps chromium
 *
 * Writes perf/results/browser-<timestamp>.json and prints a markdown table.
 */
const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "test-config.json"), "utf8"));
const BASE_URL = process.env.BASE_URL || config.targets.local;
const BUDGETS = config.browser.budgets;

const PATHS = ["/", "/services", "/services/ppc", "/pricing", "/blog", "/free-tools", "/contact"];

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("playwright is not installed. Run:\n  npm i -D playwright && npx playwright install --with-deps chromium");
  process.exit(2);
}

/**
 * Runs in the page before any document script. Observers must be registered
 * early or LCP and layout-shift entries are missed.
 */
function collectVitals() {
  window.__vitals = { lcp: 0, cls: 0, fcp: 0, longTasks: 0, longTaskTime: 0 };

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__vitals.lcp = e.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }
  }).observe({ type: "layout-shift", buffered: true });

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__vitals.fcp = e.startTime;
  }).observe({ type: "paint", buffered: true });

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__vitals.longTasks++;
      window.__vitals.longTaskTime += e.duration;
    }
  }).observe({ type: "longtask", buffered: true });
}

async function measure(browser, viewport, route) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: !!viewport.isMobile,
    userAgent: viewport.isMobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
  });
  const page = await context.newPage();

  // Transfer size must come from CDP, not the content-length header: compressed
  // and streamed responses routinely omit it, which undercounts page weight badly.
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  let transferBytes = 0;
  const sizes = new Map();
  const heavy = [];

  client.on("Network.responseReceived", (p) => {
    sizes.set(p.requestId, { url: p.response.url, bytes: 0 });
  });
  client.on("Network.loadingFinished", (p) => {
    // encodedDataLength is bytes on the wire, after compression.
    transferBytes += p.encodedDataLength || 0;
    const rec = sizes.get(p.requestId);
    if (rec) {
      rec.bytes += p.encodedDataLength || 0;
      if (rec.bytes > 80 * 1024) heavy.push({ url: rec.url.slice(0, 90), bytes: rec.bytes });
    }
  });

  await page.addInitScript(collectVitals);

  const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "load", timeout: 60000 });

  // LCP and CLS settle after load; give the page a moment to finish painting.
  await page.waitForTimeout(2500);

  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0] || {};
    const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      ttfb: n.responseStart || 0,
      domContentLoaded: n.domContentLoadedEventEnd || 0,
      loadEvent: n.loadEventEnd || 0,
      fcp: fcpEntry ? fcpEntry.startTime : 0,
      lcp: window.__vitals.lcp,
      cls: window.__vitals.cls,
      longTasks: window.__vitals.longTasks,
      longTaskTime: window.__vitals.longTaskTime,
      requests: resources.length,
      renderBlocking: resources.filter(
        (r) => r.renderBlockingStatus === "blocking" || r.renderBlockingStatus === "non_blocking"
      ).length,
      thirdParty: resources.filter((r) => !r.name.startsWith(location.origin)).length,
    };
  });

  const result = {
    route,
    viewport: viewport.name,
    status: response ? response.status() : 0,
    ...nav,
    transferKB: Math.round(transferBytes / 1024),
    heavyResources: heavy.sort((a, b) => b.bytes - a.bytes).slice(0, 5),
  };

  await context.close();
  return result;
}

(async () => {
  // Prefer Playwright's own build, but fall back to a system Chromium so this can
  // run without the ~150 MB download. CHROMIUM_PATH overrides the search.
  const candidates = [
    process.env.CHROMIUM_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ].filter(Boolean);

  let executablePath;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      executablePath = c;
      break;
    }
  }

  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  console.log(`Launching ${executablePath || "bundled chromium"} against ${BASE_URL}\n`);
  const results = [];

  for (const viewport of config.browser.viewports) {
    for (const route of PATHS) {
      try {
        const r = await measure(browser, viewport, route);
        results.push(r);
        console.log(
          `  ${viewport.name.padEnd(8)} ${route.padEnd(16)} status=${r.status} ` +
            `ttfb=${Math.round(r.ttfb)}ms lcp=${Math.round(r.lcp)}ms cls=${r.cls.toFixed(3)} ` +
            `fcp=${Math.round(r.fcp)}ms ~${r.transferKB}KB reqs=${r.requests}`
        );
      } catch (e) {
        console.error(`  ${viewport.name.padEnd(8)} ${route.padEnd(16)} FAILED: ${e.message}`);
        results.push({ route, viewport: viewport.name, error: e.message });
      }
    }
  }

  await browser.close();

  const outDir = path.join(__dirname, "results");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `browser-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(out, JSON.stringify({ baseUrl: BASE_URL, budgets: BUDGETS, results }, null, 2));

  const ok = results.filter((r) => !r.error && r.status === 200);
  const med = (f) => {
    const v = ok.map(f).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : NaN;
  };

  console.log(`\n| Metric | Median | Budget | Verdict |`);
  console.log(`| --- | ---: | ---: | --- |`);
  const rows = [
    ["TTFB", med((r) => r.ttfb), BUDGETS.ttfbMs, "ms", (v) => v < BUDGETS.ttfbMs],
    ["LCP", med((r) => r.lcp), BUDGETS.lcpMs, "ms", (v) => v < BUDGETS.lcpMs],
    ["CLS", med((r) => r.cls), BUDGETS.cls, "", (v) => v < BUDGETS.cls],
  ];
  for (const [name, value, budget, unit, pass] of rows) {
    const shown = name === "CLS" ? value.toFixed(3) : Math.round(value) + unit;
    console.log(`| ${name} | ${shown} | ${budget}${unit} | ${pass(value) ? "PASS" : "FAIL"} |`);
  }

  console.log(`\nWrote ${out}`);
  console.log("Note: INP is not measured — it needs real interaction, which this script does not perform.");
})();
