/**
 * Homepage section content layer.
 * Every homepage section exposes an editable content shape (headline,
 * intro, item lists). Defaults mirror the original hardcoded copy so the
 * site renders identically on a fresh database. Admin edits are stored in
 * the SectionContent table as JSON and deep-merged over these defaults.
 */

export type SectionItem = Record<string, string>;

export type HeroContent = {
  badge: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  proofs: SectionItem[]; // { label }
};

export type LabeledListContent = {
  eyebrow: string;
  title: string;
  intro: string;
};

export type ProblemContent = LabeledListContent & {
  points: SectionItem[]; // { title, desc }
  footerNote: string;
  footerLinkLabel: string;
};

export type ServicesContent = LabeledListContent & {
  ctaLabel: string;
  ctaHref: string;
};

export type WhyUsContent = LabeledListContent & {
  reasons: SectionItem[]; // { title, desc }
  funnelTitle: string;
  funnelIntro: string;
  funnel: SectionItem[]; // { label, desc }
};

export type CaseStudiesContent = LabeledListContent & {
  cases: SectionItem[]; // { client, challenge, strategy, metric1Label, metric1Value, metric2Label, metric2Value, metric3Label, metric3Value }
  ctaLabel: string;
  ctaHref: string;
};

export type ProcessContent = LabeledListContent & {
  steps: SectionItem[]; // { title, desc }
};

export type IndustriesContent = LabeledListContent & {
  ctaLabel: string;
  ctaHref: string;
};

export type LocationsContent = LabeledListContent & {
  points: string[];
  locations: SectionItem[]; // { country, city, flag }
};

export type FreeAuditContent = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
};

export type TestimonialsContent = {
  eyebrow: string;
  title: string;
  ratingNote: string;
};

export type FaqContent = LabeledListContent & {
  items: SectionItem[]; // { q, a }
};

export type FinalCtaContent = {
  eyebrow: string;
  headline: string;
  subheading: string;
  ctaLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  note: string;
};

export type ItemsSectionContent = {
  eyebrow: string;
  title: string;
  intro: string;
};

/**
 * Sections whose items render an uploaded image at an admin-chosen, uniform
 * size. The height is stored as a string because section content is JSON that
 * round-trips through free-text form fields.
 */
export type ImageStripContent = ItemsSectionContent & {
  imageHeight: string;
  /**
   * Whether the item's text label is shown next to its image. Stored as a
   * string because section content is JSON that round-trips through free-text
   * form fields; anything other than "false" is treated as on.
   */
  showText: string;
};

/**
 * Resolve the text-label toggle. Defaults to on, so existing sections that
 * predate this field keep rendering their labels.
 */
export function resolveShowText(raw: unknown): boolean {
  return String(raw ?? "true") !== "false";
}

/** Guard rails for the image height, in CSS pixels. */
export const IMAGE_HEIGHT_MIN = 14;
export const IMAGE_HEIGHT_MAX = 96;
export const DEFAULT_IMAGE_HEIGHT = 32;

/** Presets offered in the admin size control. */
export const IMAGE_HEIGHT_PRESETS = [16, 20, 24, 28, 32, 40, 48, 64,85,100,128];

/**
 * Coerce an admin-entered height into a safe pixel value. Section content is
 * edited as free text, so this is the only thing standing between a typo and a
 * zero-height or 100000px-tall logo strip.
 */
export function clampImageHeight(
  raw: unknown,
  fallback: number = DEFAULT_IMAGE_HEIGHT
): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(IMAGE_HEIGHT_MAX, Math.max(IMAGE_HEIGHT_MIN, Math.round(n)));
}

export type SectionContentMap = {
  hero: HeroContent;
  "trust-badges": ImageStripContent;
  "client-logos": ImageStripContent;
  offers: ItemsSectionContent;
  problem: ProblemContent;
  services: ServicesContent;
  "why-us": WhyUsContent;
  "case-studies": CaseStudiesContent;
  process: ProcessContent;
  industries: IndustriesContent;
  locations: LocationsContent;
  "free-audit": FreeAuditContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  "final-cta": FinalCtaContent;
};

export type SectionKey = keyof SectionContentMap;

/**
 * Canonical default copy for every homepage section.
 * Values mirror the original in-component copy.
 */
export const SECTION_CONTENT_DEFAULTS: SectionContentMap = {
  hero: {
    badge: "Global SEO, AI Search & Lead Generation Agency",
    headline: "Turn Search Visibility Into Revenue.",
    subheadline:
      "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
    ctaLabel: "Schedule a Strategy Call",
    secondaryLabel: "See How We Work",
    secondaryHref: "/services",
    proofs: [
      { label: "No long-term contracts" },
      { label: "Onboarding within 48 hours" },
      { label: "Talk to a strategist, not a bot" },
    ],
  },
  "trust-badges": {
    eyebrow: "Trusted by teams worldwide",
    title: "Recognized. Certified. Proven.",
    intro:
      "We hold ourselves to the same standards we hold your campaigns to — which is why teams across 18+ countries trust Climbix with their growth.",
    imageHeight: "20",
    showText: "true",
  },
  "client-logos": {
    eyebrow: "Client roster",
    title: "Companies that grow with Climbix",
    intro:
      "From venture-backed startups to established enterprises — a snapshot of the brands we partner with.",
    imageHeight: "32",
    showText: "true",
  },
  offers: {
    eyebrow: "Current offers",
    title: "Start with an advantage",
    intro:
      "Limited-time engagements and free resources to help you move faster — with zero risk.",
  },
  problem: {
    eyebrow: "The Growth Problem",
    title: "Your business doesn't need more marketing. It needs a growth system.",
    intro:
      "Most businesses don't have a traffic problem — they have a visibility, targeting, and conversion problem. Generic marketing tactics only amplify those issues. Here's what we see every day:",
    points: [
      {
        title: "Traffic but no leads",
        desc: "You're getting visitors, but they aren't converting into qualified opportunities.",
      },
      {
        title: "Expensive advertising",
        desc: "Cost per acquisition keeps rising while campaign ROI stays flat or declines.",
      },
      {
        title: "Low Google rankings",
        desc: "Competitors outrank you on the keywords that actually drive revenue.",
      },
      {
        title: "Poor conversion rates",
        desc: "Your site and funnels leak leads at every step of the buyer journey.",
      },
    ],
    footerNote: "Sound familiar? Let's fix it together.",
    footerLinkLabel: "See the solution",
  },
  services: {
    eyebrow: "One Growth System. Multiple Channels.",
    title: "What we do — growth, engineered.",
    intro:
      "Every service we offer ties back to one outcome: business growth. We don't sell vanity metrics. We don't sell rankings for rankings' sake. We build a connected growth system where visibility becomes traffic, traffic becomes qualified leads, and leads become revenue.",
    ctaLabel: "Explore Our Services",
    ctaHref: "/services",
  },
  "why-us": {
    eyebrow: "Why businesses choose us",
    title: "We build predictable growth systems.",
    intro:
      "Most agencies sell rankings. We sell business growth. Here's what makes our approach fundamentally different from the typical full-service digital marketing shop.",
    reasons: [
      {
        title: "Strategy before execution",
        desc: "We don't use one-size-fits-all marketing. Every engagement starts with a deep audit of your business, competitors, and market — so the tactics we deploy actually move the metrics that matter to you, not just vanity numbers.",
      },
      {
        title: "Data-driven decisions",
        desc: "Every recommendation we make is backed by data — search volume, intent signals, conversion analytics, and revenue attribution. No gut-feel campaigns. No guesses. Just measurable experiments and proven patterns.",
      },
      {
        title: "Global expertise",
        desc: "Strategies designed for competitive international markets. We've helped businesses across 18+ countries rank, convert, and scale — whether you're targeting North America, EMEA, APAC, or emerging markets.",
      },
      {
        title: "Focus on ROI",
        desc: "We focus on business growth — not vanity metrics. Traffic is a means to an end. Every report we send ties activity back to qualified leads, pipeline, and revenue so you always know what you're paying for.",
      },
    ],
    funnelTitle: "Our growth model",
    funnelIntro:
      "We don't sell traffic. We engineer a system that turns visibility into revenue — step by step.",
    funnel: [
      { label: "Visibility", desc: "Get found on Google & AI search" },
      { label: "Traffic", desc: "Attract the right audience" },
      { label: "Qualified Leads", desc: "Convert visitors into prospects" },
      { label: "Conversions", desc: "Turn prospects into customers" },
      { label: "Revenue", desc: "Scale predictable growth" },
    ],
  },
  "case-studies": {
    eyebrow: "Real results. Real businesses.",
    title: "Growth that compounds, quarter after quarter.",
    intro:
      "We measure success the same way you do — in pipeline, revenue, and retention. Here's a snapshot of the outcomes we've driven for clients across SaaS, B2B, and ecommerce.",
    cases: [
      {
        client: "SaaS — Workflow Platform",
        challenge: "Low organic traffic, heavy paid acquisition dependency",
        strategy: "SEO + Content + Lead Magnets",
        metric1Label: "Organic Traffic",
        metric1Value: "+250%",
        metric2Label: "Qualified Leads",
        metric2Value: "+180%",
        metric3Label: "Revenue",
        metric3Value: "+120%",
      },
      {
        client: "B2B — Professional Services",
        challenge: "Expensive paid ads with poor conversion",
        strategy: "PPC Audit + CRO + Retargeting",
        metric1Label: "Cost / Acquisition",
        metric1Value: "-40%",
        metric2Label: "More Leads",
        metric2Value: "+200%",
        metric3Label: "ROAS",
        metric3Value: "+165%",
      },
      {
        client: "Ecommerce — DTC Brand",
        challenge: "Stagnant revenue, low brand visibility",
        strategy: "AI Search + Content + Technical SEO",
        metric1Label: "AI Citations",
        metric1Value: "+340%",
        metric2Label: "Organic Revenue",
        metric2Value: "+95%",
        metric3Label: "Avg. Order Value",
        metric3Value: "+22%",
      },
    ],
    ctaLabel: "See all case studies",
    ctaHref: "/case-studies",
  },
  process: {
    eyebrow: "Our process",
    title: "How we grow your business",
    intro:
      "A repeatable, transparent five-stage process designed to compound growth over time — not a one-off campaign that fades after launch.",
    steps: [
      {
        title: "Discover",
        desc: "We start by understanding your business, customers, competitors, and current growth bottlenecks — backed by audit data, not assumptions.",
      },
      {
        title: "Strategy",
        desc: "We build a custom growth strategy with prioritized channels, target keywords, content roadmap, and measurable milestones tied to revenue.",
      },
      {
        title: "Execute",
        desc: "We launch SEO, ads, and content campaigns in tight sprints — with weekly visibility, shared dashboards, and clear ownership of every workstream.",
      },
      {
        title: "Optimize",
        desc: "We continuously optimize based on data — doubling down on what works, cutting what doesn't, and refining the funnel at every stage.",
      },
      {
        title: "Scale",
        desc: "We scale the strategies that prove profitable — expanding into new keywords, audiences, geographies, and channels with predictable ROI.",
      },
    ],
  },
  industries: {
    eyebrow: "Industry expertise",
    title: "Built for your market, not every market.",
    intro:
      "Generic playbooks don't survive contact with a real market. We bring category-specific benchmarks, keyword intelligence, and buyer insight to every engagement.",
    ctaLabel: "Explore Industries",
    ctaHref: "/industries",
  },
  locations: {
    eyebrow: "Global presence",
    title: "Digital marketing services, worldwide.",
    intro:
      "We help businesses compete and win in the world's most demanding markets. Each location page is built with localized intent, relevant proof, and unique value — never copy-pasted template pages that Google ignores.",
    points: [
      "Localized keyword research per market",
      "Region-specific competitor analysis",
      "Cultural + language-aware content",
      "Local search + map pack optimization",
    ],
    locations: [
      { country: "USA", city: "New York · San Francisco", flag: "US" },
      { country: "UK", city: "London · Manchester", flag: "UK" },
      { country: "Canada", city: "Toronto · Vancouver", flag: "CA" },
      { country: "Australia", city: "Sydney · Melbourne", flag: "AU" },
      { country: "UAE", city: "Dubai · Abu Dhabi", flag: "AE" },
      { country: "Germany", city: "Berlin · Munich", flag: "DE" },
    ],
  },
  "free-audit": {
    eyebrow: "Free Growth Audit",
    title: "Get a free 30-point audit of your website.",
    intro:
      "Enter your URL and we'll analyze your technical SEO, on-page optimization, performance, and AI-search readiness — then send you a prioritized action plan. No strings attached.",
    bullets: [
      "SEO Score & overall growth health",
      "Technical issues holding you back",
      "Page speed & Core Web Vitals",
      "On-page SEO & content gaps",
      "Backlinks overview vs. competitors",
      "Competitor insights & quick wins",
    ],
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What our clients say",
    ratingNote: "4.9 / 5 average rating from 80+ verified reviews",
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "Questions, answered.",
    intro:
      "Still curious? Book a free strategy call and we'll walk through your specific situation.",
    items: [
      {
        q: "How long does SEO take to show results?",
        a: "Most clients see meaningful organic growth between months 3 and 6, with compounding results from month 6 onward. Technical fixes and quick-win content can deliver early lifts in 30–60 days, but sustainable SEO is a long-term investment. We set realistic milestones at the start of every engagement and report against them monthly.",
      },
      {
        q: "Do you work with international clients?",
        a: "Yes. We work with businesses across 18+ countries including the USA, UK, Canada, Australia, UAE, Germany, and beyond. Our team is experienced in multi-region SEO, localized content, and country-specific search behaviors — we'll tailor strategy to your target markets, not just translate the same playbook.",
      },
      {
        q: "What industries do you specialize in?",
        a: "Our deepest expertise is in SaaS, B2B, Technology, Ecommerce, and Healthcare. We've also driven strong results for Real Estate, Finance, Education, and Professional Services. If your industry isn't listed, reach out — we'll be honest about whether we're the right fit.",
      },
      {
        q: "How much do digital marketing services cost?",
        a: "Engagements typically start at $2,500/month for focused SEO or content work, and scale up based on scope, channels, and business goals. We don't believe in one-size-fits-all retainers — every proposal is scoped around your growth targets and current funnel. Book a free strategy call for a tailored quote.",
      },
      {
        q: "Do you offer custom marketing strategies?",
        a: "Always. We never deploy template playbooks. Every engagement begins with a deep audit of your business, competitors, and market — then we build a custom strategy with prioritized channels, content roadmap, and measurable milestones tied to revenue.",
      },
      {
        q: "What is AI Search Optimization (GEO / AEO)?",
        a: "AI Search Optimization (also called Generative Engine Optimization or Answer Engine Optimization) is the practice of engineering your brand to appear in AI-powered answers — ChatGPT, Gemini, Perplexity, and AI overviews in Google. It involves structured data, entity optimization, authoritative content, and citation-worthy assets. This is a fast-growing channel that complements traditional SEO.",
      },
      {
        q: "Do you guarantee specific rankings or revenue?",
        a: "No ethical agency can guarantee #1 rankings or specific revenue numbers — Google's algorithm has hundreds of factors outside anyone's control. What we do guarantee: transparent process, weekly visibility, data-driven decisions, and relentless focus on business outcomes. If a strategy isn't working, we pivot fast.",
      },
      {
        q: "How do we get started?",
        a: "Simple. Run the free growth audit above, or book a free strategy call. We'll discuss your goals, audit your current funnel, and propose a tailored engagement — no pressure, no obligation. If we're a fit, we'll start with a 30-day onboarding sprint.",
      },
    ],
  },
  "final-cta": {
    eyebrow: "Ready when you are",
    headline: "Ready to grow your business?",
    subheading:
      "Let's build a marketing strategy designed around your business goals — engineered for visibility, qualified leads, and revenue that compounds.",
    ctaLabel: "Get Your Free Strategy",
    secondaryLabel: "Get My Free Website Audit",
    secondaryHref: "/free-growth-audit",
    note: "No commitment. No pressure. Just a real conversation about your growth.",
  },
};

export const SECTION_KEYS = Object.keys(SECTION_CONTENT_DEFAULTS) as SectionKey[];

/** Deep-merge DB overrides over defaults (shallow per section + per item). */
export function mergeSection<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object") return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      out[k] = v;
    } else if (typeof v === "object") {
      out[k] = mergeSection(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export type HomeSectionContent = Partial<SectionContentMap> & {
  // every key present, but values may be partial overrides
};
