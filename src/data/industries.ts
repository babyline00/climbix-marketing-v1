import {
  Building2,
  Cpu,
  Briefcase,
  ShoppingCart,
  HeartPulse,
  Home,
  type LucideIcon,
} from "lucide-react";

export type IndustrySlug =
  | "saas"
  | "b2b"
  | "technology"
  | "ecommerce"
  | "healthcare"
  | "real-estate";

export type IndustryContent = {
  slug: IndustrySlug;
  name: string;
  shortName: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  border: string;
  hero: {
    eyebrow: string;
    headline: string;
    highlight: string;
    subheading: string;
    cta: string;
  };
  challenges: {
    title: string;
    intro: string;
    points: { title: string; desc: string }[];
  };
  framework: {
    title: string;
    intro: string;
    pillars: { name: string; desc: string }[];
  };
  keywords: {
    title: string;
    intro: string;
    groups: { label: string; keywords: string[] }[];
  };
  caseStudy: {
    title: string;
    client: string;
    challenge: string;
    strategy: string;
    metrics: { value: string; label: string }[];
    blurb: string;
  };
  services: {
    title: string;
    items: { name: string; desc: string }[];
  };
  faq: { q: string; a: string }[];
  finalCta: {
    headline: string;
    subheading: string;
  };
};

export const INDUSTRIES: IndustryContent[] = [
  // ────────── SaaS ──────────
  {
    slug: "saas",
    name: "SaaS Marketing",
    shortName: "SaaS",
    tagline: "Reduce CAC, grow MRR, and rank for high-intent software keywords",
    icon: Building2,
    accent: "from-brand-500/20 to-brand-700/10",
    border: "border-brand-500/30",
    hero: {
      eyebrow: "SaaS Marketing Agency",
      headline: "SEO & growth marketing for",
      highlight: "SaaS companies.",
      subheading:
        "We help SaaS companies reduce customer acquisition cost, grow monthly recurring revenue, and rank for the high-intent software keywords their buyers actually search for — turning organic search into a predictable growth channel.",
      cta: "Get a SaaS Growth Strategy",
    },
    challenges: {
      title: "Why SaaS companies struggle with organic growth",
      intro:
        "SaaS marketing has unique challenges that generic agencies don't understand. Here's why most SaaS companies underperform in organic search — and how we fix it.",
      points: [
        {
          title: "High acquisition costs",
          desc: "Paid channels get expensive fast. Without strong organic visibility, every new cohort costs more than the last — and CAC creeps above LTV.",
        },
        {
          title: "Complex buyer journeys",
          desc: "SaaS buyers research for weeks before signing up. If your content doesn't answer their questions at every stage, competitors capture them first.",
        },
        {
          title: "Feature-page cannibalization",
          desc: "Dozens of feature pages competing for the same keywords, cannibalizing each other's rankings instead of building topical authority.",
        },
        {
          title: "No free-trial-to-paid optimization",
          desc: "Traffic converts to free trials, but trials don't convert to paid. The funnel leaks between signup and activation — and nobody's measuring it.",
        },
      ],
    },
    framework: {
      title: "Our SaaS Growth Framework",
      intro:
        "We've built a framework specifically for SaaS companies — focused on the metrics that actually matter: CAC, MRR, trial-to-paid conversion, and expansion revenue.",
      pillars: [
        {
          name: "Intent-Driven Keyword Strategy",
          desc: "We map keywords by funnel stage — awareness, consideration, decision — and prioritize terms that drive signups and demos, not just traffic.",
        },
        {
          name: "Topical Authority Clusters",
          desc: "Pillar pages for each product category surrounded by supporting articles that establish depth and capture long-tail intent.",
        },
        {
          name: "Feature Page Optimization",
          desc: "Each feature page targeting a specific use case with unique value proposition, integrations, and comparison content.",
        },
        {
          name: "Trial-to-Paid Funnel Optimization",
          desc: "CRO experiments on signup flows, onboarding sequences, and activation touchpoints to maximize trial-to-paid conversion.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank SaaS companies for",
      intro:
        "We target buyer-intent keywords at every funnel stage — from problem-aware to solution-comparing. Here's a sample of the keyword universe we build around.",
      groups: [
        {
          label: "Category Keywords",
          keywords: [
            "project management software",
            "crm for small business",
            "email marketing platform",
            "team collaboration tool",
            "workflow automation software",
          ],
        },
        {
          label: "Comparison Keywords",
          keywords: [
            "competitor vs competitor alternative",
            "best [category] software 2026",
            "competitor pricing comparison",
            "[category] software reviews",
            "top [category] tools",
          ],
        },
        {
          label: "Use Case Keywords",
          keywords: [
            "[category] for startups",
            "[category] for enterprise",
            "[category] for remote teams",
            "how to [task] with [category]",
            "[category] integration with [tool]",
          ],
        },
        {
          label: "SaaS SEO Keywords",
          keywords: [
            "SaaS SEO agency",
            "SaaS marketing agency",
            "B2B SaaS SEO",
            "SaaS content marketing",
            "SaaS lead generation",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real SaaS growth results",
      client: "Workflow Platform (Mid-Market SaaS)",
      challenge:
        "Stagnant organic traffic with heavy paid acquisition dependency. CAC was rising 8% quarter-over-quarter, making growth unsustainable.",
      strategy:
        "SEO + Content + Lead Magnets + CRO. Built topical authority clusters around 5 product categories, optimized 40+ feature pages, and ran CRO experiments on the signup flow.",
      metrics: [
        { value: "+250%", label: "Organic traffic in 6 months" },
        { value: "+180%", label: "Qualified demo requests" },
        { value: "+120%", label: "Trial-to-paid conversion" },
        { value: "-38%", label: "Blended CAC reduction" },
      ],
      blurb:
        "Within two quarters, organic became their largest source of new business — cutting blended CAC by 38% and unlocking a growth channel that continues to compound. Organic now drives 52% of new trial signups, up from 14% at the start of the engagement.",
    },
    services: {
      title: "What's included in SaaS marketing",
      items: [
        { name: "SaaS SEO", desc: "Technical SEO, feature page optimization, and topical authority clusters for software categories." },
        { name: "Content Marketing", desc: "Buyer-intent content mapped to SaaS funnel stages — from problem-aware to comparison-ready." },
        { name: "Lead Generation", desc: "Demo request funnels, lead magnets, and qualification scoring tailored to SaaS sales cycles." },
        { name: "CRO for Signup Flows", desc: "A/B testing on trial signup, onboarding, and activation to maximize trial-to-paid conversion." },
        { name: "Comparison & Alternative Pages", desc: "Strategic competitor comparison pages that capture high-intent comparison searches." },
        { name: "AI Search Optimization", desc: "Get cited in ChatGPT and Perplexity when buyers ask for software recommendations." },
        { name: "Product-Led SEO", desc: "Programmatic SEO strategies that scale with your product catalog and feature set." },
        { name: "Revenue Attribution", desc: "Full-funnel tracking from organic touch to trial signup to paid conversion to expansion." },
      ],
    },
    faq: [
      { q: "How is SaaS SEO different from regular SEO?", a: "SaaS SEO requires understanding complex buyer journeys, multi-stakeholder decision-making, and long evaluation cycles. It's not just about ranking for keywords — it's about ranking for the right keywords at the right funnel stage, and ensuring your content moves buyers toward a trial or demo. Generic SEO agencies often target high-volume terms that drive traffic but never convert. We focus on intent-driven keywords tied to signups and revenue." },
      { q: "How long until SaaS SEO shows results?", a: "Most SaaS clients see meaningful organic growth between months 3 and 6, with compounding results from month 6 onward. Feature page optimizations and quick-win content can deliver lifts in 30–60 days. Topical authority clusters typically take 4–6 months to fully mature and dominate their category." },
      { q: "Do you work with early-stage SaaS startups?", a: "Yes. We work with SaaS companies from seed stage through enterprise. For early-stage startups, we focus on building a strong SEO foundation and capturing low-competition, high-intent keywords before scaling to broader category terms. Our approach scales with your growth." },
      { q: "Can you help with product-led growth (PLG) SEO?", a: "Absolutely. PLG SEO is one of our specialties. We build programmatic SEO strategies that scale with your product — creating optimized pages for each use case, integration, and template — so your product catalog becomes an organic growth engine." },
      { q: "How do you measure SaaS SEO success?", a: "We measure success the way you do: trial signups, demo requests, trial-to-paid conversion, and revenue attributed to organic. Rankings and traffic are means to an end — we report on the metrics that actually impact your business." },
    ],
    finalCta: {
      headline: "Let's turn organic search into your largest growth channel.",
      subheading:
        "Get a free SaaS SEO audit and a custom growth strategy. We'll show you exactly which keywords to target and how to turn organic traffic into trials and revenue.",
    },
  },

  // ────────── B2B ──────────
  {
    slug: "b2b",
    name: "B2B Marketing",
    shortName: "B2B",
    tagline: "Generate qualified pipeline through intent-driven content and ABM",
    icon: Briefcase,
    accent: "from-violet-500/20 to-violet-700/10",
    border: "border-violet-500/30",
    hero: {
      eyebrow: "B2B Marketing Agency",
      headline: "B2B marketing that fills your",
      highlight: "sales pipeline.",
      subheading:
        "We help B2B companies generate qualified pipeline through intent-driven content, account-based marketing, and SEO strategies built for complex, multi-stakeholder buyer journeys — not vanity traffic that never converts.",
      cta: "Get a B2B Pipeline Strategy",
    },
    challenges: {
      title: "Why B2B companies struggle with marketing",
      intro:
        "B2B buying is fundamentally different from B2C. Long sales cycles, multiple decision-makers, and complex evaluations require a different approach — one most agencies don't understand.",
      points: [
        {
          title: "Long, complex sales cycles",
          desc: "B2B deals take 3–12 months with 5+ decision-makers. Marketing that doesn't nurture throughout the journey loses deals to competitors who stay top-of-mind.",
        },
        {
          title: "Multiple decision-makers",
          desc: "Champions, influencers, blockers, and economic buyers all need different content. Generic messaging fails to resonate with any of them.",
        },
        {
          title: "No account-based strategy",
          desc: "Treating all visitors the same when your highest-value accounts need personalized, targeted engagement throughout the buying journey.",
        },
        {
          title: "Marketing-sales misalignment",
          desc: "Marketing reports leads, sales says they're unqualified. No shared definition of what makes a lead sales-ready, and pipeline suffers.",
        },
      ],
    },
    framework: {
      title: "Our B2B Pipeline Framework",
      intro:
        "We build B2B marketing systems engineered around your sales cycle — from first touch to closed-won, with alignment between marketing and sales baked in.",
      pillars: [
        {
          name: "Account-Based Marketing",
          desc: "Identify and target your highest-value accounts with personalized content, ads, and outreach — not spray-and-pray demand generation.",
        },
        {
          name: "Stakeholder Content Strategy",
          desc: "Content tailored to each decision-maker role — champion, influencer, economic buyer — addressing their specific concerns and objections.",
        },
        {
          name: "Intent-Driven SEO",
          desc: "Target keywords that signal buying intent — not just search volume. We focus on terms that drive qualified pipeline, not tire-kickers.",
        },
        {
          name: "Marketing-Sales Alignment",
          desc: "Shared definitions of qualified leads, SLAs for follow-up, and full-funnel attribution from first touch to closed-won revenue.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank B2B companies for",
      intro:
        "We target buyer-intent keywords that signal active research and evaluation — the terms your prospects search when they're ready to engage sales.",
      groups: [
        {
          label: "Solution Keywords",
          keywords: [
            "[service] for [industry]",
            "enterprise [solution] platform",
            "[solution] software for business",
            "B2B [service] services",
            "[solution] consulting firm",
          ],
        },
        {
          label: "Comparison Keywords",
          keywords: [
            "[competitor] alternatives",
            "best [solution] for enterprise",
            "[competitor] vs [competitor]",
            "top [solution] providers",
            "[solution] comparison guide",
          ],
        },
        {
          label: "Problem Keywords",
          keywords: [
            "how to solve [problem]",
            "[problem] solutions",
            "why [problem] happens",
            "[problem] prevention strategies",
            "[problem] best practices",
          ],
        },
        {
          label: "B2B Marketing Keywords",
          keywords: [
            "B2B SEO agency",
            "B2B lead generation",
            "B2B content marketing",
            "account-based marketing agency",
            "B2B demand generation",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real B2B pipeline results",
      client: "Professional Services Firm (Mid-Market B2B)",
      challenge:
        "Burning budget on paid ads with poor conversion. Sales team was drowning in unqualified leads while pipeline quality kept declining.",
      strategy:
        "PPC audit + CRO + Retargeting + ABM. Rebuilt the funnel from scratch with intent-driven landing pages, lead scoring, and account-based targeting for top 200 target accounts.",
      metrics: [
        { value: "+180%", label: "Qualified leads per month" },
        { value: "-40%", label: "Cost per qualified lead" },
        { value: "+200%", label: "More SQLs for sales team" },
        { value: "+62%", label: "Sales-accepted lead rate" },
      ],
      blurb:
        "Within 90 days, qualified leads doubled while cost per acquisition dropped 40%. The sales team went from ignoring marketing leads to requesting more — because the quality finally matched their definition of sales-ready. Pipeline attribution now connects every closed deal back to its first marketing touch.",
    },
    services: {
      title: "What's included in B2B marketing",
      items: [
        { name: "B2B SEO", desc: "Intent-driven keyword strategy targeting buyers in active research and evaluation modes." },
        { name: "Account-Based Marketing", desc: "Targeted campaigns for your highest-value accounts with personalized content and outreach." },
        { name: "Lead Generation", desc: "Qualified pipeline funnels with lead scoring, routing, and CRM integration." },
        { name: "Content Marketing", desc: "Stakeholder-specific content for champions, influencers, and economic buyers." },
        { name: "Sales Enablement Content", desc: "Battle cards, case studies, ROI calculators, and comparison sheets your sales team actually uses." },
        { name: "Marketing-Sales Alignment", desc: "Shared definitions, SLAs, and attribution models connecting marketing to revenue." },
        { name: "LinkedIn Ads", desc: "Precise B2B targeting by job title, company size, industry, and seniority." },
        { name: "Revenue Attribution", desc: "Full-funnel tracking from first touch to closed-won, with multi-touch attribution modeling." },
      ],
    },
    faq: [
      { q: "How is B2B marketing different from B2C?", a: "B2B marketing involves longer sales cycles (3–12 months), multiple decision-makers (often 5+), higher deal values, and complex evaluation processes. B2B buyers research extensively before engaging sales — so your content needs to answer their questions at every stage, build trust, and stay top-of-mind throughout the journey. Tactics that work in B2C (impulse-driven ads, broad targeting) fail in B2B." },
      { q: "Do you do account-based marketing (ABM)?", a: "Yes. ABM is core to our B2B framework. We identify your highest-value target accounts, build personalized content and campaigns for them, and coordinate outreach across channels — display ads, email, LinkedIn, direct mail, and sales touchpoints. ABM works best when marketing and sales are tightly aligned, which we facilitate." },
      { q: "How do you align marketing with our sales team?", a: "We start by establishing shared definitions: what makes a Marketing Qualified Lead (MQL), Sales Qualified Lead (SQL), and sales-accepted opportunity. We set SLAs for follow-up times, implement lead scoring based on fit + behavior, and build full-funnel attribution so both teams see the same data. Regular marketing-sales reviews ensure continuous improvement." },
      { q: "What CRM and marketing tools do you work with?", a: "We integrate with HubSpot, Salesforce, Pipedrive, Marketo, Pardot, and most popular B2B CRM/marketing stacks. If you don't have one, we'll recommend and set up the right platform for your stage and budget — typically HubSpot for mid-market and Salesforce + Marketo for enterprise." },
      { q: "How do you measure B2B marketing success?", a: "We measure pipeline generated, SQLs, sales-accepted leads, closed-won revenue attributed to marketing, and CAC by channel. Traffic and leads matter only insofar as they convert to pipeline — we focus on the metrics your CRO and CFO care about." },
    ],
    finalCta: {
      headline: "Stop generating leads. Start generating pipeline.",
      subheading:
        "Free B2B funnel audit — see exactly where your marketing leaks qualified pipeline and how to build a system sales will love.",
    },
  },

  // ────────── Technology ──────────
  {
    slug: "technology",
    name: "Technology Marketing",
    shortName: "Technology",
    tagline: "Win developer and buyer searches across complex tech categories",
    icon: Cpu,
    accent: "from-sky-500/20 to-sky-700/10",
    border: "border-sky-500/30",
    hero: {
      eyebrow: "Technology Marketing Agency",
      headline: "SEO for technology companies that",
      highlight: "win developers.",
      subheading:
        "We help technology companies rank for complex technical queries, build developer trust, and capture both developer and buyer audiences — across documentation, tutorials, comparisons, and category-defining content.",
      cta: "Get a Tech SEO Strategy",
    },
    challenges: {
      title: "Why technology companies struggle with SEO",
      intro:
        "Technology marketing requires reaching two distinct audiences — developers who evaluate technical capabilities and buyers who make purchase decisions. Most agencies fail at one or both.",
      points: [
        {
          title: "Two audiences, one site",
          desc: "Developers want documentation and technical depth. Buyers want ROI and case studies. Your content needs to serve both without alienating either.",
        },
        {
          title: "Highly competitive keywords",
          desc: "Technology categories are crowded with well-funded competitors. Ranking for category terms requires real topical authority, not just optimized pages.",
        },
        {
          title: "Rapidly evolving topics",
          desc: "Tech categories shift every quarter. Content that ranked last year is outdated today. Maintaining relevance requires ongoing content investment.",
        },
        {
          title: "Developer distrust of marketing",
          desc: "Developers ignore traditional marketing. They trust documentation, tutorials, and peer communities — content most agencies can't produce.",
        },
      ],
    },
    framework: {
      title: "Our Technology Marketing Framework",
      intro:
        "We build SEO and content strategies that win both developer and buyer audiences — establishing technical authority while driving purchase consideration.",
      pillars: [
        {
          name: "Developer-First Content",
          desc: "Documentation, tutorials, API references, and technical deep-dives that developers trust and share — built by people who understand the technology.",
        },
        {
          name: "Category Authority Building",
          desc: "Pillar pages and topic clusters that establish your brand as the definitive resource for your technology category.",
        },
        {
          name: "Comparison & Evaluation Content",
          desc: "Honest comparison pages, evaluation guides, and migration content that captures buyers in active evaluation mode.",
        },
        {
          name: "Community & Documentation SEO",
          desc: "Optimized docs, community forums, and open-source content that ranks for technical queries and builds developer trust.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank technology companies for",
      intro:
        "We target both technical queries (for developers) and category queries (for buyers) — building authority across the entire evaluation journey.",
      groups: [
        {
          label: "Technical Keywords",
          keywords: [
            "how to [task] with [technology]",
            "[technology] tutorial",
            "[technology] documentation",
            "[technology] vs [alternative]",
            "[technology] best practices",
          ],
        },
        {
          label: "Category Keywords",
          keywords: [
            "[category] platform",
            "[category] software",
            "best [category] tools",
            "[category] solutions",
            "enterprise [category]",
          ],
        },
        {
          label: "Comparison Keywords",
          keywords: [
            "[competitor] alternative",
            "[competitor] vs [competitor]",
            "migrate from [competitor] to [us]",
            "[category] comparison",
            "open source [category]",
          ],
        },
        {
          label: "Tech SEO Keywords",
          keywords: [
            "technology SEO agency",
            "IT company SEO",
            "tech marketing agency",
            "developer marketing",
            "SaaS technical SEO",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real technology growth results",
      client: "Developer Tools Platform (Series B Tech)",
      challenge:
        "Invisible in search results for both developer queries and category terms. Developers couldn't find the documentation; buyers couldn't find the platform.",
      strategy:
        "Technical SEO + Developer Content + Category Authority + AI Search Optimization. Rebuilt documentation for SEO, created tutorial series, and built category-defining pillar pages.",
      metrics: [
        { value: "+340%", label: "AI citations in 4 months" },
        { value: "+250%", label: "Organic traffic in 6 months" },
        { value: "+95%", label: "Organic-attributed signups" },
        { value: "12", label: "Category terms in top 3" },
      ],
      blurb:
        "Within six months, the platform went from invisible to dominant — ranking in the top 3 for 12 priority category terms and getting cited by ChatGPT and Perplexity as a top recommendation. Organic now drives 65% of new developer signups, up from 8% at the start of the engagement.",
    },
    services: {
      title: "What's included in technology marketing",
      items: [
        { name: "Technical SEO", desc: "Crawlability, site architecture, and Core Web Vitals for complex documentation sites and platforms." },
        { name: "Developer Content", desc: "Tutorials, API documentation, and technical deep-dives written by people who understand the technology." },
        { name: "Category Authority", desc: "Pillar pages and topic clusters that establish your brand as the definitive category resource." },
        { name: "Comparison Content", desc: "Honest competitor comparisons and migration guides that capture buyers in evaluation mode." },
        { name: "Documentation SEO", desc: "Optimized docs that rank for technical queries and build developer trust." },
        { name: "AI Search Optimization", desc: "Get cited in ChatGPT, Gemini, and Perplexity when developers ask for tool recommendations." },
        { name: "Community Marketing", desc: "Strategy for GitHub, Stack Overflow, Reddit, and developer communities where technical decisions happen." },
        { name: "Open Source SEO", desc: "SEO strategy for open-source projects that drives adoption and commercial conversion." },
      ],
    },
    faq: [
      { q: "How is technology SEO different from regular SEO?", a: "Technology SEO requires serving two audiences — developers who want technical depth and buyers who want ROI. It involves ranking for highly competitive category terms, producing content that developers actually trust (not marketing fluff), and maintaining relevance in rapidly evolving tech categories. Most agencies fail because they can't produce technically credible content or understand developer audiences." },
      { q: "Can you produce developer-focused content?", a: "Yes. Our content team includes technical writers who understand developer audiences. We produce tutorials, documentation, API references, and technical deep-dives that developers trust and share. We don't outsource to content farms that produce surface-level fluff developers immediately dismiss." },
      { q: "Do you work with open-source projects?", a: "Absolutely. Open-source SEO is one of our specialties. We help open-source projects rank for their category, drive adoption through discoverable documentation, and convert community engagement into commercial pipeline for the underlying company." },
      { q: "How do you measure technology marketing success?", a: "We measure developer signups, documentation engagement, API key generations, community growth (GitHub stars, Discord members), and commercial pipeline attributed to organic. For developer-focused companies, we also track AI citations — because developers increasingly ask ChatGPT and Perplexity for tool recommendations." },
      { q: "Can you help with AI search visibility for our technology?", a: "Yes — this is increasingly important for technology companies. Developers ask ChatGPT, Gemini, and Perplexity for tool recommendations every day. If your technology isn't being cited, you're invisible to a growing audience. We optimize your brand for AI search through entity optimization, structured data, and citation-worthy technical content." },
    ],
    finalCta: {
      headline: "Win both developers and buyers with one SEO strategy.",
      subheading:
        "Free technology SEO audit — see where you rank for developer queries, category terms, and AI search citations, plus how to dominate your category.",
    },
  },

  // ────────── ECOMMERCE ──────────
  {
    slug: "ecommerce",
    name: "Ecommerce Marketing",
    shortName: "Ecommerce",
    tagline: "Turn searches into sales and lift AOV across every channel",
    icon: ShoppingCart,
    accent: "from-brand-500/20 to-brand-700/10",
    border: "border-brand-500/30",
    hero: {
      eyebrow: "Ecommerce Marketing Agency",
      headline: "Sell more with",
      highlight: "ecommerce SEO & paid media.",
      subheading:
        "We help online stores grow revenue with collection page SEO, product content that ranks, Google Shopping, Meta ads, and retention marketing — built around your margins, not vanity metrics.",
      cta: "Get an Ecommerce Growth Plan",
    },
    challenges: {
      title: "Why online stores stall",
      intro:
        "Ecommerce is a margin game. Every wasted click, every unoptimized collection page, every abandoned cart compounds. Here's where most stores leak revenue — and what we do about it.",
      points: [
        {
          title: "Collection pages that don't rank",
          desc: "Your product pages fight for keywords that will never rank. Collection pages — the real money pages — are left with thin, duplicated content Google ignores.",
        },
        {
          title: "Rising ad costs eating margin",
          desc: "CPMs climb every quarter. Without organic revenue and strong conversion rates, rising acquisition costs quietly erase your profit.",
        },
        {
          title: "One-time buyers, no retention",
          desc: "Acquisition gets all the budget while email, SMS, and post-purchase flows — the cheapest revenue you'll ever earn — are left on autopilot.",
        },
        {
          title: "Platform SEO limitations",
          desc: "Default Shopify/WooCommerce setups leave faceted navigation, duplicate URLs, and slow templates that throttle your organic ceiling.",
        },
      ],
    },
    framework: {
      title: "Our Ecommerce Growth Framework",
      intro:
        "We optimize the full revenue loop — from first search to repeat purchase — with playbooks built on hundreds of product and collection page optimizations.",
      pillars: [
        {
          name: "Collection Page SEO",
          desc: "We turn collection pages into ranking assets with unique copy, internal linking, faceted-navigation control, and schema markup.",
        },
        {
          name: "Product Content at Scale",
          desc: "Product descriptions, buying guides, and comparison content written to rank for long-tail, high-purchase-intent queries.",
        },
        {
          name: "Paid Media With Margin Math",
          desc: "Google Shopping, Performance Max, and Meta campaigns managed against contribution margin — not just ROAS.",
        },
        {
          name: "Retention & LTV Engine",
          desc: "Email and SMS flows, post-purchase journeys, and win-back campaigns that raise lifetime value and make every ad dollar work harder.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank stores for",
      intro:
        "We prioritize commercial-intent queries — the searches that end with a checkout, not just a scroll.",
      groups: [
        {
          label: "Collection Keywords",
          keywords: [
            "best [product category]",
            "[category] online store",
            "buy [product] online",
            "[category] for [use case]",
            "affordable [product category]",
          ],
        },
        {
          label: "Product Keywords",
          keywords: [
            "[brand] [product] review",
            "[product] buy",
            "[product] price",
            "[product] free shipping",
            "[product] vs [alternative product]",
          ],
        },
        {
          label: "Buyer-Intent Modifiers",
          keywords: [
            "best [category] 2026",
            "[category] deals",
            "[category] free shipping",
            "[category] near me",
            "discount [product category]",
          ],
        },
        {
          label: "Ecommerce SEO Keywords",
          keywords: [
            "ecommerce SEO agency",
            "Shopify SEO services",
            "online store marketing",
            "ecommerce PPC management",
            "ecommerce growth agency",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real ecommerce growth results",
      client: "DTC Home Goods Brand",
      challenge:
        "Flat revenue for 3 quarters. 90% of sales from paid ads with rising CAC, almost no organic visibility, and one-time buyers who never came back.",
      strategy:
        "Collection Page SEO + Product Content + Performance Max Restructure + Retention Flows. Rebuilt 40 collection pages, launched a buying-guide hub, restructured Shopping campaigns by margin tier, and rebuilt email flows.",
      metrics: [
        { value: "+214%", label: "Organic revenue in 8 months" },
        { value: "-31%", label: "Blended CAC" },
        { value: "+22%", label: "Average order value" },
        { value: "3.4x", label: "Email revenue share" },
      ],
      blurb:
        "Eight months in, organic became the brand's second-largest revenue channel. Blended CAC dropped 31% while AOV rose 22% thanks to bundle pages and post-purchase upsell flows. Email and SMS now drive more than a third of monthly revenue — margin the brand used to spend on ads.",
    },
    services: {
      title: "What's included in ecommerce marketing",
      items: [
        { name: "Ecommerce SEO", desc: "Collection and product page optimization, faceted navigation control, and internal linking that moves rankings." },
        { name: "Product Content", desc: "Descriptions, buying guides, and comparison pages written to rank for purchase-intent searches." },
        { name: "Google Shopping & PMax", desc: "Feed optimization and campaign structure managed against contribution margin." },
        { name: "Meta & TikTok Ads", desc: "Creative testing frameworks and audience strategies built for direct response." },
        { name: "Email & SMS Retention", desc: "Welcome, abandoned cart, post-purchase, and win-back flows that compound LTV." },
        { name: "CRO for Stores", desc: "PDP and checkout experiments, trust signals, and site speed work that lifts conversion rate." },
        { name: "Marketplace Strategy", desc: "Amazon and marketplace listing optimization that doesn't cannibalize your DTC channel." },
        { name: "Analytics & Attribution", desc: "GA4, server-side tracking, and merchandising dashboards that show real margin per channel." },
      ],
    },
    faq: [
      { q: "How long until ecommerce SEO drives sales?", a: "Collection page improvements often show movement in 60–90 days, with meaningful revenue impact in months 3–6 depending on competition and domain strength. Paid channels can drive sales immediately while organic compounds — that's why we usually run both with a shared margin model." },
      { q: "Do you work with Shopify, WooCommerce, and custom platforms?", a: "Yes — Shopify and Shopify Plus are our most common platforms, but we also work with WooCommerce, BigCommerce, Magento, and headless storefronts. Platform technical constraints are a big part of ecommerce SEO, so we audit the platform before promising anything." },
      { q: "How do you report on ecommerce performance?", a: "We report revenue by channel, blended CAC, AOV, LTV, and margin — not just traffic. You get a shared dashboard plus a monthly walkthrough that connects every activity to sales numbers your finance team will recognize." },
      { q: "Can you manage our ads and SEO together?", a: "That's actually our preferred model. Paid and organic share keyword intelligence, creative insights, and landing page tests. Running them in one team eliminates the classic agency-vs-agency blame game and makes budget allocation dramatically smarter." },
      { q: "What size stores do you work with?", a: "Our sweet spot is stores doing $50K–$5M per month. Below that, we're honest that a lighter engagement or consultant might serve you better; above it, we scale the team to match." },
    ],
    finalCta: {
      headline: "Turn more searches into checkouts.",
      subheading:
        "Free ecommerce audit — we'll review your collection pages, ad structure, and retention flows, then send a prioritized plan to grow revenue.",
    },
  },

  // ────────── HEALTHCARE ──────────
  {
    slug: "healthcare",
    name: "Healthcare Marketing",
    shortName: "Healthcare",
    tagline: "Patient acquisition & medtech growth, built with compliance",
    icon: HeartPulse,
    accent: "from-brand-500/20 to-brand-700/10",
    border: "border-brand-500/30",
    hero: {
      eyebrow: "Healthcare Marketing Agency",
      headline: "Grow your practice with",
      highlight: "compliant healthcare marketing.",
      subheading:
        "We help clinics, hospital groups, medtech, and healthcare SaaS win patients and providers with local SEO, trustworthy content, and HIPAA-aware campaigns — no gray-hat tactics that put your license at risk.",
      cta: "Get a Healthcare Growth Plan",
    },
    challenges: {
      title: "Why healthcare marketing is different",
      intro:
        "Healthcare decisions carry real stakes and real regulation. Generic marketing agencies learn this the hard way — after the damage is done. Here's what you're up against.",
      points: [
        {
          title: "Compliance minefields",
          desc: "Health claims, patient data, and advertising rules vary by country and platform. One careless campaign can trigger takedowns, fines, or worse.",
        },
        {
          title: "YMYL search scrutiny",
          desc: "Google holds health content to the highest standard (Your Money or Your Life). Thin content and uncredited claims simply won't rank — and shouldn't.",
        },
        {
          title: "Local competition",
          desc: "Patients search 'near me' and choose from the map pack. If your profiles, reviews, and location pages are weak, competitors absorb your patients.",
        },
        {
          title: "Long, trust-heavy decisions",
          desc: "Patients and providers research deeply before committing. You need content that answers real questions at every stage — with credentials showing.",
        },
      ],
    },
    framework: {
      title: "Our Healthcare Marketing Framework",
      intro:
        "Every engagement is built on three non-negotiables: clinical accuracy, regulatory awareness, and measurable patient growth.",
      pillars: [
        {
          name: "Local Search Domination",
          desc: "Google Business Profile optimization, review strategy, location pages, and map-pack rankings that put you in front of nearby patients.",
        },
        {
          name: "E-E-A-T Content Programs",
          desc: "Medically-reviewed service pages and condition guides with proper authorship, citations, and structured data that satisfy YMYL standards.",
        },
        {
          name: "HIPAA-Aware Acquisition",
          desc: "Ad campaigns and analytics configured to avoid PHI exposure — conversion tracking that respects patient privacy by design.",
        },
        {
          name: "Patient Journey Optimization",
          desc: "From search to appointment: online booking integration, intake funnel optimization, and no-show reduction workflows.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank healthcare organizations for",
      intro:
        "We balance patient language ('doctor that speaks my language') with clinical terms, and always map keywords to the services you actually want more of.",
      groups: [
        {
          label: "Local Patient Keywords",
          keywords: [
            "[specialty] near me",
            "best [specialty] in [city]",
            "[treatment] [city]",
            "walk-in [specialty] clinic",
            "[specialty] accepting new patients",
          ],
        },
        {
          label: "Condition & Treatment Keywords",
          keywords: [
            "treatment for [condition]",
            "[condition] symptoms",
            "[treatment] options",
            "[treatment] recovery time",
            "is [treatment] safe",
          ],
        },
        {
          label: "Provider & Medtech Keywords",
          keywords: [
            "healthcare software for [specialty]",
            "[medtech category] platform",
            "[device] for hospitals",
            "[specialty] practice management",
            "HIPAA compliant [software category]",
          ],
        },
        {
          label: "Healthcare SEO Keywords",
          keywords: [
            "healthcare SEO agency",
            "medical marketing services",
            "patient acquisition agency",
            "clinic SEO services",
            "healthcare digital marketing",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real healthcare growth results",
      client: "Multi-Location Dental Group",
      challenge:
        "Seven locations with inconsistent visibility. Two clinics fully booked, five with empty chairs. No review strategy, no location pages, and a website Google barely indexed.",
      strategy:
        "Local SEO + Location Pages + Review Engine + Service Content. Built dedicated pages per location and service, launched a systematic review-generation flow, and created condition-level content reviewed by clinical staff.",
      metrics: [
        { value: "+178%", label: "Map pack appearances" },
        { value: "+120%", label: "New patient calls in 6 months" },
        { value: "4.8★", label: "Average rating (from 3.9)" },
        { value: "68%", label: "Decrease in cost per booked patient" },
      ],
      blurb:
        "Within six months, all seven locations ranked in the local map pack for their priority services. New patient calls more than doubled, and cost per acquisition fell by more than half. The group now opens new locations with a proven playbook instead of guesswork.",
    },
    services: {
      title: "What's included in healthcare marketing",
      items: [
        { name: "Local SEO & Map Pack", desc: "Google Business Profile optimization, citations, and location strategies that win 'near me' searches." },
        { name: "Medical Content", desc: "Condition guides and service pages reviewed for clinical accuracy and built to satisfy YMYL standards." },
        { name: "Review Generation", desc: "Compliant review-request workflows that steadily grow ratings and social proof." },
        { name: "Paid Patient Acquisition", desc: "Google and Meta campaigns with healthcare-policy-safe structure and tracking." },
        { name: "Reputation Management", desc: "Monitor, respond, and resolve reviews across platforms without violating patient privacy." },
        { name: "Website & Booking UX", desc: "Fast, accessible sites with online booking paths that convert visitors into appointments." },
        { name: "Medtech & Health SaaS", desc: "Provider-facing demand generation for healthcare technology companies." },
        { name: "Compliance Consulting", desc: "HIPAA, GDPR, and platform-policy-aware setup for analytics, ads, and tracking." },
      ],
    },
    faq: [
      { q: "Is healthcare marketing HIPAA compliant?", a: "We design every campaign and tracking setup with privacy regulations in mind — no PHI in ad platforms, server-side configurations that avoid patient data leakage, and consent-first analytics. We're a marketing agency, not a legal compliance firm, so we also recommend your compliance officer review any program — and we make that review easy with documented configurations." },
      { q: "How do you handle medical content accuracy?", a: "All condition and treatment content is drafted from authoritative sources, reviewed by your clinical staff (or our medical reviewers), and includes proper authorship and citations. This isn't just ethics — Google's YMYL standards demand it, and it's why our healthcare content ranks when generic content doesn't." },
      { q: "Can you get our clinic into the Google map pack?", a: "Local visibility is our specialty for healthcare. We optimize your Google Business Profiles, build location and service pages, generate a steady flow of authentic reviews, and fix the citation inconsistencies that keep clinics out of the map pack. Most clients see measurable map-pack movement within 60–90 days." },
      { q: "Do you work with medtech and healthcare SaaS?", a: "Yes. Provider-facing healthcare technology is a growing part of our portfolio. We build demand generation programs that speak to clinicians and hospital administrators — with the longer sales cycles, compliance language, and evidence-based content that healthcare B2B requires." },
      { q: "What results should we expect and when?", a: "Paid channels can generate appointment requests in the first weeks. Local SEO typically shows movement in 60–90 days, with full impact in 4–6 months. We set location-level targets for calls, bookings, and cost per patient — and report against them monthly." },
    ],
    finalCta: {
      headline: "Fill your calendar with the right patients.",
      subheading:
        "Free healthcare marketing audit — local visibility, content quality, and patient funnel review with a prioritized action plan.",
    },
  },

  // ────────── REAL ESTATE ──────────
  {
    slug: "real-estate",
    name: "Real Estate Marketing",
    shortName: "Real Estate",
    tagline: "Turn property searches into showings and signed deals",
    icon: Home,
    accent: "from-brand-500/20 to-brand-700/10",
    border: "border-brand-500/30",
    hero: {
      eyebrow: "Real Estate Marketing Agency",
      headline: "Win your market with",
      highlight: "real estate SEO & lead funnels.",
      subheading:
        "We help real estate agencies, developers, and proptech companies dominate local search, generate qualified buyer and seller leads, and turn listing traffic into showings — with campaigns built for how people actually choose property.",
      cta: "Get a Real Estate Growth Plan",
    },
    challenges: {
      title: "Why real estate marketing underdelivers",
      intro:
        "Property decisions are high-value, local, and emotional. Most agencies treat real estate like any other vertical — and wonder why the leads never convert. Sound familiar?",
      points: [
        {
          title: "Portals own your keywords",
          desc: "Zillow, Realtor.com, and Rightmove outrank almost every agency site. Beating them requires a very specific local content strategy — not generic SEO.",
        },
        {
          title: "Lead quality is terrible",
          desc: "Forms produce window shoppers, not buyers. Without intent-qualified funnels, agents waste days chasing leads that were never serious.",
        },
        {
          title: "Listings die fast",
          desc: "Listing pages get indexed too late, rank for nothing, and vanish from search the moment a property sells — wasting every dollar spent on them.",
        },
        {
          title: "Agents market as individuals",
          desc: "Every agent runs a personal Instagram and a personal Zillow profile. Brand equity fragments, and nothing compounds for the brokerage.",
        },
      ],
    },
    framework: {
      title: "Our Real Estate Growth Framework",
      intro:
        "We build marketing systems that survive portal dominance and turn local intent into booked viewings — for agencies, developers, and proptech alike.",
      pillars: [
        {
          name: "Hyperlocal SEO",
          desc: "Neighborhood guides, market reports, and 'homes for sale in [area]' pages structured to outrank portals for local intent.",
        },
        {
          name: "Listing Page Architecture",
          desc: "Fast-indexing listing templates, schema markup, and evergreen building/area pages so traffic compounds instead of evaporating.",
        },
        {
          name: "Intent-Qualified Lead Funnels",
          desc: "Valuation tools, buyer guides, and screening questions that separate serious clients from browsers — before they reach an agent.",
        },
        {
          name: "Agent Enablement",
          desc: "One brand system with personal landing pages, review programs, and content libraries each agent can use without fragmenting equity.",
        },
      ],
    },
    keywords: {
      title: "Keywords we rank real estate brands for",
      intro:
        "We target the searches that signal transactional intent — people actively planning to buy, sell, or invest.",
      groups: [
        {
          label: "Local Buyer Keywords",
          keywords: [
            "homes for sale in [area]",
            "[neighborhood] real estate",
            "houses for sale near [landmark]",
            "[city] property for sale",
            "condos for sale in [area]",
          ],
        },
        {
          label: "Seller Keywords",
          keywords: [
            "how much is my home worth",
            "sell my house fast [city]",
            "[city] home valuation",
            "best realtor in [area]",
            "[neighborhood] home prices",
          ],
        },
        {
          label: "Investor & Rental Keywords",
          keywords: [
            "[city] investment properties",
            "rental yields in [area]",
            "property management [city]",
            "off-plan projects [city]",
            "[area] rental market report",
          ],
        },
        {
          label: "Real Estate SEO Keywords",
          keywords: [
            "real estate SEO agency",
            "realtor marketing services",
            "property marketing agency",
            "real estate lead generation",
            "proptech marketing",
          ],
        },
      ],
    },
    caseStudy: {
      title: "Real real estate growth results",
      client: "Luxury Brokerage (Metro Market)",
      challenge:
        "Every lead came from portals at $60+ each. The website ranked for nothing except the brand name, and agents duplicated marketing spend across personal accounts.",
      strategy:
        "Hyperlocal SEO + Neighborhood Guides + Valuation Funnel + Agent Pages. Built 35 neighborhood hubs, a home-valuation tool feeding agent follow-up, and unified brand pages for each agent with review generation.",
      metrics: [
        { value: "+310%", label: "Organic leads in 9 months" },
        { value: "$19", label: "Cost per qualified lead (from $60)" },
        { value: "Top 3", label: "For 25 neighborhood searches" },
        { value: "+45%", label: "Listing-to-showing rate" },
      ],
      blurb:
        "Nine months later, organic is the brokerage's largest lead source. Cost per qualified lead fell from over $60 to $19, and the neighborhood guides now own 25 page-one positions that portals can't displace. Agents finally market under one brand that compounds.",
    },
    services: {
      title: "What's included in real estate marketing",
      items: [
        { name: "Hyperlocal SEO", desc: "Neighborhood and building pages that outrank portals for local buyer and seller searches." },
        { name: "Listing Page Optimization", desc: "Templates and schema that get listings indexed fast and ranking for address and building queries." },
        { name: "Home Valuation Funnels", desc: "Instant-estimate tools that capture seller leads with real intent — routed to agents instantly." },
        { name: "Google & Meta Ads", desc: "Geo-targeted campaigns for listings, open houses, and lead magnets with strict qualification." },
        { name: "Agent Personal Brands", desc: "Individual agent pages, review engines, and content libraries that build trust without splitting the brand." },
        { name: "Developer & New Builds", desc: "Launch campaigns for developments — from interest lists to booking appointments." },
        { name: "Email & SMS Nurturing", desc: "Drip campaigns for buyers-in-waiting and past clients that generate repeat and referral business." },
        { name: "Proptech Marketing", desc: "Demand generation for real estate technology: SEO, content, and product-led growth." },
      ],
    },
    faq: [
      { q: "Can you really compete with Zillow and the big portals?", a: "Not head-on — and we won't pretend otherwise. But portals win generic searches while losing hyperlocal ones. '3-bedroom houses in [specific neighborhood]', '[condo building name] resale prices', and 'is [area] a good investment' are winnable, high-intent queries. That hyperlocal layer is exactly where we build your moat." },
      { q: "How do you improve lead quality, not just volume?", a: "We design funnels that qualify before an agent ever picks up the phone: valuation tools that reveal motivation and timeline, screening questions embedded in forms, and lead scoring that routes only serious prospects to agents. Expect fewer raw leads and dramatically more showings." },
      { q: "Do you work with individual agents or only brokerages?", a: "Both. For brokerages we build the brand system plus agent-level pages. For individual agents and teams we run a focused local strategy: personal SEO, reviews, and hyperlocal content that makes you the obvious choice in your farm area." },
      { q: "How fast will we see results?", a: "Paid campaigns can produce leads in the first week — qualified ones within the first month once scoring is tuned. Local SEO momentum typically builds over months 2–4, with the compounding neighborhood strategy paying off from month 4 onward. We report leads, showings, and cost per signed deal — not just traffic." },
      { q: "Do you understand our market if it's not in the US?", a: "Yes — we serve clients across 18+ countries and adapt to local portals (Rightmove, Idealista, Bayut, domain.com.au), regulations, and buyer behavior. Strategy is built around how people actually search for property in your market, not a translated US playbook." },
    ],
    finalCta: {
      headline: "Own your local market — not just your listings.",
      subheading:
        "Free real estate marketing audit — see where you rank in your farm area, what your funnel leaks, and the fastest path to more showings.",
    },
  },
];

export const getIndustry = (slug: string): IndustryContent | undefined =>
  INDUSTRIES.find((i) => i.slug === slug);
