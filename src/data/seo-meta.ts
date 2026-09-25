/**
 * SEO metadata for every public route.
 * Titles and descriptions are written for humans first (clear value, natural
 * language, no keyword stuffing) while targeting the search queries real
 * buyers use. Keywords are supporting signals — never stuffed into copy.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://climbixmarketing.com";

export const SITE_NAME = "Climbix Marketing";

export const DEFAULT_OG_IMAGE = "/logo.svg";

export type PageMeta = {
  title: string;
  description: string;
  keywords: string[];
};

export const SERVICE_META: Record<string, PageMeta> = {
  seo: {
    title: "SEO Services That Drive Revenue",
    description:
      "Full-service SEO: technical audits, content strategy, authority building, and digital PR. We turn organic search into your most predictable revenue channel.",
    keywords: [
      "SEO services",
      "SEO agency",
      "search engine optimization company",
      "technical SEO audit",
      "link building agency",
      "organic growth agency",
    ],
  },
  "ai-search": {
    title: "AI Search Optimization (GEO & AEO)",
    description:
      "Get your brand cited in ChatGPT, Gemini, Perplexity, and Google AI Overviews. Entity optimization, structured data, and citation-worthy content engineered for AI search.",
    keywords: [
      "AI search optimization",
      "generative engine optimization",
      "GEO agency",
      "AEO services",
      "ChatGPT visibility",
      "AI Overviews optimization",
      "answer engine optimization",
    ],
  },
  "lead-generation": {
    title: "Lead Generation Services",
    description:
      "Intent-driven funnels, lead magnets, and nurture sequences that turn strangers into sales-qualified leads. Built for B2B pipeline and predictable revenue.",
    keywords: [
      "lead generation services",
      "B2B lead generation agency",
      "lead funnel agency",
      "demand generation",
      "sales qualified leads",
      "lead nurture agency",
    ],
  },
  "content-marketing": {
    title: "Content Marketing Services",
    description:
      "Buyer-intent content that ranks, educates, and converts. Strategy, SEO writing, thought leadership, and distribution — one connected content engine.",
    keywords: [
      "content marketing services",
      "content marketing agency",
      "SEO content writing",
      "B2B content strategy",
      "thought leadership content",
      "content distribution",
    ],
  },
  ppc: {
    title: "PPC Advertising Services",
    description:
      "Google Ads, Meta, and LinkedIn campaigns engineered for measurable ROI. Tight account structure, relentless testing, and transparent reporting.",
    keywords: [
      "PPC services",
      "Google Ads agency",
      "PPC management",
      "paid search agency",
      "LinkedIn ads agency",
      "retargeting agency",
    ],
  },
  cro: {
    title: "Conversion Rate Optimization (CRO)",
    description:
      "A/B testing, funnel analysis, and landing page optimization that turns more of your existing traffic into customers — without spending more on ads.",
    keywords: [
      "conversion rate optimization",
      "CRO agency",
      "A/B testing agency",
      "landing page optimization",
      "funnel optimization services",
      "website conversion audit",
    ],
  },
  "performance-marketing": {
    title: "Performance Marketing Agency",
    description:
      "Full-funnel paid media across Google, Meta, LinkedIn, and TikTok — optimized relentlessly for ROAS and pipeline, not vanity metrics.",
    keywords: [
      "performance marketing agency",
      "paid media agency",
      "ROAS optimization",
      "full funnel paid media",
      "TikTok ads agency",
    ],
  },
  "ai-automation": {
    title: "AI Marketing Automation",
    description:
      "Custom AI agents that qualify leads, draft content, route CRM workflows, and report automatically — marketing automation that actually saves hours.",
    keywords: [
      "AI marketing automation",
      "AI agents for marketing",
      "marketing workflow automation",
      "AI chatbot agency",
      "CRM automation agency",
    ],
  },
  "website-development": {
    title: "Website Development Services",
    description:
      "Fast, SEO-ready websites built with Next.js and headless CMS. Core Web Vitals, conversion architecture, and clean code from day one.",
    keywords: [
      "website development services",
      "Next.js development agency",
      "headless CMS development",
      "conversion focused web design",
      "Core Web Vitals optimization",
    ],
  },
  "ai-content-marketing": {
    title: "AI Content Marketing — Scaled With Human Editing",
    description:
      "Scale content production 3x with AI-assisted drafting and senior human editing. More articles, faster turnaround, no quality compromise.",
    keywords: [
      "AI content marketing",
      "AI content agency",
      "scaled content creation",
      "AI SEO content",
      "content repurposing services",
    ],
  },
};

export const INDUSTRY_META: Record<string, PageMeta> = {
  saas: {
    title: "SaaS Marketing Agency — SEO & Demand Gen",
    description:
      "Reduce CAC, grow MRR, and rank for high-intent software keywords. SEO, content, and demand generation built specifically for SaaS funnels.",
    keywords: [
      "SaaS marketing agency",
      "SaaS SEO agency",
      "B2B SaaS demand generation",
      "SaaS content marketing",
      "reduce CAC SaaS",
    ],
  },
  b2b: {
    title: "B2B Marketing Agency — Pipeline & ABM",
    description:
      "Generate qualified B2B pipeline with account-based marketing, LinkedIn ads, SEO, and ABM content programs built around your ICP.",
    keywords: [
      "B2B marketing agency",
      "ABM agency",
      "B2B lead generation",
      "LinkedIn ads agency",
      "B2B SEO services",
    ],
  },
  ecommerce: {
    title: "Ecommerce Marketing Agency — SEO & Paid Social",
    description:
      "Grow ecommerce revenue with collection page SEO, product content, Google Shopping, Meta ads, and retention marketing that lifts AOV and LTV.",
    keywords: [
      "ecommerce marketing agency",
      "ecommerce SEO services",
      "Shopify SEO agency",
      "Google Shopping management",
      "ecommerce PPC agency",
    ],
  },
  technology: {
    title: "Marketing for Technology Companies",
    description:
      "Win developer and enterprise-buyer searches with technical content, developer-facing SEO, and demand programs built for complex tech sales cycles.",
    keywords: [
      "technology marketing agency",
      "tech SEO agency",
      "developer marketing",
      "enterprise tech demand gen",
      "IT marketing agency",
    ],
  },
  healthcare: {
    title: "Healthcare Marketing Agency — Compliant Growth",
    description:
      "Patient and provider acquisition for clinics, medtech, and healthcare SaaS — HIPAA-aware campaigns, local SEO, and medical content that builds trust.",
    keywords: [
      "healthcare marketing agency",
      "medical SEO services",
      "patient acquisition agency",
      "healthcare digital marketing",
      "clinic local SEO",
    ],
  },
  "real-estate": {
    title: "Real Estate Marketing Agency",
    description:
      "Listing page SEO, local search domination, and lead funnels for real estate agencies, developers, and proptech — turn searches into showings.",
    keywords: [
      "real estate marketing agency",
      "real estate SEO services",
      "property marketing agency",
      "local SEO real estate",
      "real estate lead generation",
    ],
  },
};

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: "Climbix Marketing — SEO, AI Search & Lead Generation Agency",
    description:
      "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation — built for predictable, scalable revenue.",
    keywords: [
      "digital marketing agency",
      "SEO agency",
      "AI search optimization",
      "lead generation agency",
      "growth marketing",
    ],
  },
  services: {
    title: "Services — SEO, AI Search, Lead Gen, PPC & CRO",
    description:
      "Explore our full stack of growth services: SEO, AI Search Optimization, lead generation, content marketing, PPC advertising, and conversion optimization.",
    keywords: [
      "digital marketing services",
      "SEO services",
      "lead generation",
      "PPC agency",
      "CRO services",
    ],
  },
  industries: {
    title: "Industries We Serve",
    description:
      "Category-specific growth playbooks for SaaS, B2B, ecommerce, technology, healthcare, and real estate — benchmarks and keyword intel included.",
    keywords: [
      "industry marketing",
      "SaaS marketing",
      "B2B marketing",
      "ecommerce marketing",
      "healthcare marketing",
    ],
  },
  about: {
    title: "About Climbix Marketing — Team, Mission & Values",
    description:
      "We're a remote-first growth agency helping companies in 18+ countries turn search visibility into revenue. Meet the team and the way we work.",
    keywords: [
      "about climbix marketing",
      "digital marketing team",
      "remote first agency",
      "growth agency mission",
    ],
  },
  "case-studies": {
    title: "Case Studies — Real Client Results",
    description:
      "Detailed breakdowns of how we grew organic traffic, pipeline, and revenue for SaaS, B2B, and ecommerce clients. Real numbers, real strategies.",
    keywords: [
      "marketing case studies",
      "SEO case study",
      "lead generation results",
      "growth agency results",
    ],
  },
  process: {
    title: "Our Process — How We Grow Your Business",
    description:
      "Discover, strategy, execute, optimize, scale — a transparent five-stage growth process with weekly visibility and revenue-tied milestones.",
    keywords: [
      "marketing process",
      "SEO process",
      "growth methodology",
      "digital marketing workflow",
    ],
  },
  pricing: {
    title: "Pricing — Growth Plans From $2,500/mo",
    description:
      "Transparent monthly plans: Starter, Growth, and Scale. No long-term contracts, no hidden fees — scoped around your goals and funnel.",
    keywords: [
      "SEO pricing",
      "digital marketing cost",
      "marketing agency pricing",
      "SEO retainer cost",
      "PPC management pricing",
    ],
  },
  testimonials: {
    title: "Testimonials — What Clients Say",
    description:
      "4.9/5 average from 80+ verified reviews. Marketing leaders on working with Climbix: transparency, pipeline growth, and ROI they can measure.",
    keywords: [
      "marketing agency reviews",
      "climbix testimonials",
      "SEO agency reviews",
      "client results",
    ],
  },
  faq: {
    title: "FAQ — SEO, Pricing, Timelines & More",
    description:
      "Straight answers about SEO timelines, pricing, industries served, AI search optimization, and how engagements work at Climbix Marketing.",
    keywords: [
      "SEO questions",
      "how long does SEO take",
      "SEO cost questions",
      "digital marketing FAQ",
    ],
  },
  contact: {
    title: "Contact Us — Talk to a Strategist",
    description:
      "Tell us about your goals and we'll respond within one business day. Email, WhatsApp, or the contact form — whichever suits you.",
    keywords: [
      "contact SEO agency",
      "talk to marketing strategist",
      "digital marketing contact",
    ],
  },
  blog: {
    title: "Blog — Growth, SEO & AI Search Insights",
    description:
      "Practical guides and field notes on SEO, AI search visibility, lead generation, and conversion optimization — written by practitioners.",
    keywords: [
      "marketing blog",
      "SEO blog",
      "AI search blog",
      "growth marketing insights",
    ],
  },
  "seo-guides": {
    title: "SEO Guides — Step-by-Step Playbooks",
    description:
      "Free, in-depth SEO playbooks: technical audits, keyword research, link building, local SEO, and AI search optimization — updated regularly.",
    keywords: [
      "SEO guides",
      "SEO playbooks",
      "learn SEO",
      "keyword research guide",
      "link building guide",
    ],
  },
  "free-tools": {
    title: "Free Marketing Tools — Audit, ROI Calculator",
    description:
      "Free tools from Climbix: 30-point website audit, marketing ROI calculator, and more — no signup required, instant results.",
    keywords: [
      "free SEO tools",
      "website audit tool",
      "marketing ROI calculator",
      "free growth tools",
    ],
  },
  "free-growth-audit": {
    title: "Free Growth Audit — 30-Point Website Analysis",
    description:
      "Get a free 30-point audit of your website: technical SEO, AI-search readiness, conversions, and a prioritized 90-day roadmap. No strings attached.",
    keywords: [
      "free website audit",
      "free SEO audit",
      "growth audit",
      "website analysis free",
    ],
  },
  "strategy-call": {
    title: "Free Strategy Call — Book a Time",
    description:
      "Book a free 30-minute strategy call. We'll review your funnel, identify your biggest growth levers, and map a plan — no pressure, no obligation.",
    keywords: [
      "free marketing strategy call",
      "book SEO consultation",
      "marketing consultation",
    ],
  },
  locations: {
    title: "Locations — Global Reach, Local Expertise",
    description:
      "We serve clients across the USA, UK, Canada, Australia, UAE, Germany, and 12+ more countries with localized SEO and marketing programs.",
    keywords: [
      "international SEO agency",
      "global marketing agency",
      "local SEO services",
      "multi-country SEO",
    ],
  },
};
