import {
  Search,
  Bot,
  Target,
  PenLine,
  Megaphone,
  TrendingUp,
  Code2,
  Sparkles,
  Zap,
  BarChart,
  ShieldCheck,
  Wrench,
  Rocket,
  Monitor,
  LineChart,
  Mail,
  Users,
  MousePointer,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type ServiceSlug =
  | "seo"
  | "ai-search"
  | "lead-generation"
  | "content-marketing"
  | "ppc"
  | "cro"
  | "ai-automation"
  | "website-development"
  | "ai-content-marketing"
  | "performance-marketing";

/**
 * Icon registry — services reference icons by key (stable across the DB)
 * instead of storing component references. Consumers resolve with
 * getServiceIcon(). New/admin-added services can reuse any of these keys.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  search: Search,
  bot: Bot,
  target: Target,
  "pen-line": PenLine,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  "code-2": Code2,
  sparkles: Sparkles,
  zap: Zap,
  "bar-chart": BarChart,
  "shield-check": ShieldCheck,
  wrench: Wrench,
  rocket: Rocket,
  monitor: Monitor,
  "line-chart": LineChart,
  mail: Mail,
  users: Users,
  "mouse-pointer": MousePointer,
  message: MessageSquare,
  settings: Settings,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);

export function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key] ?? Sparkles;
}

export type ServiceContent = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: string; // key into SERVICE_ICONS
  accent: string;
  border: string;
  cardDesc?: string; // grid card description (populated via merge/defaults)
  cardPoints?: string[]; // grid card bullets (populated via merge/defaults)
  hero: {
    eyebrow: string;
    headline: string;
    highlight: string;
    subheading: string;
    cta: string;
  };
  problem: {
    title: string;
    intro: string;
    points: { title: string; desc: string }[];
  };
  framework: {
    title: string;
    intro: string;
    pillars: { name: string; desc: string }[];
  };
  subServices: {
    title: string;
    items: { name: string; desc: string }[];
  };
  process: {
    title: string;
    steps: { no: string; title: string; desc: string }[];
  };
  results: {
    title: string;
    intro: string;
    metrics: { value: string; label: string }[];
    blurb: string;
  };
  faq: { q: string; a: string }[];
  finalCta: {
    headline: string;
    subheading: string;
  };
};

export const SERVICES: ServiceContent[] = [
  // ────────── SEO ──────────
  {
    slug: "seo",
    name: "SEO Services",
    shortName: "SEO",
    tagline: "Organic visibility that compounds into revenue",
    icon: "search",
    accent: "from-brand-500/20 to-brand-700/10",
    border: "border-brand-500/30",
    hero: {
      eyebrow: "SEO Services",
      headline: "Grow organic traffic that turns into",
      highlight: "revenue.",
      subheading:
        "We engineer sustainable organic growth through technical SEO, content strategy, and authority building — ranking you for the keywords that actually drive pipeline, not just vanity traffic.",
      cta: "Get an SEO Strategy",
    },
    problem: {
      title: "Why most SEO campaigns fail",
      intro:
        "Businesses invest thousands into SEO every month and see nothing in return. Here's why the typical engagement underdelivers — and how we do it differently.",
      points: [
        { title: "Ranking for the wrong keywords", desc: "Most agencies chase high-volume terms that look impressive in reports but never convert. We target buyer-intent keywords tied to revenue." },
        { title: "No technical foundation", desc: "Content piled on top of broken crawlability, slow pages, and indexing issues. Without a solid technical base, no amount of content will rank." },
        { title: "Generic content factory", desc: "Templated blog posts written for search engines, not humans. Google's algorithms now reward depth, expertise, and genuine usefulness." },
        { title: "No measurement beyond rankings", desc: "Ranking reports that don't connect to traffic, leads, or revenue. If SEO isn't moving pipeline, it isn't working." },
      ],
    },
    framework: {
      title: "The Climbix SEO Framework",
      intro:
        "Our framework treats SEO as a revenue channel, not a traffic channel. Every component is engineered to compound over time and tie back to business outcomes.",
      pillars: [
        { name: "Technical Foundation", desc: "Crawlability, indexation, site architecture, Core Web Vitals, and structured data — the infrastructure that lets everything else rank." },
        { name: "Keyword Intent Mapping", desc: "We map keywords by funnel stage and buyer intent, prioritizing terms that drive qualified traffic and pipeline — not just search volume." },
        { name: "Authority Building", desc: "Digital PR, strategic link building, and thought leadership that earns citations from sites Google already trusts in your industry." },
        { name: "Revenue Attribution", desc: "Every ranking, every page, every optimization is traced through to leads and revenue. You always know what SEO is actually delivering." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Technical SEO", desc: "Crawl audits, site architecture, Core Web Vitals, JavaScript SEO, and indexation strategy." },
        { name: "On-Page SEO", desc: "Title/meta optimization, internal linking, content pruning, and entity optimization." },
        { name: "Content Strategy", desc: "Topic clusters, editorial calendar, and buyer-intent content roadmaps." },
        { name: "Link Building", desc: "Digital PR, broken link building, resource pages, and competitor link reclamation." },
        { name: "Digital PR", desc: "Data-driven campaigns and thought leadership that earn editorial coverage and citations." },
        { name: "Local SEO", desc: "Google Business Profile, local citations, review strategy, and map pack optimization." },
        { name: "International SEO", desc: "Hreflang, multi-region targeting, and localized content for global expansion." },
        { name: "SEO Reporting", desc: "Monthly dashboards tying rankings to traffic, leads, and revenue — in plain business language." },
      ],
    },
    process: {
      title: "How we run your SEO engagement",
      steps: [
        { no: "01", title: "Audit", desc: "Deep technical, content, and backlink audit. We benchmark where you are and identify the biggest gaps." },
        { no: "02", title: "Strategy", desc: "Keyword universe, content roadmap, technical fix plan, and 90-day priorities tied to revenue targets." },
        { no: "03", title: "Implementation", desc: "Technical fixes, content production, on-page optimization, and link building executed in tight sprints." },
        { no: "04", title: "Optimization", desc: "Monthly reviews, ranking tracking, content refreshes, and doubling down on what's driving pipeline." },
        { no: "05", title: "Reporting", desc: "Monthly business-language reports connecting SEO activity to traffic, leads, and revenue." },
      ],
    },
    results: {
      title: "What SEO delivers",
      intro:
        "SEO is a long-term investment, but the right strategy compounds. Here's what clients typically see within the first 6 months of working with us.",
      metrics: [
        { value: "+250%", label: "Organic traffic in 6 months" },
        { value: "+180%", label: "Qualified leads from organic" },
        { value: "+120%", label: "Organic-attributed revenue" },
        { value: "47%", label: "Keywords in top 3 positions" },
      ],
      blurb:
        "A SaaS workflow platform came to us with stagnant organic traffic and heavy paid acquisition dependency. Within two quarters, organic became their largest source of new business — cutting blended CAC by 38% and unlocking a new growth channel that continues to compound.",
    },
    faq: [
      { q: "How long until I see SEO results?", a: "Technical fixes and quick-win optimizations often deliver lifts in 30–60 days. Meaningful organic growth typically shows between months 3 and 6, with compounding results from month 6 onward. We set realistic milestones at the start and report against them monthly." },
      { q: "Do you guarantee specific rankings?", a: "No ethical agency can guarantee #1 rankings — Google's algorithm has hundreds of factors outside anyone's control. What we guarantee: transparent process, weekly visibility, data-driven decisions, and relentless focus on business outcomes. If a strategy isn't working, we pivot fast." },
      { q: "Do you write the content, or do we?", a: "Both options are available. We have an in-house content team that produces SEO-optimized content, or we can provide editorial briefs for your team to execute. Most clients use a hybrid — we handle strategic pillar content, your team handles product-specific updates." },
      { q: "How is your SEO pricing structured?", a: "Engagements are scoped based on your goals, market competitiveness, and current organic position. Most SEO retainers start at $3,500/month and scale with scope. We don't believe in one-size-fits-all packages — every proposal is custom." },
    ],
    finalCta: {
      headline: "Let's grow your organic visibility.",
      subheading:
        "Get a free SEO audit and a custom growth strategy. We'll show you exactly where you're losing organic traffic and how to fix it.",
    },
  },

  // ────────── AI Search ──────────
  {
    slug: "ai-search",
    name: "AI Search Optimization",
    shortName: "AI Search",
    tagline: "Get discovered in ChatGPT, Gemini & Perplexity",
    icon: "bot",
    accent: "from-violet-500/20 to-violet-700/10",
    border: "border-violet-500/30",
    hero: {
      eyebrow: "AI Search Optimization (GEO / AEO)",
      headline: "Be the answer when AI",
      highlight: "answers.",
      subheading:
        "Search is shifting from blue links to AI-generated answers. We engineer your brand to appear in ChatGPT, Gemini, Perplexity, and Google AI Overviews — the new frontier of search visibility.",
      cta: "Get an AI Search Strategy",
    },
    problem: {
      title: "Why brands are disappearing from search",
      intro:
        "AI-powered search is rewriting the rules. If your SEO strategy was built for 2019 Google, you're already losing visibility — even if your rankings haven't moved.",
      points: [
        { title: "AI answers are replacing clicks", desc: "ChatGPT, Gemini, and Google AI Overviews answer user questions directly — users never click through to your site. Visibility now means being cited inside the answer." },
        { title: "Traditional SEO doesn't guarantee AI inclusion", desc: "Ranking #1 on Google doesn't mean ChatGPT will mention you. AI models surface different sources based on authority, structure, and citation-worthiness." },
        { title: "No structured data, no AI visibility", desc: "AI models rely on structured data, entity clarity, and schema to understand who you are and what you do. Most sites are invisible to them." },
        { title: "Competitors are already optimizing", desc: "Early movers are locking in AI citations that compound over time. Every month you wait makes it harder to catch up." },
      ],
    },
    framework: {
      title: "Our AI Search Framework (GEO + AEO)",
      intro:
        "We combine Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) to make your brand the most citable source in your category — across every AI platform that matters.",
      pillars: [
        { name: "Entity Optimization", desc: "We establish your brand as a recognized entity across knowledge graphs, wikis, and authoritative sources — so AI models understand and remember you." },
        { name: "Structured Data & Schema", desc: "Comprehensive schema markup (Organization, FAQ, HowTo, Product, Article) that gives AI models machine-readable context about your business." },
        { name: "Citation-Worthy Content", desc: "Content structured for AI extraction — definitive answers, original data, expert quotes, and clear factual claims that AI models prefer to cite." },
        { name: "Cross-Platform Presence", desc: "Strategic presence on the sources AI models trust most — Reddit, Wikipedia, industry publications, and authoritative third-party platforms." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "GEO Audit", desc: "Baseline visibility across ChatGPT, Gemini, Perplexity, and Google AI Overviews for your core topics." },
        { name: "Entity Optimization", desc: "Knowledge graph setup, Wikidata, and brand entity establishment across the AI ecosystem." },
        { name: "Structured Data", desc: "Full schema markup implementation — Organization, FAQ, HowTo, Product, Article, and custom schemas." },
        { name: "Answer-Optimized Content", desc: "Content rewritten or created to be the most citable answer in your category." },
        { name: "AI Citation Tracking", desc: "Monthly tracking of brand mentions across AI platforms — measuring real visibility, not just rankings." },
        { name: "Cross-Platform PR", desc: "Strategic placements on the authoritative sources AI models weight most heavily." },
        { name: "Competitive AI Monitoring", desc: "Track which competitors are getting cited and reverse-engineer why." },
        { name: "LLM Training Optimization", desc: "Position your content to be included in future model training data for compounding visibility." },
      ],
    },
    process: {
      title: "How we optimize for AI search",
      steps: [
        { no: "01", title: "Baseline Audit", desc: "Measure your current visibility across ChatGPT, Gemini, Perplexity, and Google AI Overviews for priority queries." },
        { no: "02", title: "Entity Setup", desc: "Establish your brand entity across knowledge graphs, structured data, and authoritative reference sources." },
        { no: "03", title: "Content Engineering", desc: "Create and optimize content specifically structured for AI extraction and citation." },
        { no: "04", title: "Authority Building", desc: "Earn placements on the third-party sources AI models trust and cite most frequently." },
        { no: "05", title: "Tracking & Iteration", desc: "Monthly AI citation tracking, competitive analysis, and content refinement based on what's getting cited." },
      ],
    },
    results: {
      title: "What AI Search delivers",
      intro:
        "AI search visibility compounds — once you're being cited, models reinforce your authority over time. Here's what early clients are seeing.",
      metrics: [
        { value: "+340%", label: "AI citations in 4 months" },
        { value: "12", label: "Priority queries where brand is cited" },
        { value: "+62%", label: "Branded search volume lift" },
        { value: "3.2x", label: "Demo requests from AI referrals" },
      ],
      blurb:
        "A B2B analytics platform was invisible in ChatGPT and Perplexity for their core category. After four months of entity optimization, structured data, and citation-worthy content, they're now cited as a top recommendation in 12 priority queries — driving a steady stream of high-intent demo requests from AI referrals.",
    },
    faq: [
      { q: "Is AI Search Optimization the same as SEO?", a: "No. Traditional SEO optimizes for Google's blue-link results. AI Search Optimization (GEO/AEO) optimizes for AI-generated answers in ChatGPT, Gemini, Perplexity, and Google AI Overviews. The two are complementary — strong SEO helps, but AI requires additional focus on entities, structured data, and citation-worthy content." },
      { q: "How do you measure AI visibility?", a: "We track brand mentions and citations across ChatGPT, Gemini, Perplexity, and Google AI Overviews for your priority queries. Monthly reports show which queries cite you, which cite competitors, and how your share of AI voice is trending over time." },
      { q: "How quickly will AI models start citing my brand?", a: "Entity setup and structured data can start producing results within 4–8 weeks. Building citation-worthy content and authoritative third-party presence typically takes 2–4 months to show compounding results. AI visibility grows non-linearly — once you're being cited, models reinforce your authority." },
      { q: "Should I do AI Search Optimization or traditional SEO first?", a: "Both, in parallel. Traditional SEO builds the foundation (technical health, content, authority) that AI search depends on. AI Search Optimization layers on entity clarity, structured data, and citation-focused content. We typically run both as an integrated engagement." },
    ],
    finalCta: {
      headline: "Get cited by AI. Get found by buyers.",
      subheading:
        "Free AI visibility audit — see where you rank in ChatGPT, Gemini, and Perplexity for your core topics, and what it takes to get cited.",
    },
  },

  // ────────── Lead Generation ──────────
  {
    slug: "lead-generation",
    name: "Lead Generation",
    shortName: "Lead Gen",
    tagline: "Attract people who are ready to buy",
    icon: "target",
    accent: "from-amber-500/20 to-amber-700/10",
    border: "border-amber-500/30",
    hero: {
      eyebrow: "Lead Generation",
      headline: "Turn your website into a",
      highlight: "lead machine.",
      subheading:
        "We build intent-driven funnels that turn strangers into qualified leads — and qualified leads into pipeline you can actually close. No vanity metrics, just SQLs that sales wants to talk to.",
      cta: "Get a Lead Gen Strategy",
    },
    problem: {
      title: "Why most lead generation efforts waste money",
      intro:
        "Generating leads isn't the hard part. Generating qualified leads at a cost that makes business sense — that's where most funnels break down.",
      points: [
        { title: "Lots of leads, no pipeline", desc: "Forms filling up with low-intent contacts that never convert. Sales stops trusting marketing, and the funnel breaks down at handoff." },
        { title: "No lead qualification", desc: "Every form fill goes to sales regardless of fit, budget, or timing. Your sales team wastes hours on unqualified conversations." },
        { title: "Leaky funnels", desc: "Traffic hits the site, bounces, and never returns. No lead magnets, no nurture sequences, no retargeting — just lost opportunities." },
        { title: "Can't attribute revenue", desc: "Marketing reports leads, sales reports closed-won, and nobody can connect the two. You don't know which channels actually drive revenue." },
      ],
    },
    framework: {
      title: "Our Lead Generation Framework",
      intro:
        "We build end-to-end lead generation systems — from first touch to sales-ready handoff — engineered around your buyer's actual journey and your sales team's definition of qualified.",
      pillars: [
        { name: "Intent-Driven Traffic", desc: "We attract visitors who are actively researching solutions like yours — through SEO, paid search, and targeted content — not tire-kickers." },
        { name: "Conversion Architecture", desc: "Landing pages, lead magnets, and CTAs engineered to convert. Every page has a job, every form has a purpose, every interaction moves visitors closer to a conversation." },
        { name: "Lead Qualification & Routing", desc: "Smart forms, progressive profiling, and scoring rules that route only sales-ready leads to your team — and nurture the rest until they're ready." },
        { name: "Revenue Attribution", desc: "End-to-end tracking from first touch to closed-won. You know exactly which channels, campaigns, and content drive pipeline — and which to cut." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Funnel Architecture", desc: "End-to-end funnel design mapped to your buyer's journey from awareness to decision." },
        { name: "Lead Magnets", desc: "Audits, guides, templates, and tools that capture contact info in exchange for real value." },
        { name: "Landing Page Optimization", desc: "High-converting landing pages built and tested for every campaign and audience segment." },
        { name: "Lead Scoring & Qualification", desc: "Behavioral and demographic scoring that routes only sales-ready leads to your team." },
        { name: "Email Nurture Sequences", desc: "Automated drip campaigns that warm cold leads until they're ready for a sales conversation." },
        { name: "Retargeting Campaigns", desc: "Bring back visitors who didn't convert on first visit with targeted retargeting across channels." },
        { name: "CRM Integration", desc: "Seamless integration with HubSpot, Salesforce, Pipedrive, or your existing sales stack." },
        { name: "Revenue Attribution", desc: "Full-funnel tracking connecting marketing activity to pipeline and closed-won revenue." },
      ],
    },
    process: {
      title: "How we build your lead engine",
      steps: [
        { no: "01", title: "Funnel Audit", desc: "Map your current funnel, identify where leads leak, and benchmark conversion rates at each stage." },
        { no: "02", title: "Strategy & Architecture", desc: "Design your end-to-end funnel — traffic sources, lead magnets, qualification rules, and nurture flows." },
        { no: "03", title: "Build & Launch", desc: "Build landing pages, lead magnets, forms, scoring rules, nurture sequences, and CRM integrations." },
        { no: "04", title: "Optimize & Scale", desc: "A/B test, refine qualification criteria, and scale the channels and campaigns driving qualified pipeline." },
        { no: "05", title: "Report & Refine", desc: "Monthly reporting on leads, SQLs, pipeline, and revenue — with continuous funnel optimization." },
      ],
    },
    results: {
      title: "What lead generation delivers",
      intro:
        "A well-built lead engine transforms your website from a brochure into your highest-performing sales channel. Here's what clients typically see.",
      metrics: [
        { value: "+180%", label: "Qualified leads per month" },
        { value: "-40%", label: "Cost per qualified lead" },
        { value: "3.4x", label: "Lead-to-pipeline conversion" },
        { value: "62%", label: "Sales-team-accepted lead rate" },
      ],
      blurb:
        "A B2B professional services firm was burning budget on paid ads with poor conversion. We rebuilt their funnel from scratch — intent-driven landing pages, lead magnets, qualification scoring, and nurture sequences. Within 90 days, qualified leads doubled while cost per acquisition dropped 40%.",
    },
    faq: [
      { q: "What makes a lead 'qualified'?", a: "We define qualification with you — typically a combination of demographic fit (industry, company size, role) and behavioral signals (pages visited, content downloaded, pricing page views). Only leads that meet your agreed criteria get routed to sales; the rest enter nurture sequences until they're ready." },
      { q: "Do you work with our existing CRM?", a: "Yes. We integrate with HubSpot, Salesforce, Pipedrive, Zoho, and most popular CRMs. If you don't have one, we'll recommend and set up the right platform for your stage and budget." },
      { q: "How quickly can we expect more leads?", a: "Funnel rebuilds and landing page optimizations can produce lifts within 2–4 weeks. Lead magnets, nurture sequences, and scoring rules typically take 4–8 weeks to fully implement and optimize. Most clients see meaningful qualified-lead growth within the first 60 days." },
      { q: "Do you handle paid media for lead gen too?", a: "Yes — we manage Google Ads, LinkedIn Ads, and Meta Ads as part of an integrated lead generation engagement. Paid media is one traffic source within the broader funnel; we don't treat it as a standalone channel." },
    ],
    finalCta: {
      headline: "Stop generating leads. Start generating pipeline.",
      subheading:
        "Free funnel audit — see exactly where your website is leaking qualified leads and how to plug the gaps.",
    },
  },

  // ────────── Content Marketing ──────────
  {
    slug: "content-marketing",
    name: "Content Marketing",
    shortName: "Content",
    tagline: "Turn expertise into organic demand",
    icon: "pen-line",
    accent: "from-rose-500/20 to-rose-700/10",
    border: "border-rose-500/30",
    hero: {
      eyebrow: "Content Marketing",
      headline: "Content that ranks, educates,",
      highlight: "and converts.",
      subheading:
        "We create buyer-intent content positioned around what your customers actually search for — building authority, capturing demand, and turning your expertise into a compounding growth engine.",
      cta: "Get a Content Strategy",
    },
    problem: {
      title: "Why most content marketing fails",
      intro:
        "Businesses publish blog post after blog post and see nothing in return. The problem isn't effort — it's strategy, targeting, and execution quality.",
      points: [
        { title: "Content no one searches for", desc: "Posts written around internal topics instead of buyer search intent. Beautiful prose that generates zero traffic because nobody's looking for it." },
        { title: "No topical authority", desc: "Random articles with no connecting strategy. Google rewards depth and topical coverage — scattered content signals expertise in nothing." },
        { title: "Written for search, not humans", desc: "Keyword-stuffed articles that rank temporarily and then tank. Modern algorithms reward genuine depth, expertise, and reader value." },
        { title: "No conversion path", desc: "Traffic comes, reads, and leaves. No CTAs, no lead capture, no nurture — content that entertains but never drives business outcomes." },
      ],
    },
    framework: {
      title: "Our Content Marketing Framework",
      intro:
        "We build content engines that compound — every piece strategically positioned to capture search demand, build topical authority, and guide readers toward a conversation with your team.",
      pillars: [
        { name: "Intent-Driven Strategy", desc: "We map your buyer's questions at every funnel stage and build a content roadmap that captures demand where it already exists." },
        { name: "Topical Authority Clusters", desc: "Pillar pages surrounded by supporting articles that establish depth and coverage — signaling expertise to both Google and AI models." },
        { name: "Expert-Led Production", desc: "Content written by subject-matter experts, not content farms. Depth, originality, and genuine insight that earns rankings and citations." },
        { name: "Distribution & Conversion", desc: "Every piece has a distribution plan and a conversion path — social, email, partnerships, and CTAs that turn readers into leads." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Content Strategy", desc: "Buyer-intent keyword research, topical cluster mapping, and editorial roadmap." },
        { name: "Pillar Content", desc: "Comprehensive, authoritative pillar pages that anchor topic clusters and capture competitive keywords." },
        { name: "Supporting Articles", desc: "Cluster articles that build depth around pillars and capture long-tail intent." },
        { name: "Thought Leadership", desc: "Founder and executive bylined content that builds personal brand and industry authority." },
        { name: "Content Refreshes", desc: "Regular updates to existing content to maintain rankings and capture new search intent." },
        { name: "Distribution Strategy", desc: "Multi-channel distribution across social, email, partnerships, and communities." },
        { name: "Lead Magnet Creation", desc: "Gated content assets — guides, templates, tools — that capture leads from existing traffic." },
        { name: "Performance Reporting", desc: "Monthly reporting on traffic, rankings, leads, and revenue attributed to content." },
      ],
    },
    process: {
      title: "How we run your content engine",
      steps: [
        { no: "01", title: "Research & Strategy", desc: "Buyer persona research, intent keyword mapping, and topical cluster architecture." },
        { no: "02", title: "Editorial Planning", desc: "Editorial calendar with prioritized topics, target keywords, and conversion goals per piece." },
        { no: "03", title: "Production", desc: "Expert-led content production — pillar pages, cluster articles, and thought leadership." },
        { no: "04", title: "Optimization", desc: "On-page SEO, internal linking, and content refreshes to maximize rankings and conversions." },
        { no: "05", title: "Distribution & Reporting", desc: "Multi-channel distribution and monthly reporting on traffic, leads, and revenue from content." },
      ],
    },
    results: {
      title: "What content marketing delivers",
      intro:
        "Content is the only marketing channel that compounds — every article is a permanent asset that keeps driving traffic and leads for years. Here's what clients typically see.",
      metrics: [
        { value: "+250%", label: "Organic traffic in 6 months" },
        { value: "47", label: "Keywords ranked in top 10" },
        { value: "+95%", label: "Organic-attributed revenue" },
        { value: "3.2x", label: "Lead-to-customer conversion from content" },
      ],
      blurb:
        "An ecommerce DTC brand had stagnant revenue despite consistent ad spend. We built a topical authority content engine around their category — pillar pages, buyer-intent articles, and AI-optimized content. Within six months, organic revenue grew 95% and organic became their highest-ROI channel.",
    },
    faq: [
      { q: "Do you write the content or do we?", a: "Both options are available. Our in-house team produces expert-led content, or we provide detailed editorial briefs for your team to execute. Most clients use a hybrid — we handle strategic pillar content, your team handles product-specific updates." },
      { q: "How often will you publish?", a: "Publishing cadence depends on your goals, budget, and market competitiveness. Most engagements range from 4–12 pieces per month. Quality always trumps quantity — we'd rather publish 4 exceptional pieces than 12 mediocre ones." },
      { q: "How long until content drives results?", a: "New content typically starts generating traffic within 4–8 weeks of publishing. Meaningful compounding growth usually shows between months 3 and 6. Content refreshes on existing pages can deliver lifts in 2–4 weeks." },
      { q: "Can you help with content distribution too?", a: "Yes. Every piece comes with a distribution plan — social posts, email newsletter features, partnership outreach, and community sharing. We can also manage paid content amplification if it fits your strategy." },
    ],
    finalCta: {
      headline: "Turn your expertise into demand.",
      subheading:
        "Free content audit — see what content you're missing, what's underperforming, and how to build an engine that compounds.",
    },
  },

  // ────────── PPC ──────────
  {
    slug: "ppc",
    name: "PPC Advertising",
    shortName: "PPC",
    tagline: "Fast, targeted, measurable leads",
    icon: "megaphone",
    accent: "from-sky-500/20 to-sky-700/10",
    border: "border-sky-500/30",
    hero: {
      eyebrow: "PPC Advertising",
      headline: "Paid media that earns its",
      highlight: "budget back.",
      subheading:
        "We build high-performing paid campaigns across Google, Meta, and LinkedIn — engineered for measurable ROI, not vanity metrics. Every dollar tracked from click to closed-won revenue.",
      cta: "Get a PPC Strategy",
    },
    problem: {
      title: "Why most PPC campaigns bleed money",
      intro:
        "Paid media is the fastest way to burn budget if it's not engineered correctly. Here's why most accounts underperform — and how we fix them.",
      points: [
        { title: "Targeting the wrong audience", desc: "Broad audience targeting that burns budget on people who will never buy. Precise intent and lookalike targeting is what drives efficient CPA." },
        { title: "Poor landing page experience", desc: "Ads send traffic to generic homepages or slow, unfocused landing pages. Click-through means nothing if the page doesn't convert." },
        { title: "No conversion tracking", desc: "Campaigns optimized for clicks instead of revenue. Without proper tracking, you're guessing — and Google is happy to take your money." },
        { title: "Set-and-forget management", desc: "Campaigns launched and left to run. Ad platforms decay without active management — bids drift, ads fatigue, audiences saturate." },
      ],
    },
    framework: {
      title: "Our PPC Framework",
      intro:
        "We treat paid media as an investment with expected returns — not a guessing game. Every campaign is built around your revenue targets and optimized relentlessly for ROI.",
      pillars: [
        { name: "Intent-Driven Targeting", desc: "We target users based on demonstrated intent — search queries, behaviors, and lookalike audiences modeled on your best customers." },
        { name: "Conversion-First Landing Pages", desc: "Custom landing pages for every campaign and audience segment — engineered to convert, not just to receive traffic." },
        { name: "Revenue Attribution", desc: "Full-funnel tracking from ad click to closed-won. We optimize campaigns against revenue, not clicks — so budget flows to what works." },
        { name: "Active Optimization", desc: "Weekly bid management, creative testing, audience refinement, and budget reallocation. Campaigns that decay get cut; winners get scaled." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Google Ads", desc: "Search, Performance Max, Display, YouTube, and Shopping campaign management." },
        { name: "Meta Ads", desc: "Facebook, Instagram, and Audience Network campaigns with full-funnel targeting." },
        { name: "LinkedIn Ads", desc: "B2B campaigns with precise job-title, company-size, and industry targeting." },
        { name: "Landing Page Optimization", desc: "Custom landing pages built and A/B tested for every campaign segment." },
        { name: "Retargeting", desc: "Cross-platform retargeting to bring back visitors who didn't convert on first visit." },
        { name: "Conversion Tracking", desc: "Server-side tracking, GA4 integration, and revenue attribution setup." },
        { name: "Creative Production", desc: "Ad creative — copy, images, and video — produced and tested continuously." },
        { name: "Bid Management", desc: "Active bid optimization, budget allocation, and campaign scaling decisions weekly." },
      ],
    },
    process: {
      title: "How we manage your PPC",
      steps: [
        { no: "01", title: "Account Audit", desc: "Deep audit of existing accounts — structure, targeting, creative, landing pages, and tracking setup." },
        { no: "02", title: "Strategy & Build", desc: "Campaign architecture, audience strategy, landing page design, and tracking implementation." },
        { no: "03", title: "Launch & Test", desc: "Campaign launch with multiple creatives, audiences, and landing pages for A/B testing." },
        { no: "04", title: "Optimize & Scale", desc: "Weekly optimization — cut losers, scale winners, test new audiences and creatives continuously." },
        { no: "05", title: "Report & Refine", desc: "Monthly reporting on spend, CPA, pipeline, and ROAS — with strategic recommendations." },
      ],
    },
    results: {
      title: "What PPC delivers",
      intro:
        "Well-managed PPC is the fastest way to generate qualified pipeline. Here's what clients typically see within the first 90 days of working with us.",
      metrics: [
        { value: "-40%", label: "Cost per acquisition" },
        { value: "+200%", label: "More qualified leads" },
        { value: "+165%", label: "Return on ad spend" },
        { value: "3.8x", label: "Pipeline generated per $1 spent" },
      ],
      blurb:
        "A B2B professional services firm was spending $40K/month on Google Ads with a CPA that made growth unsustainable. We rebuilt the account structure, launched conversion-optimized landing pages, and implemented revenue tracking. Within 90 days, CPA dropped 40% and lead volume doubled — making paid media their most predictable growth channel.",
    },
    faq: [
      { q: "What's the minimum ad spend you manage?", a: "We typically manage accounts spending $10,000/month or more across platforms. Below that threshold, it's difficult to run meaningful A/B tests and justify management fees. For smaller budgets, we offer strategy consulting and training instead." },
      { q: "Which platforms do you specialize in?", a: "Google Ads (Search, Performance Max, Display, YouTube, Shopping), Meta Ads (Facebook, Instagram), and LinkedIn Ads. We also work with TikTok, Reddit, and Twitter/X for specific B2C and brand-awareness objectives." },
      { q: "How are your management fees structured?", a: "Most engagements are a flat monthly management fee based on ad spend tier and campaign complexity — typically 10–15% of spend. We don't take a percentage of revenue and we don't have long-term contracts. Everything is month-to-month." },
      { q: "How quickly will PPC start delivering leads?", a: "New campaigns can start generating leads within days of launch. Meaningful optimization and CPA reduction typically takes 4–8 weeks of testing. We recommend a 90-day runway before evaluating campaign-level ROI." },
    ],
    finalCta: {
      headline: "Make every ad dollar accountable.",
      subheading:
        "Free PPC account audit — see where your budget is leaking and how to restructure for measurable ROI.",
    },
  },

  // ────────── CRO ──────────
  {
    slug: "cro",
    name: "Conversion Rate Optimization",
    shortName: "CRO",
    tagline: "Turn more visitors into customers",
    icon: "trending-up",
    accent: "from-orange-500/20 to-orange-700/10",
    border: "border-orange-500/30",
    hero: {
      eyebrow: "Conversion Rate Optimization",
      headline: "More revenue from the traffic",
      highlight: "you already have.",
      subheading:
        "We turn your existing website traffic into paying customers through data-driven experimentation, UX improvements, and funnel optimization — without spending more on acquisition.",
      cta: "Get a CRO Strategy",
    },
    problem: {
      title: "Why most websites convert poorly",
      intro:
        "You're already paying for traffic — through SEO, ads, and content. If your site converts at 2% instead of 4%, you're leaving half your revenue on the table with every visitor.",
      points: [
        { title: "No experimentation program", desc: "Decisions made by opinion instead of data. Without a structured A/B testing program, you're guessing at what works — and guesses are usually wrong." },
        { title: "Friction everywhere", desc: "Long forms, confusing navigation, slow pages, and unclear CTAs. Every friction point is a visitor who leaves instead of converts." },
        { title: "No funnel analysis", desc: "You don't know where visitors drop off — which pages, which steps, which moments lose them. You can't fix what you can't see." },
        { title: "Mobile experience ignored", desc: "60%+ of traffic is mobile, but most sites are designed desktop-first. Poor mobile UX silently kills conversion rates." },
      ],
    },
    framework: {
      title: "Our CRO Framework",
      intro:
        "We treat your website as a revenue system — every page, every form, every CTA engineered to move visitors closer to conversion. Decisions driven by data, not opinion.",
      pillars: [
        { name: "Funnel Diagnosis", desc: "We map every step of your conversion funnel and identify exactly where visitors drop off — using analytics, heatmaps, and session recordings." },
        { name: "Hypothesis-Driven Testing", desc: "Every test starts with a hypothesis grounded in data and user psychology — not random ideas. We test what's most likely to move the needle." },
        { name: "UX & Friction Removal", desc: "We redesign forms, simplify navigation, speed up pages, and remove every ounce of friction that stands between visitors and conversion." },
        { name: "Continuous Experimentation", desc: "CRO isn't a project — it's a discipline. We run a continuous testing program that compounds conversion gains over time." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Funnel Analysis", desc: "End-to-end funnel mapping with drop-off identification at every stage." },
        { name: "Heatmap & Session Analysis", desc: "Hotjar, Crazy Egg, or Microsoft Clarity setup with regular review of user behavior." },
        { name: "A/B Testing Program", desc: "Structured testing roadmap with prioritized experiments based on impact and effort." },
        { name: "Landing Page Optimization", desc: "Continuous redesign and testing of key landing pages for maximum conversion." },
        { name: "Form Optimization", desc: "Form length, field, and flow optimization to reduce abandonment." },
        { name: "Mobile UX Optimization", desc: "Mobile-specific design and UX improvements for mobile-first visitors." },
        { name: "Page Speed Optimization", desc: "Core Web Vitals improvement — faster pages convert measurably better." },
        { name: "Personalization", desc: "Dynamic content and CTAs based on visitor source, behavior, and segment." },
      ],
    },
    process: {
      title: "How we run your CRO program",
      steps: [
        { no: "01", title: "Audit & Baseline", desc: "Full funnel audit, analytics review, heatmap setup, and conversion baseline establishment." },
        { no: "02", title: "Hypothesis Roadmap", desc: "Prioritized list of test hypotheses based on data, impact, and effort." },
        { no: "03", title: "Experimentation", desc: "Design, build, and launch A/B tests — 2–4 experiments running at any given time." },
        { no: "04", title: "Analysis & Implementation", desc: "Statistical analysis of results, implementation of winners, and learning documentation." },
        { no: "05", title: "Continuous Optimization", desc: "Ongoing testing program that compounds conversion gains month over month." },
      ],
    },
    results: {
      title: "What CRO delivers",
      intro:
        "CRO is the highest-ROI marketing investment — you're extracting more value from traffic you've already paid for. Here's what clients typically see.",
      metrics: [
        { value: "+120%", label: "Conversion rate lift" },
        { value: "+62%", label: "Revenue per visitor" },
        { value: "-38%", label: "Bounce rate reduction" },
        { value: "4.2x", label: "Average ROAS on CRO investment" },
      ],
      blurb:
        "A SaaS company was converting 1.8% of demo-page visitors. Through a structured CRO program — funnel analysis, form optimization, social proof additions, and 14 A/B tests over six months — conversion rate climbed to 4.1%. Same traffic, 2.3x more demos. The CRO investment paid for itself in the first quarter.",
    },
    faq: [
      { q: "How much traffic do I need for CRO?", a: "Meaningful A/B testing requires a minimum of 1,000 conversions per month per page being tested — typically 10,000+ monthly visitors. For lower-traffic sites, we focus on UX improvements, heatmap analysis, and qualitative optimization until traffic supports statistical testing." },
      { q: "How long until I see conversion improvements?", a: "Quick UX fixes (form shortening, CTA clarity, page speed) can deliver lifts within 2–4 weeks. A/B test results typically take 2–6 weeks per experiment to reach statistical significance. Compounding conversion gains usually show between months 2 and 4." },
      { q: "What tools do you use?", a: "We work with Google Optimize alternatives (VWO, Optimizely, Convert), analytics platforms (GA4, Mixpanel, Amplitude), behavior tools (Hotjar, Crazy Egg, Microsoft Clarity), and your existing CMS. We recommend the right stack for your traffic volume and budget." },
      { q: "Do you redesign pages or just test?", a: "Both. Many tests require redesigned variants — new layouts, copy, forms, or CTAs. Our team includes UX designers and copywriters who build test variants, not just analysts who run tests on existing designs." },
    ],
    finalCta: {
      headline: "Stop paying for traffic you can't convert.",
      subheading:
        "Free conversion audit — see exactly where your funnel leaks and how much revenue you're leaving on the table.",
    },
  },

  // ────────── Performance Marketing ──────────
  {
    slug: "performance-marketing",
    name: "Performance Marketing",
    shortName: "Performance",
    tagline: "Data-driven campaigns engineered for measurable ROI",
    icon: "zap",
    accent: "from-amber-500/20 to-amber-700/10",
    border: "border-amber-500/30",
    hero: {
      eyebrow: "Performance Marketing",
      headline: "Paid media that delivers measurable",
      highlight: "business results.",
      subheading:
        "We build and manage high-performance paid campaigns across Google, Meta, LinkedIn, and beyond — optimized relentlessly for ROI, not vanity metrics. Every dollar tracked from click to closed-won revenue.",
      cta: "Get a Performance Strategy",
    },
    problem: {
      title: "Why most performance marketing underdelivers",
      intro:
        "Paid media is the fastest way to burn budget if it's not engineered correctly. Here's why most accounts underperform — and how we fix them.",
      points: [
        { title: "No revenue tracking", desc: "Campaigns optimized for clicks instead of revenue. Without proper tracking, you're guessing — and platforms are happy to take your money." },
        { title: "Poor audience targeting", desc: "Broad targeting that burns budget on people who will never buy. Precise intent and lookalike targeting is what drives efficient CPA." },
        { title: "Creative fatigue", desc: "Ads run for weeks without refresh. Audiences tune out, costs rise, and performance decays silently." },
        { title: "Siloed channels", desc: "Google, Meta, and LinkedIn managed independently with no unified strategy or attribution across channels." },
      ],
    },
    framework: {
      title: "Our Performance Marketing Framework",
      intro:
        "We treat paid media as an investment with expected returns — not a guessing game. Every campaign is built around your revenue targets and optimized relentlessly for ROI.",
      pillars: [
        { name: "Revenue Attribution", desc: "Full-funnel tracking from ad click to closed-won. We optimize campaigns against revenue, not clicks." },
        { name: "Multi-Channel Strategy", desc: "Unified campaigns across Google, Meta, LinkedIn, and TikTok with cross-channel attribution and budget optimization." },
        { name: "Creative Engineering", desc: "Continuous creative production and testing — ad copy, images, and video produced and refreshed weekly." },
        { name: "Active Optimization", desc: "Weekly bid management, audience refinement, and budget reallocation. Winners scale, losers get cut." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Google Ads", desc: "Search, Performance Max, Display, YouTube, and Shopping campaign management." },
        { name: "Meta Ads", desc: "Facebook, Instagram, and Audience Network campaigns with full-funnel targeting." },
        { name: "LinkedIn Ads", desc: "B2B campaigns with precise job-title, company-size, and industry targeting." },
        { name: "TikTok & Reddit Ads", desc: "Emerging platform advertising for brand awareness and younger demographics." },
        { name: "Conversion Tracking", desc: "Server-side tracking, GA4 integration, and revenue attribution setup." },
        { name: "Landing Page Optimization", desc: "Custom landing pages built and A/B tested for every campaign segment." },
        { name: "Creative Production", desc: "Ad creative — copy, images, and video — produced and tested continuously." },
        { name: "Bid Management", desc: "Active bid optimization, budget allocation, and campaign scaling decisions weekly." },
      ],
    },
    process: {
      title: "How we manage your performance marketing",
      steps: [
        { no: "01", title: "Account Audit", desc: "Deep audit of existing accounts — structure, targeting, creative, landing pages, and tracking setup." },
        { no: "02", title: "Strategy & Build", desc: "Campaign architecture, audience strategy, landing page design, and tracking implementation." },
        { no: "03", title: "Launch & Test", desc: "Campaign launch with multiple creatives, audiences, and landing pages for A/B testing." },
        { no: "04", title: "Optimize & Scale", desc: "Weekly optimization — cut losers, scale winners, test new audiences and creatives continuously." },
        { no: "05", title: "Report & Refine", desc: "Monthly reporting on spend, CPA, pipeline, and ROAS — with strategic recommendations." },
      ],
    },
    results: {
      title: "What performance marketing delivers",
      intro:
        "Well-managed performance marketing is the fastest way to generate qualified pipeline. Here's what clients typically see within the first 90 days.",
      metrics: [
        { value: "-40%", label: "Cost per acquisition" },
        { value: "+200%", label: "More qualified leads" },
        { value: "+165%", label: "Return on ad spend" },
        { value: "3.8x", label: "Pipeline per $1 spent" },
      ],
      blurb:
        "A B2B professional services firm was spending $40K/month on Google Ads with a CPA that made growth unsustainable. We rebuilt the account structure, launched conversion-optimized landing pages, and implemented revenue tracking. Within 90 days, CPA dropped 40% and lead volume doubled.",
    },
    faq: [
      { q: "What's the minimum ad spend you manage?", a: "We typically manage accounts spending $10,000/month or more across platforms. Below that threshold, it's difficult to run meaningful A/B tests and justify management fees." },
      { q: "Which platforms do you specialize in?", a: "Google Ads (Search, Performance Max, Display, YouTube, Shopping), Meta Ads (Facebook, Instagram), LinkedIn Ads, and TikTok Ads. We also work with Reddit and Twitter/X for specific objectives." },
      { q: "How are your management fees structured?", a: "Most engagements are a flat monthly management fee based on ad spend tier and campaign complexity — typically 10–15% of spend. Everything is month-to-month with no long-term contracts." },
      { q: "How quickly will PPC start delivering leads?", a: "New campaigns can start generating leads within days of launch. Meaningful optimization and CPA reduction typically takes 4–8 weeks of testing. We recommend a 90-day runway before evaluating campaign-level ROI." },
    ],
    finalCta: {
      headline: "Make every ad dollar accountable.",
      subheading: "Free performance marketing audit — see where your budget is leaking and how to restructure for measurable ROI.",
    },
  },

  // ────────── AI Automation ──────────
  {
    slug: "ai-automation",
    name: "AI Automation",
    shortName: "AI Automation",
    tagline: "Automate workflows, scale without adding headcount",
    icon: "sparkles",
    accent: "from-violet-500/20 to-violet-700/10",
    border: "border-violet-500/30",
    hero: {
      eyebrow: "AI Automation",
      headline: "Automate your growth with",
      highlight: "intelligent AI workflows.",
      subheading:
        "We build custom AI automation systems that handle repetitive marketing tasks — lead qualification, content distribution, email nurturing, reporting — so your team can focus on strategy and creativity.",
      cta: "Get an Automation Strategy",
    },
    problem: {
      title: "Why marketing teams are drowning in manual work",
      intro:
        "Marketing teams spend 60% of their time on repetitive tasks that AI can handle. Here's what's holding them back from automating.",
      points: [
        { title: "Manual lead qualification", desc: "Every form fill manually reviewed and routed. Hours wasted on unqualified leads while hot prospects go cold." },
        { title: "Content distribution chaos", desc: "Same content manually posted across 5+ platforms. Inconsistent timing, formatting, and tracking." },
        { title: "Reporting takes days", desc: "Weekly and monthly reports built by hand from multiple data sources. By the time they're ready, the data is old." },
        { title: "No nurture automation", desc: "Leads sit in CRM without follow-up. Email sequences triggered manually or not at all." },
      ],
    },
    framework: {
      title: "Our AI Automation Framework",
      intro:
        "We identify repetitive marketing workflows, build custom AI automations, and integrate them with your existing tools — creating systems that run 24/7 without human intervention.",
      pillars: [
        { name: "Workflow Audit", desc: "We map every marketing workflow and identify automation opportunities ranked by time saved and impact." },
        { name: "Custom AI Agents", desc: "We build custom AI agents that handle specific tasks — lead qualification, content scheduling, report generation." },
        { name: "Tool Integration", desc: "Connect your CRM, email platform, analytics, and content tools into automated workflows with API integrations." },
        { name: "Continuous Optimization", desc: "AI systems improve over time. We monitor performance, refine prompts, and expand automation scope monthly." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Lead Qualification AI", desc: "AI agents that score and route leads automatically based on fit and behavior signals." },
        { name: "Content Distribution", desc: "Automated publishing across social, email, and CMS platforms with AI-optimized timing." },
        { name: "Email Nurture Automation", desc: "AI-driven email sequences that adapt content based on recipient behavior and stage." },
        { name: "Automated Reporting", desc: "Custom dashboards that generate themselves — real-time data, no manual compilation." },
        { name: "Chatbot Integration", desc: "AI chatbots for website, WhatsApp, and messaging platforms that qualify and route leads." },
        { name: "CRM Automation", desc: "Automated data enrichment, pipeline updates, and follow-up reminders in your CRM." },
        { name: "Social Media Scheduling", desc: "AI-scheduled social posts optimized for engagement across all platforms." },
        { name: "Workflow Integration", desc: "Connect 100+ tools (Zapier, Make, custom APIs) into unified automated workflows." },
      ],
    },
    process: {
      title: "How we build your AI automation",
      steps: [
        { no: "01", title: "Workflow Audit", desc: "Map all marketing workflows and identify automation opportunities by time saved and ROI." },
        { no: "02", title: "Architecture Design", desc: "Design AI automation architecture with tool selection and integration blueprint." },
        { no: "03", title: "Build & Deploy", desc: "Build custom AI agents, set up integrations, and deploy automations with testing." },
        { no: "04", title: "Monitor & Optimize", desc: "Track automation performance, refine AI prompts, and expand to new workflows monthly." },
        { no: "05", title: "Scale & Train", desc: "Train your team on managing automations and scale to additional departments and use cases." },
      ],
    },
    results: {
      title: "What AI automation delivers",
      intro:
        "AI automation frees your team from repetitive work and creates systems that run 24/7. Here's what clients typically see.",
      metrics: [
        { value: "20+", label: "Hours saved per week" },
        { value: "3x", label: "Faster lead response time" },
        { value: "100%", label: "Reporting automation" },
        { value: "24/7", label: "Workflow coverage" },
      ],
      blurb:
        "A marketing team of 5 was spending 15+ hours weekly on manual reporting, content distribution, and lead routing. After implementing AI automation, those tasks now run automatically — freeing the team to focus on strategy and creative work. Lead response time dropped from 4 hours to 5 minutes.",
    },
    faq: [
      { q: "What tools do you use for AI automation?", a: "We work with OpenAI, Anthropic Claude, Zapier, Make, n8n, and custom API integrations. We also build custom AI agents using the latest LLMs tailored to your specific workflows." },
      { q: "How long does it take to implement?", a: "Most automation projects launch within 4-8 weeks. Simple workflows (reporting, scheduling) can be live in 2-3 weeks. Complex multi-system integrations may take 8-12 weeks." },
      { q: "Will AI replace our marketing team?", a: "No — AI augments your team by handling repetitive tasks, freeing them to focus on strategy, creativity, and relationship-building. Most clients see their teams become more productive and satisfied after automation." },
      { q: "How do you measure automation success?", a: "We track hours saved per week, lead response time reduction, error rate decrease, and revenue impact of automated workflows. Most clients see 15-25 hours saved weekly within 60 days." },
    ],
    finalCta: {
      headline: "Stop doing work AI can handle.",
      subheading: "Free automation audit — see which marketing workflows you can automate and how many hours you'll save.",
    },
  },

  // ────────── Website Development ──────────
  {
    slug: "website-development",
    name: "Website Development",
    shortName: "Web Dev",
    tagline: "High-performance websites built for conversions",
    icon: "code-2",
    accent: "from-sky-500/20 to-sky-700/10",
    border: "border-sky-500/30",
    hero: {
      eyebrow: "Website Development",
      headline: "Websites engineered for",
      highlight: "speed and conversions.",
      subheading:
        "We build high-performance websites using modern frameworks — designed for speed, SEO, and conversion. Not just beautiful, but built to rank, load fast, and turn visitors into customers.",
      cta: "Get a Web Development Quote",
    },
    problem: {
      title: "Why most websites fail to convert",
      intro:
        "A beautiful website that doesn't load fast, rank well, or convert visitors is an expensive brochure. Here's what holds most websites back.",
      points: [
        { title: "Slow load times", desc: "Pages take 5+ seconds to load. 40% of visitors bounce after 3 seconds — you're losing nearly half your traffic to impatience." },
        { title: "Poor mobile experience", desc: "60% of traffic is mobile, but most sites are designed desktop-first. Poor mobile UX silently kills conversion rates." },
        { title: "No SEO foundation", desc: "Beautiful sites built without SEO in mind. Missing structured data, slow Core Web Vitals, poor site architecture." },
        { title: "No conversion optimization", desc: "Pretty design with no conversion strategy. CTAs buried, forms too long, no clear path to action." },
      ],
    },
    framework: {
      title: "Our Website Development Framework",
      intro:
        "We build websites that are fast, SEO-optimized, and conversion-focused — using modern frameworks and best practices from day one.",
      pillars: [
        { name: "Performance First", desc: "Sub-2-second load times, perfect Core Web Vitals, and optimized assets. Speed is a feature, not an afterthought." },
        { name: "SEO Built-In", desc: "Technical SEO, structured data, semantic HTML, and site architecture designed to rank from launch day." },
        { name: "Conversion Architecture", desc: "Every page designed with a conversion goal — clear CTAs, optimized forms, and user journey mapping." },
        { name: "Modern Tech Stack", desc: "Next.js, TypeScript, Tailwind CSS, and headless CMS for performance, maintainability, and scalability." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Custom Web Design", desc: "Bespoke designs tailored to your brand, audience, and conversion goals — no templates." },
        { name: "Next.js Development", desc: "Modern React/Next.js development with server-side rendering for speed and SEO." },
        { name: "Ecommerce Development", desc: "Shopify, WooCommerce, or custom ecommerce builds optimized for conversions and speed." },
        { name: "Headless CMS", desc: "Contentful, Sanity, or Strapi integration for editorial flexibility without developer dependency." },
        { name: "API Integration", desc: "CRM, email, payment, and third-party API integrations for seamless functionality." },
        { name: "Performance Optimization", desc: "Core Web Vitals optimization, image compression, and CDN setup for sub-2-second loads." },
        { name: "SEO Foundation", desc: "Technical SEO, structured data, sitemaps, and site architecture built for ranking." },
        { name: "Analytics & Tracking", desc: "GA4, conversion tracking, and heatmap setup to measure and optimize performance." },
      ],
    },
    process: {
      title: "How we build your website",
      steps: [
        { no: "01", title: "Discovery & Strategy", desc: "Understand your goals, audience, and competitors. Define site architecture and conversion strategy." },
        { no: "02", title: "Design & Prototyping", desc: "Create custom designs and interactive prototypes in Figma for your review and approval." },
        { no: "03", title: "Development", desc: "Build with modern frameworks (Next.js, TypeScript) with SEO and performance built-in." },
        { no: "04", title: "Testing & QA", desc: "Cross-browser testing, performance optimization, and mobile responsiveness verification." },
        { no: "05", title: "Launch & Optimize", desc: "Deploy to production, set up analytics, and provide training on content management." },
      ],
    },
    results: {
      title: "What a performance website delivers",
      intro:
        "A well-built website is your hardest-working salesperson — available 24/7, loading instantly, and converting visitors. Here's what clients see.",
      metrics: [
        { value: "<2s", label: "Page load time" },
        { value: "+85%", label: "Better Core Web Vitals" },
        { value: "+60%", label: "Conversion rate lift" },
        { value: "100", label: "Lighthouse SEO score" },
      ],
      blurb:
        "A SaaS company's old WordPress site loaded in 6 seconds and converted at 0.8%. We rebuilt it on Next.js with performance optimization and conversion architecture. Load time dropped to 1.4 seconds, and conversion rate climbed to 2.3% — nearly 3x improvement.",
    },
    faq: [
      { q: "What technologies do you use?", a: "We build with Next.js 16, TypeScript, Tailwind CSS, and Prisma for database. For CMS, we use Contentful, Sanity, or Strapi. For ecommerce, we work with Shopify, WooCommerce, and custom Next.js commerce." },
      { q: "How long does a website take?", a: "Landing pages: 1-2 weeks. Marketing sites (5-15 pages): 4-8 weeks. Complex web applications: 8-16 weeks. Ecommerce sites: 6-12 weeks depending on catalog size and integrations." },
      { q: "Do you redesign existing sites or build from scratch?", a: "Both. We can redesign your existing site to improve performance and conversions, or build a completely new site from scratch. We'll recommend the best approach based on your current site's condition and goals." },
      { q: "Will I be able to update content myself?", a: "Yes. We integrate a headless CMS (Contentful, Sanity, or Strapi) that lets your team update content without developer help. We provide training and documentation on launch." },
    ],
    finalCta: {
      headline: "Build a website that actually grows your business.",
      subheading: "Free website consultation — see how a performance-optimized site can improve your speed, SEO, and conversions.",
    },
  },

  // ────────── AI Content Marketing ──────────
  {
    slug: "ai-content-marketing",
    name: "AI Content Marketing",
    shortName: "AI Content",
    tagline: "Scale content production with AI without losing quality",
    icon: "sparkles",
    accent: "from-rose-500/20 to-rose-700/10",
    border: "border-rose-500/30",
    hero: {
      eyebrow: "AI Content Marketing",
      headline: "Scale your content with",
      highlight: "AI-powered production.",
      subheading:
        "We combine AI tools with expert human editors to produce high-quality content at scale — 3x more articles, 2x faster, without sacrificing depth or originality. Content that ranks, educates, and converts.",
      cta: "Get an AI Content Strategy",
    },
    problem: {
      title: "Why content marketing doesn't scale",
      intro:
        "Most companies can't produce enough content to move the needle. Here's why content production stalls — and how AI changes the equation.",
      points: [
        { title: "Slow production cycles", desc: "Each article takes 2-3 weeks from brief to publish. By the time it's live, competitors have published 5 more." },
        { title: "Inconsistent quality", desc: "Different writers produce different quality. No systematic approach to research, structure, or editing." },
        { title: "No distribution strategy", desc: "Content published and forgotten. No repurposing, no social distribution, no email amplification." },
        { title: "Keyword gaps", desc: "Content created by feel instead of data. Missing the topics and keywords your audience actually searches for." },
      ],
    },
    framework: {
      title: "Our AI Content Marketing Framework",
      intro:
        "We use AI to accelerate research, drafting, and optimization — then apply expert human editors for depth, accuracy, and brand voice. The result: more content, faster, without quality compromise.",
      pillars: [
        { name: "AI-Powered Research", desc: "AI tools analyze search trends, competitor content, and keyword gaps to identify high-impact topics automatically." },
        { name: "AI Drafting + Human Editing", desc: "AI generates first drafts; expert editors refine for depth, accuracy, brand voice, and originality." },
        { name: "Content Repurposing", desc: "One pillar article becomes 10+ pieces — social posts, email snippets, video scripts, infographics — via AI." },
        { name: "Distribution Automation", desc: "AI-scheduled publishing across all channels with timing optimized for engagement." },
      ],
    },
    subServices: {
      title: "What's included",
      items: [
        { name: "Content Strategy", desc: "AI-driven keyword research and topical cluster mapping based on search demand and competitor gaps." },
        { name: "AI Article Production", desc: "AI-drafted, human-edited articles — 3x faster than traditional production with consistent quality." },
        { name: "Content Repurposing", desc: "Transform pillar articles into social posts, email sequences, video scripts, and infographics with AI." },
        { name: "SEO Optimization", desc: "AI-powered on-page SEO — meta tags, internal linking, and semantic keyword optimization." },
        { name: "Content Distribution", desc: "Automated publishing across blog, social, email, and syndication platforms with AI-optimized timing." },
        { name: "Editorial Calendar", desc: "AI-suggested content calendar based on search trends, seasonality, and business goals." },
        { name: "Performance Analytics", desc: "Track content performance by traffic, leads, and revenue — with AI insights for improvement." },
        { name: "Brand Voice Training", desc: "Train AI on your brand voice and style guide for consistent content across all production." },
      ],
    },
    process: {
      title: "How we run your AI content engine",
      steps: [
        { no: "01", title: "Strategy & Training", desc: "Keyword research, topical cluster mapping, and AI brand voice training." },
        { no: "02", title: "Editorial Planning", desc: "AI-suggested editorial calendar with prioritized topics and target keywords." },
        { no: "03", title: "Production", desc: "AI drafts + human editing pipeline producing 8-16 articles monthly." },
        { no: "04", title: "Repurposing & Distribution", desc: "Transform articles into 10+ content pieces and distribute across all channels." },
        { no: "05", title: "Optimize & Scale", desc: "Monthly performance review and content refresh based on AI-driven insights." },
      ],
    },
    results: {
      title: "What AI content marketing delivers",
      intro:
        "AI-accelerated content production lets you publish 3x more content without sacrificing quality. Here's what clients typically see.",
      metrics: [
        { value: "3x", label: "More content published" },
        { value: "60%", label: "Faster production time" },
        { value: "+250%", label: "Organic traffic in 6 months" },
        { value: "10+", label: "Pieces per pillar article" },
      ],
      blurb:
        "A B2B SaaS company was publishing 2 articles per month with a team of 2 writers. After implementing AI content marketing, they now publish 8 articles monthly — with better quality and consistency. Organic traffic grew 250% in 6 months, and organic became their #1 lead source.",
    },
    faq: [
      { q: "Does AI content rank on Google?", a: "Yes — when done right. Google rewards helpful, original, well-structured content regardless of whether AI was used. Our human editors ensure every article provides genuine value, original insights, and expert-level depth. AI accelerates production; humans ensure quality." },
      { q: "How is this different from just using ChatGPT?", a: "ChatGPT alone produces generic, surface-level content. We use AI as a drafting tool within a structured framework: keyword research, topical strategy, brand voice training, expert editing, and distribution. The AI does the heavy lifting; humans ensure quality and strategy." },
      { q: "How much content can you produce monthly?", a: "Most clients publish 8-16 articles per month (1,500-2,500 words each) plus repurposed content (social posts, email snippets, video scripts). We scale production to match your goals and budget." },
      { q: "Who owns the content?", a: "You own 100% of the content we produce. All articles, repurposed content, and AI brand voice training are your intellectual property. We transfer full ownership on delivery." },
    ],
    finalCta: {
      headline: "Scale your content without scaling your team.",
      subheading: "Free AI content audit — see how AI-accelerated production can 3x your content output without sacrificing quality.",
    },
  },
];

export const getService = (slug: string): ServiceContent | undefined =>
  SERVICES.find((s) => s.slug === slug);
