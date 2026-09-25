import "server-only";
import { prisma } from "./db-alias";

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  enabled: boolean;
}

export async function getRedirects(): Promise<RedirectRule[]> {
  const rows = await prisma.redirect.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    destination: r.destination,
    statusCode: r.statusCode,
    enabled: r.enabled,
  }));
}

interface RedirectMap {
  destination: string;
  statusCode: number;
}

let cachedMap: { map: Record<string, RedirectMap>; at: number } | null = null;

/** Redirect rule table with a 30s in-memory TTL — safe for proxy/middleware (Node runtime). */
export async function getRedirectMap(ttlMs = 30_000): Promise<Record<string, RedirectMap>> {
  const now = Date.now();
  if (cachedMap && now - cachedMap.at < ttlMs) return cachedMap.map;

  const rows = await prisma.redirect.findMany({ where: { enabled: true } });
  const map: Record<string, RedirectMap> = {};
  for (const r of rows) {
    map[r.source] = { destination: r.destination, statusCode: r.statusCode };
  }
  cachedMap = { map, at: now };
  return map;
}

/** Normalize a source path: ensure leading "/", drop trailing slashes. */
export function normalizeSource(input: string): string {
  let p = input.trim();
  if (!p) return p;
  if (!p.startsWith("/")) p = `/${p}`;
  return p.replace(/\/+$/, "") || "/";
}