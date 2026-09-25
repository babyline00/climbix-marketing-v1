/**
 * Card metadata for the homepage & overview service grids.
 * Pure data — safe to import from both server and client components.
 */

export const CARD_META: Record<
  string,
  { desc: string; points: string[] }
> = {
  seo: {
    desc: "Build sustainable organic growth with technical SEO, content strategy, and authority building that ranks for revenue-driving keywords.",
    points: ["Technical SEO", "On-Page SEO", "Link Building", "Digital PR"],
  },
  "ai-search": {
    desc: "Engineer your brand to appear in ChatGPT, Gemini, Perplexity, and AI-powered answers — the new frontier of search visibility.",
    points: ["GEO / AEO", "Entity Optimization", "Structured Data", "AI Citations"],
  },
  "lead-generation": {
    desc: "Build intent-driven funnels that turn strangers into qualified leads — and qualified leads into pipeline you can actually close.",
    points: ["Intent Funnels", "Lead Magnets", "Email Nurture", "SQL Routing"],
  },
  "content-marketing": {
    desc: "Create buyer-intent content that ranks, educates, and converts — positioned around what your customers actually search for.",
    points: ["Content Strategy", "SEO Content", "Thought Leadership", "Distribution"],
  },
  ppc: {
    desc: "Accelerate growth with high-performing paid campaigns across Google, Meta, and LinkedIn — engineered for measurable ROI.",
    points: ["Google Ads", "Meta Ads", "LinkedIn Ads", "Retargeting"],
  },
  cro: {
    desc: "Turn more of your existing traffic into paying customers with data-driven CRO experiments, UX improvements, and funnel optimization.",
    points: ["A/B Testing", "Funnel Optimization", "Landing Pages", "Heatmaps"],
  },
  "performance-marketing": {
    desc: "Data-driven paid campaigns across Google, Meta, LinkedIn, and TikTok — optimized relentlessly for ROI, not vanity metrics.",
    points: ["Google Ads", "Meta Ads", "LinkedIn Ads", "ROAS Optimization"],
  },
  "ai-automation": {
    desc: "Automate repetitive marketing workflows with custom AI agents — lead qualification, content distribution, reporting, and nurture.",
    points: ["AI Agents", "Workflow Automation", "CRM Integration", "Chatbots"],
  },
  "website-development": {
    desc: "High-performance websites built with modern frameworks — fast, SEO-optimized, and engineered for conversions from day one.",
    points: ["Next.js", "Headless CMS", "Core Web Vitals", "CRO Built-in"],
  },
  "ai-content-marketing": {
    desc: "Scale content production 3x with AI-powered drafting and expert human editing — more content, faster, without quality compromise.",
    points: ["AI Drafting", "Human Editing", "Content Repurposing", "Distribution"],
  },
};

export const BORDER_MAP: Record<string, string> = {
  seo: "hover:border-brand-500/40",
  "ai-search": "hover:border-violet-500/40",
  "lead-generation": "hover:border-amber-500/40",
  "content-marketing": "hover:border-rose-500/40",
  ppc: "hover:border-sky-500/40",
  cro: "hover:border-orange-500/40",
  "performance-marketing": "hover:border-amber-500/40",
  "ai-automation": "hover:border-violet-500/40",
  "website-development": "hover:border-sky-500/40",
  "ai-content-marketing": "hover:border-rose-500/40",
};
