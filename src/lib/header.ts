import { db } from "@/lib/db";

/**
 * Header CMS data layer.
 * Server Components call this directly (never fetch internal APIs).
 * Auto-seeds the default navigation on fresh databases so the header
 * and the admin manager are never empty.
 */

export type HeaderLinkItem = {
  id: string;
  label: string;
  href: string;
  kind: string; // link | services | industries | company | resources
  isSystem: boolean;
  isActive: boolean;
  position: number;
};

export type SitePopupItem = {
  id: string;
  title: string;
  message: string;
  badge: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  customHtml: string | null;
  isActive: boolean;
  delaySeconds: number;
  showEveryDays: number;
};

export type HeaderData = {
  links: HeaderLinkItem[];
  popup: SitePopupItem | null;
};

/**
 * Default header navigation — used to seed the DB and as the canonical
 * fallback if the DB has no links yet. "kind" drives special behaviour:
 * dropdowns (services/industries/company/resources) or plain links.
 */
export const DEFAULT_HEADER_LINKS: {
  label: string;
  href: string;
  kind: string;
}[] = [
  { label: "Services", href: "/services", kind: "services" },
  { label: "Industries", href: "/industries", kind: "industries" },
  { label: "Company", href: "/about", kind: "company" },
  { label: "Resources", href: "/blog", kind: "resources" },
  { label: "Locations", href: "/locations", kind: "link" },
  { label: "Pricing", href: "/pricing", kind: "link" },
  { label: "Contact", href: "/contact", kind: "link" },
];

/** Valid kinds accepted by the header links API */
export const HEADER_LINK_KINDS = [
  "link",
  "services",
  "industries",
  "company",
  "resources",
] as const;

export async function getHeaderData(): Promise<HeaderData> {
  // Seed default links once on fresh databases
  const linkCount = await db.headerLink.count();
  if (linkCount === 0) {
    await db.headerLink.createMany({
      data: DEFAULT_HEADER_LINKS.map((l, i) => ({
        label: l.label,
        href: l.href,
        kind: l.kind,
        isSystem: true,
        position: (i + 1) * 10,
        isActive: true,
      })),
    });
  }

  const [links, popupRows] = await Promise.all([
    db.headerLink.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
    db.sitePopup.findFirst({ where: { isActive: true } }),
  ]);

  return {
    links,
    popup: popupRows
      ? {
          id: popupRows.id,
          title: popupRows.title,
          message: popupRows.message,
          badge: popupRows.badge,
          ctaLabel: popupRows.ctaLabel,
          ctaHref: popupRows.ctaHref,
          imageUrl: popupRows.imageUrl,
          customHtml: (popupRows as { customHtml?: string | null }).customHtml ?? null,
          isActive: popupRows.isActive,
          delaySeconds: popupRows.delaySeconds,
          showEveryDays: popupRows.showEveryDays,
        }
      : null,
  };
}
