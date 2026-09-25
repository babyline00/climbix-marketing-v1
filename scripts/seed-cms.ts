/**
 * Seed the Homepage CMS with demo content (idempotent).
 * Run: bun run scripts/seed-cms.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEFAULT_SECTIONS = [
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

const TRUST_BADGES = [
  { label: "Google Certified Partner", icon: "badge-check" },
  { label: "500+ Campaigns Delivered", icon: "award" },
  { label: "Results in 90 Days", icon: "zap" },
  { label: "4.9/5 Client Rating", icon: "star" },
  { label: "Dedicated Strategist", icon: "shield-check" },
];

const CLIENT_LOGOS = [
  { name: "NexaCloud" },
  { name: "Flowdesk" },
  { name: "Quantly" },
  { name: "Pinnacle" },
  { name: "BrightPath" },
  { name: "LeadForge" },
  { name: "Skyline SaaS" },
  { name: "Vertex" },
];

const TESTIMONIALS = [
  {
    name: "Aisha Rahman",
    role: "VP Marketing",
    company: "NexaCloud",
    quote:
      "The team helped us significantly improve our organic visibility and generate more qualified leads. Within two quarters, our organic pipeline became our largest source of new business.",
    rating: 5,
    featured: true,
  },
  {
    name: "Daniel Okafor",
    role: "Founder & CEO",
    company: "LeadForge",
    quote:
      "We had traffic but no leads. Climbix Marketing rebuilt our funnel from the ground up — content, SEO, and CRO working together. The change in pipeline quality was immediate.",
    rating: 5,
    featured: true,
  },
  {
    name: "Mira Tanaka",
    role: "Head of Growth",
    company: "Quantly",
    quote:
      "Their AI search optimization work got us cited in ChatGPT and Perplexity for our core category. That visibility is now driving a steady stream of high-intent demo requests.",
    rating: 5,
    featured: false,
  },
  {
    name: "Samuel Park",
    role: "CMO",
    company: "BrightPath",
    quote:
      "Strategic, transparent, and relentless about ROI. The dashboards actually tie activity to revenue — finally an agency that speaks the language of business outcomes.",
    rating: 5,
    featured: false,
  },
  {
    name: "Lena Volkov",
    role: "Director of Demand Gen",
    company: "Pinnacle",
    quote:
      "We cut our cost per acquisition by 38% in the first 90 days. The retargeting and CRO experiments paid for the entire engagement before the quarter ended.",
    rating: 4,
    featured: false,
  },
  {
    name: "Omar Haddad",
    role: "Co-founder",
    company: "Skyline SaaS",
    quote:
      "Best decision we made this year. Our organic revenue is up 95% YoY and we finally have a content engine that compounds instead of one-off campaigns.",
    rating: 5,
    featured: false,
  },
];

async function main() {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Sections
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
    console.log(`Seeded ${DEFAULT_SECTIONS.length} homepage sections`);
  }

  // Trust badges
  if ((await db.trustBadge.count()) === 0) {
    await db.trustBadge.createMany({
      data: TRUST_BADGES.map((b, i) => ({
        ...b,
        position: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${TRUST_BADGES.length} trust badges`);
  }

  // Client logos
  if ((await db.clientLogo.count()) === 0) {
    await db.clientLogo.createMany({
      data: CLIENT_LOGOS.map((l, i) => ({
        ...l,
        position: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${CLIENT_LOGOS.length} client logos`);
  }

  // Testimonials
  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({
      data: TESTIMONIALS.map((t, i) => ({
        ...t,
        position: (i + 1) * 10,
        isActive: true,
      })),
    });
    console.log(`Seeded ${TESTIMONIALS.length} testimonials`);
  }

  // Offers
  if ((await db.offer.count()) === 0) {
    await db.offer.createMany({
      data: [
        {
          title: "Free SEO Audit — Worth $500",
          description:
            "Get a comprehensive 30-point SEO audit of your website covering technical health, content gaps, and backlink profile. Completely free, no strings attached.",
          badge: "LIMITED TIME",
          ctaLabel: "Claim Free Audit",
          ctaHref: "#free-audit",
          expiresAt: expires,
          position: 10,
          isActive: true,
        },
        {
          title: "20% Off Your First Month",
          description:
            "Start any performance marketing or SEO retainer this month and get 20% off your first month. Includes onboarding and a dedicated growth strategist.",
          badge: "NEW CLIENTS",
          ctaLabel: "Schedule a Call",
          ctaHref: "#strategy-call",
          expiresAt: expires,
          position: 20,
          isActive: true,
        },
        {
          title: "Free AI Search Visibility Report",
          description:
            "Find out if ChatGPT, Perplexity and Google AI Overviews recommend your brand — and what to fix if they don't. Delivered within 5 business days.",
          badge: "FREE",
          ctaLabel: "Get the Report",
          ctaHref: "#strategy-call",
          expiresAt: null,
          position: 30,
          isActive: true,
        },
      ],
    });
    console.log("Seeded 3 offers");
  }

  console.log("CMS seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
