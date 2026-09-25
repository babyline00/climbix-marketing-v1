import "server-only";
import { createSign } from "node:crypto";
import { getSettings } from "./settings";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_API = "https://webmasters.googleapis.com/webmasters/v3";

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function signJwt(claims: Record<string, unknown>, privateKey: string): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify(claims));
  const data = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(data).sign(privateKey, "base64url");
  return `${data}.${signature}`;
}

async function fetchAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const cacheKey = `gsc-${clientEmail}`;
  const globalStore = globalThis as unknown as { __gscToken?: { key: string; token: string; exp: number } };
  if (globalStore.__gscToken?.key === cacheKey && globalStore.__gscToken.exp > Date.now() + 60_000) {
    return globalStore.__gscToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    privateKeyPem
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GSC token exchange failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  globalStore.__gscToken = {
    key: cacheKey,
    token: data.access_token,
    exp: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscReport {
  configured: boolean;
  dimensions: "query" | "page";
  startDate: string;
  endDate: string;
  rows: GscRow[];
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  error?: string;
}

function totalsOf(rows: GscRow[]): GscReport["totals"] {
  const clicks = rows.reduce((a, r) => a + r.clicks, 0);
  const impressions = rows.reduce((a, r) => a + r.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: rows.length ? rows.reduce((a, r) => a + r.position, 0) / rows.length : 0,
  };
}

/** Fetch Search Analytics from Google Search Console (service-account auth). */
export async function getGscReport(
  startDate: string,
  endDate: string,
  dimension: "query" | "page" = "query"
): Promise<GscReport> {
  const s = await getSettings();
  const clientEmail = s["integrations.gscServiceAccountEmail"];
  const privateKey = s["integrations.gscPrivateKey"];
  const siteUrl = s["integrations.gscSiteUrl"];
  if (!clientEmail || !privateKey || !siteUrl) {
    return { configured: false, dimensions: dimension, startDate, endDate, rows: [], totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 } };
  }

  const token = await fetchAccessToken(clientEmail, privateKey);
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(`${SEARCH_API}/sites/${encodedSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: [dimension],
      rowLimit: 25,
      dimensionFilterGroups: [],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      configured: true,
      dimensions: dimension,
      startDate,
      endDate,
      rows: [],
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      error: `Search Console API error (${res.status}): ${text.slice(0, 300)}`,
    };
  }

  const data = (await res.json()) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
  const rows: GscRow[] = (data.rows || []).map((r) => ({
    keys: r.keys,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
  return {
    configured: true,
    dimensions: dimension,
    startDate,
    endDate,
    rows,
    totals: totalsOf(rows),
  };
}