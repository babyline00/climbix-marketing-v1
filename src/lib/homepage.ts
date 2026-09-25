import { db } from "@/lib/db";
import { getSectionContent } from "@/lib/section-content-server";
import type { SectionContentMap } from "@/lib/section-content";

/**
 * Homepage CMS data layer.
 * Server Components call this directly (never fetch internal APIs).
 * All queries run in parallel; only active rows, ordered by position.
 * Auto-seeds default sections on first run so the manager is never empty.
 */
export async function getHomeData(): Promise<HomePageData> {
  // Seed default sections once on fresh databases
  const sectionCount = await db.homePageSection.count();
  if (sectionCount === 0) {
    await db.homePageSection.createMany({
      data: DEFAULT_SECTIONS.map((s, i) => ({
        key: s.key,
        label: s.label,
        position: (i + 1) * 10,
        isActive: true,
      })),
    });
  }

  const [sections, trustBadges, clientLogos, testimonials, offers, content] =
    await Promise.all([
      db.homePageSection.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      db.trustBadge.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      db.clientLogo.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      db.testimonial.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
      }),
      db.offer.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { position: "asc" },
      }),
      getSectionContent(),
    ]);

  return {
    sections,
    trustBadges: trustBadges as unknown as TrustBadgeItem[],
    clientLogos,
    testimonials,
    offers: offers.map((o) => ({
      ...o,
      expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null,
    })) as unknown as OfferItem[],
    content,
  };
}

export type HomeSection = {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  position: number;
};

export type TrustBadgeItem = {
  id: string;
  label: string;
  icon: string;
  imageUrl: string | null;
  isActive: boolean;
  position: number;
};

export type ClientLogoItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  website: string | null;
  isActive: boolean;
  position: number;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  isActive: boolean;
  featured: boolean;
  position: number;
};

export type OfferItem = {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  imageUrl: string | null;
  ctaLabel: string;
  ctaHref: string;
  expiresAt: string | null;
  isActive: boolean;
  position: number;
};

export type HomePageData = {
  sections: HomeSection[];
  trustBadges: TrustBadgeItem[];
  clientLogos: ClientLogoItem[];
  testimonials: TestimonialItem[];
  offers: OfferItem[];
  content: SectionContentMap;
};

/**
 * Default section registry — used to seed the DB and as the canonical
 * ordering fallback if the DB has no sections yet.
 */
export const DEFAULT_SECTIONS: { key: string; label: string }[] = [
  { key: "hero", label: "Hero + Strategy Call Form" },
  { key: "trust-badges", label: "Trust Badges" },
  { key: "client-logos", label: "Client Logos" },
  { key: "offers", label: "Offers" },
  { key: "problem", label: "Problem / Stats" },
  { key: "services", label: "Services" },
  { key: "why-us", label: "Why Choose Us" },
  { key: "case-studies", label: "Case Studies" },
  { key: "process", label: "Our Process" },
  { key: "industries", label: "Industries" },
  { key: "locations", label: "Locations" },
  { key: "free-audit", label: "Free Audit Form" },
  { key: "testimonials", label: "Client Reviews" },
  { key: "faq", label: "FAQ" },
  { key: "final-cta", label: "Final CTA" },
];
