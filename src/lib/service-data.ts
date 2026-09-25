import "server-only";
import { db } from "@/lib/db";
import {
  getService,
  SERVICES as STATIC_SERVICES,
  type ServiceContent,
} from "@/data/services";
import { CARD_META } from "@/data/service-cards";
import { mergeSection } from "@/lib/section-content";

/**
 * Server data layer for the service catalog.
 *
 * The public site renders services by deep-merging admin-edited rows from
 * the `Service` table over the canonical static defaults in
 * src/data/services.ts. New services created in the admin are DB-only rows
 * built from EMPTY_DATA. The static catalog is also auto-seeded into the DB
 * on first run so the admin manager is never empty.
 */

export type ServiceDataPayload = Pick<
  ServiceContent,
  | "hero"
  | "problem"
  | "framework"
  | "subServices"
  | "process"
  | "results"
  | "faq"
  | "finalCta"
>;

/** Fallback content shape for DB-only (admin-created) services. */
export const EMPTY_SERVICE_DATA: ServiceDataPayload = {
  hero: {
    eyebrow: "",
    headline: "",
    highlight: "growth.",
    subheading: "",
    cta: "Get Started",
  },
  problem: { title: "", intro: "", points: [] },
  framework: { title: "", intro: "", pillars: [] },
  subServices: { title: "What's included", items: [] },
  process: { title: "How we work with you", steps: [] },
  results: { title: "What this delivers", intro: "", metrics: [], blurb: "" },
  faq: [],
  finalCta: { headline: "", subheading: "" },
};

/** Safe JSON parse for stored strings. */
export function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SeedRow = Omit<ServiceContent, "icon"> & { icon: string };

function toSeedRow(s: ServiceContent) {
  return {
    slug: s.slug,
    name: s.name,
    shortName: s.shortName,
    tagline: s.tagline,
    icon: s.icon,
    accent: s.accent,
    border: s.border,
    cardDesc: CARD_META[s.slug]?.desc ?? "",
    cardPoints: JSON.stringify(CARD_META[s.slug]?.points ?? []),
    data: JSON.stringify({
      hero: s.hero,
      problem: s.problem,
      framework: s.framework,
      subServices: s.subServices,
      process: s.process,
      results: s.results,
      faq: s.faq,
      finalCta: s.finalCta,
    } satisfies ServiceDataPayload),
    position: STATIC_SERVICES.findIndex((x) => x.slug === s.slug) * 10,
  };
}

/** Auto-seed the static catalog once so the manager is never empty. */
async function ensureSeeded(): Promise<void> {
  const count = await db.service.count();
  if (count > 0) return;
  await db.service.createMany({ data: STATIC_SERVICES.map(toSeedRow) });
}

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  accent: string;
  border: string;
  cardDesc: string;
  cardPoints: string;
  data: string;
  isActive: boolean;
  position: number;
};

/**
 * Merge a static default and a DB row into a fully-shaped ServiceContent.
 * DB values win; static values fill any gaps.
 */
export function mergeService(
  stat: ServiceContent | undefined,
  row: ServiceRow
): ServiceContent {
  const slug = row.slug;
  const parsed = safeParse<Partial<ServiceDataPayload>>(row.data, {});
  const baseData: ServiceDataPayload = stat
    ? {
        hero: stat.hero,
        problem: stat.problem,
        framework: stat.framework,
        subServices: stat.subServices,
        process: stat.process,
        results: stat.results,
        faq: stat.faq,
        finalCta: stat.finalCta,
      }
    : EMPTY_SERVICE_DATA;
  const data = mergeSection(baseData, parsed);

  const cardPoints = safeParse<string[]>(row.cardPoints, []);
  const cardMeta = CARD_META[slug];

  return {
    slug: row.slug,
    name: row.name || stat?.name || slug,
    shortName: row.shortName || stat?.shortName || row.name,
    tagline: row.tagline || stat?.tagline || "",
    icon: row.icon || stat?.icon || "sparkles",
    accent: row.accent || stat?.accent || "from-brand-500/20 to-brand-700/10",
    border: row.border || stat?.border || "border-brand-500/30",
    ...data,
    cardDesc:
      row.cardDesc ||
      stat?.cardDesc ||
      cardMeta?.desc ||
      data.subServices.items[0]?.name ||
      "",
    cardPoints:
      cardPoints.length > 0
        ? cardPoints
        : stat?.cardPoints ?? cardMeta?.points ?? [],
  } as ServiceContent;
}

/** Synthetic row used to represent a static default that has no DB row. */
function syntheticRow(s: ServiceContent, position: number): ServiceRow {
  return {
    id: `static:${s.slug}`,
    slug: s.slug,
    name: s.name,
    shortName: s.shortName,
    tagline: s.tagline,
    icon: s.icon,
    accent: s.accent,
    border: s.border,
    cardDesc: CARD_META[s.slug]?.desc ?? "",
    cardPoints: JSON.stringify(CARD_META[s.slug]?.points ?? []),
    data: JSON.stringify({
      hero: s.hero,
      problem: s.problem,
      framework: s.framework,
      subServices: s.subServices,
      process: s.process,
      results: s.results,
      faq: s.faq,
      finalCta: s.finalCta,
    } satisfies ServiceDataPayload),
    isActive: true,
    position,
  };
}

export type AdminService = ServiceContent & {
  rowId: string;
  isActive: boolean;
  position: number;
};

/**
 * All services, merged over defaults, in display order. Static defaults
 * whose DB row was deleted are still included (fallback semantics), so the
 * public catalog always reflects the merged view of defaults + admin edits.
 */
export async function getAllServices(
  includeInactive = false
): Promise<ServiceContent[]> {
  await ensureSeeded();
  const rows = await db.service.findMany({ orderBy: { position: "asc" } });
  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));
  const staticBySlug = new Map(STATIC_SERVICES.map((s) => [s.slug, s]));
  const staticOrder = STATIC_SERVICES.map((s) => s.slug);

  const slugs: string[] = [
    ...staticOrder,
    ...Array.from(rowBySlug.keys()).filter((slug) => !staticOrder.includes(slug)),
  ];

  return slugs
    .map((slug, i) => {
      const row = rowBySlug.get(slug);
      const stat = staticBySlug.get(slug);
      if (!row && !stat) return null;
      const merged = mergeService(
        stat,
        row ?? syntheticRow(stat!, i * 10)
      );
      if (!includeInactive && !(row?.isActive ?? true)) return null;
      return merged;
    })
    .filter((s): s is ServiceContent => Boolean(s));
}

/** Merged catalog + row identity (used by the admin manager). */
export async function getAdminServices(): Promise<AdminService[]> {
  await ensureSeeded();
  const all = await getAllServices(true);
  const rows = await db.service.findMany({ orderBy: { position: "asc" } });
  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));
  const staticSet = new Set(STATIC_SERVICES.map((s) => s.slug));

  return all.map((s) => {
    const row = rowBySlug.get(s.slug);
    return {
      ...s,
      rowId: row ? row.id : `static:${s.slug}`,
      isActive: row?.isActive ?? staticSet.has(s.slug),
      position: row?.position ?? 0,
    };
  });
}

/** One merged service by slug, or undefined. */
export async function getServiceData(
  slug: string
): Promise<ServiceContent | undefined> {
  const row = await db.service.findUnique({
    where: { slug: slug.toLowerCase() },
  });
  const stat = getService(row?.slug ?? slug.toLowerCase());
  if (!row && !stat) return undefined;
  return mergeService(
    stat,
    row ?? syntheticRow(stat!, STATIC_SERVICES.findIndex((s) => s.slug === stat!.slug) * 10)
  );
}