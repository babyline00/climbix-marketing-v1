export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string; // ISO date
  author: {
    name: string;
    role: string;
  };
  heroImage: string; // gradient class
  tags: string[];
  content: ArticleSection[];
};

export type ArticleSection =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title: string; text: string }
  | { type: "raw_html"; html: string };

export const ARTICLES: Article[] = [
  // ────────── Article 1 ──────────
  {
    slug: "saas-seo-strategy-guide",
    title: "The Complete SaaS SEO Strategy Guide for 2026",
    excerpt:
      "Learn the exact SEO framework SaaS companies use to reduce CAC, grow MRR, and rank for high-intent software keywords — from technical foundations to content clusters.",
    category: "SEO Strategy",
    readTime: "12 min read",
    date: "2026-09-10",
    author: { name: "Climbix Team", role: "SEO & Growth" },
    heroImage: "from-brand-500/20 to-brand-700/10",
    tags: ["SaaS", "SEO", "Content Marketing", "Growth"],
    content: [
      {
        type: "p",
        text: "SaaS companies face a unique SEO challenge: complex buyer journeys, multiple decision-makers, and high-stakes evaluations that take weeks or months. Generic SEO tactics that work for ecommerce or blogs simply don't move the needle for software companies. In this guide, we'll walk through the exact framework we use to help SaaS clients turn organic search into their largest growth channel.",
      },
      {
        type: "h2",
        text: "Why SaaS SEO is fundamentally different",
      },
      {
        type: "p",
        text: "SaaS buyers don't impulse-purchase. They research extensively — reading comparison posts, watching demos, checking review sites, and evaluating alternatives for weeks before signing up. Your SEO strategy needs to meet them at every stage of that journey with content that answers their specific questions.",
      },
      {
        type: "p",
        text: "Unlike ecommerce, where a single product page can capture transactional intent, SaaS SEO requires building topical authority across multiple categories: your product features, use cases, comparisons, integrations, and educational content. Each of these serves a different buyer stage and keyword intent.",
      },
      {
        type: "h2",
        text: "The 4 pillars of a winning SaaS SEO strategy",
      },
      {
        type: "ul",
        items: [
          "Technical foundation — crawlability, Core Web Vitals, and site architecture that lets everything else rank",
          "Intent-driven keyword strategy — targeting terms by funnel stage (awareness, consideration, decision)",
          "Topical authority clusters — pillar pages surrounded by supporting articles that establish depth",
          "Revenue attribution — tracking every ranking to signups, trials, and closed revenue",
        ],
      },
      {
        type: "callout",
        title: "Key insight",
        text: "Most SaaS companies chase high-volume keywords that look impressive in reports but never convert. The right strategy targets buyer-intent keywords — terms your prospects search when they're actively evaluating solutions like yours.",
      },
      {
        type: "h2",
        text: "Building your keyword universe",
      },
      {
        type: "p",
        text: "Start by mapping keywords to your buyer's journey. Awareness-stage keywords include educational queries like 'how to reduce churn' or 'what is workflow automation.' Consideration keywords include comparison and evaluation queries like 'best project management software' or '[competitor] vs [competitor].' Decision keywords include branded and pricing queries.",
      },
      {
        type: "p",
        text: "Prioritize keywords by a combination of search volume, ranking difficulty, and business intent. A low-volume keyword that drives 10 trial signups per month is worth far more than a high-volume keyword that drives 1,000 visits and zero signups.",
      },
      {
        type: "h2",
        text: "Creating pillar pages and topic clusters",
      },
      {
        type: "p",
        text: "For each major product category, create a comprehensive pillar page that covers the topic in depth. Then build supporting articles that target long-tail variations, use cases, and adjacent topics — all linking back to the pillar. This signals topical authority to Google and captures a wider range of search intent.",
      },
      {
        type: "quote",
        text: "Within two quarters of implementing a pillar-cluster strategy, our organic traffic grew 250% and organic became our largest source of new trial signups — cutting our blended CAC by 38%.",
        author: "VP Marketing, NexaCloud (SaaS client)",
      },
      {
        type: "h2",
        text: "Measuring what matters",
      },
      {
        type: "p",
        text: "Stop measuring rankings in isolation. The metrics that matter for SaaS are: organic-attributed signups, trial-to-paid conversion from organic, pipeline generated, and revenue attributed to organic search. If your SEO reporting doesn't connect to these business outcomes, you're measuring the wrong things.",
      },
      {
        type: "p",
        text: "Set up proper attribution tracking — server-side if possible — that connects every organic touch to a trial signup, demo request, and eventually closed-won revenue. This transforms SEO from a 'marketing activity' into a revenue channel your CFO will love.",
      },
      {
        type: "callout",
        title: "Next steps",
        text: "Ready to build a SaaS SEO strategy that actually drives revenue? Get a free SEO audit and we'll show you exactly which keywords to target and how to turn organic traffic into trials.",
      },
    ],
  },

  // ────────── Article 2 ──────────
  {
    slug: "ai-search-optimization-guide",
    title: "AI Search Optimization: How to Get Cited in ChatGPT, Gemini & Perplexity",
    excerpt:
      "Search is shifting from blue links to AI-generated answers. Learn how to optimize your brand for ChatGPT, Gemini, Perplexity, and Google AI Overviews with GEO and AEO.",
    category: "AI Search",
    readTime: "10 min read",
    date: "2026-09-08",
    author: { name: "Climbix Team", role: "AI Search & SEO" },
    heroImage: "from-violet-500/20 to-violet-700/10",
    tags: ["AI Search", "GEO", "AEO", "SEO"],
    content: [
      {
        type: "p",
        text: "AI-powered search is rewriting the rules of SEO. When a potential customer asks ChatGPT 'what's the best SEO agency for SaaS companies?' — are they mentioning your brand? If not, you're invisible to a rapidly growing audience that's bypassing Google entirely.",
      },
      {
        type: "h2",
        text: "The shift from blue links to AI answers",
      },
      {
        type: "p",
        text: "ChatGPT, Gemini, Perplexity, and Google AI Overviews answer user questions directly — often without requiring a click to your website. This means traditional ranking signals (position 1 on Google) no longer guarantee visibility. The new game is getting cited inside AI-generated answers.",
      },
      {
        type: "p",
        text: "AI models surface different sources than Google's blue-link results. They prioritize authoritative, well-structured content from trusted third-party sources — Wikipedia, Reddit, industry publications, and brands with strong entity presence across the web.",
      },
      {
        type: "h2",
        text: "GEO vs AEO: what's the difference?",
      },
      {
        type: "ul",
        items: [
          "GEO (Generative Engine Optimization) — optimizing for AI models like ChatGPT, Gemini, and Perplexity that generate answers from training data and real-time retrieval",
          "AEO (Answer Engine Optimization) — optimizing for answer-based search results including Google AI Overviews, featured snippets, and voice search",
          "Both work together: strong AEO helps GEO, and vice versa",
        ],
      },
      {
        type: "h2",
        text: "The 4 levers of AI search visibility",
      },
      {
        type: "p",
        text: "Our framework for AI search optimization focuses on four levers that determine whether AI models cite your brand:",
      },
      {
        type: "ul",
        items: [
          "Entity optimization — establish your brand as a recognized entity across knowledge graphs, Wikidata, and authoritative reference sources",
          "Structured data — comprehensive schema markup (Organization, FAQ, HowTo, Article) that gives AI models machine-readable context",
          "Citation-worthy content — definitive answers, original data, and expert quotes that AI models prefer to cite",
          "Cross-platform presence — strategic placements on the sources AI models trust most (Reddit, Wikipedia, industry publications)",
        ],
      },
      {
        type: "callout",
        title: "Real result",
        text: "After four months of AI search optimization, one of our B2B clients is now cited as a top recommendation in 12 priority queries on ChatGPT — driving a steady stream of high-intent demo requests from AI referrals.",
      },
      {
        type: "h2",
        text: "How to measure AI visibility",
      },
      {
        type: "p",
        text: "Traditional SEO tools don't track AI citations. You need to manually test your priority queries on ChatGPT, Gemini, and Perplexity — or use emerging tools designed specifically for AI search monitoring. Track which queries cite your brand, which cite competitors, and how your share of AI voice trends over time.",
      },
      {
        type: "p",
        text: "Set up a monthly cadence of testing 20-50 priority queries across each AI platform. Document the results, identify patterns (what content gets cited, what sources are referenced), and refine your strategy based on what's actually working.",
      },
      {
        type: "h2",
        text: "Getting started with AI search optimization",
      },
      {
        type: "p",
        text: "Start with entity optimization — claim your brand on Wikidata, ensure your website has comprehensive Organization schema, and build presence on authoritative reference sites. Then audit your content for citation-worthiness: does it provide definitive answers, original data, or unique insights that AI models would prefer to cite?",
      },
      {
        type: "p",
        text: "AI search visibility compounds over time — once you're being cited, models reinforce your authority in future training cycles. Every month you wait makes it harder to catch up to competitors who are already optimizing.",
      },
    ],
  },

  // ────────── Article 3 ──────────
  {
    slug: "b2b-lead-generation-strategies",
    title: "7 B2B Lead Generation Strategies That Actually Work in 2026",
    excerpt:
      "Stop generating leads that never convert. These 7 proven B2B lead generation strategies focus on qualified pipeline — not vanity metrics that waste your sales team's time.",
    category: "Lead Generation",
    readTime: "9 min read",
    date: "2026-09-05",
    author: { name: "Climbix Team", role: "Lead Generation" },
    heroImage: "from-amber-500/20 to-amber-700/10",
    tags: ["B2B", "Lead Generation", "Pipeline", "Sales"],
    content: [
      {
        type: "p",
        text: "Generating leads isn't the hard part. Generating qualified leads at a cost that makes business sense — that's where most B2B funnels break down. If your sales team is ignoring marketing leads or your cost per acquisition keeps rising, this guide is for you.",
      },
      {
        type: "h2",
        text: "The qualified lead problem",
      },
      {
        type: "p",
        text: "Most B2B companies measure success by lead count — how many form fills did we get this month? But lead count is a vanity metric. What matters is qualified pipeline: leads that fit your ideal customer profile, have budget and authority, and are actively evaluating solutions.",
      },
      {
        type: "callout",
        title: "The metric that matters",
        text: "Sales-accepted lead rate — the percentage of marketing leads that your sales team agrees are worth pursuing. If this is below 50%, your funnel is leaking. If it's above 70%, you have a healthy, aligned marketing-sales engine.",
      },
      {
        type: "h2",
        text: "Strategy 1: Intent-driven content marketing",
      },
      {
        type: "p",
        text: "Create content around the questions your buyers actively research during evaluation. Don't write about your product — write about their problems, their evaluation criteria, and how to choose the right solution. This captures buyers in active research mode and positions you as a trusted resource.",
      },
      {
        type: "h2",
        text: "Strategy 2: Account-based marketing (ABM)",
      },
      {
        type: "p",
        text: "Instead of casting a wide net, identify your 200 highest-value target accounts and build personalized campaigns for them. Use targeted ads, custom content, and coordinated outreach across channels. ABM typically delivers 3-5x higher conversion rates than broad demand generation.",
      },
      {
        type: "h2",
        text: "Strategy 3: Lead magnets that actually convert",
      },
      {
        type: "p",
        text: "Generic ebooks and whitepapers don't work anymore. Create high-value lead magnets — interactive tools, templates, calculators, or proprietary research — that genuinely help your prospects do their job better. The perceived value determines the conversion rate.",
      },
      {
        type: "h2",
        text: "Strategy 4: LinkedIn Ads with precise targeting",
      },
      {
        type: "p",
        text: "LinkedIn's B2B targeting is unmatched — job title, company size, industry, seniority, and even specific company names. Use it to reach decision-makers directly with content that addresses their specific challenges. The CPM is higher than other platforms, but the lead quality is significantly better.",
      },
      {
        type: "h2",
        text: "Strategy 5: Lead scoring and qualification",
      },
      {
        type: "p",
        text: "Not every form fill should go to sales. Implement lead scoring based on demographic fit (industry, company size, role) and behavioral signals (pages visited, content downloaded, pricing page views). Only route sales-ready leads to your team — nurture the rest until they're ready.",
      },
      {
        type: "quote",
        text: "After implementing lead scoring, our sales-accepted lead rate jumped from 28% to 62%. The sales team went from ignoring marketing leads to requesting more — because the quality finally matched their definition of sales-ready.",
        author: "Director of Demand Gen, Pinnacle (B2B client)",
      },
      {
        type: "h2",
        text: "Strategy 6: Retargeting with sequential messaging",
      },
      {
        type: "p",
        text: "Most visitors don't convert on their first visit. Build a retargeting sequence that serves different content based on what pages they viewed — educational content for top-of-funnel visitors, comparison content for evaluators, and demo CTAs for bottom-funnel visitors. This brings back lost opportunities and moves them toward conversion.",
      },
      {
        type: "h2",
        text: "Strategy 7: Marketing-sales alignment",
      },
      {
        type: "p",
        text: "The biggest lead generation leak isn't tactics — it's misalignment between marketing and sales. Shared definitions of qualified leads, SLAs for follow-up times, and full-funnel attribution connecting marketing activity to closed-won revenue. Without this foundation, even the best tactics underperform.",
      },
      {
        type: "callout",
        title: "The result",
        text: "B2B companies that implement all 7 strategies typically see qualified lead volume double within 90 days while cost per acquisition drops 30-40%. The key is treating lead generation as an integrated system — not isolated tactics.",
      },
    ],
  },

  // ────────── Article 4 ──────────
  {
    slug: "technical-seo-checklist",
    title: "The Technical SEO Checklist: 25 Things to Fix in 2026",
    excerpt:
      "A practical technical SEO checklist covering crawlability, Core Web Vitals, structured data, indexing, and site architecture — the foundation everything else builds on.",
    category: "Technical SEO",
    readTime: "11 min read",
    date: "2026-09-03",
    author: { name: "Climbix Team", role: "Technical SEO" },
    heroImage: "from-sky-500/20 to-sky-700/10",
    tags: ["Technical SEO", "Core Web Vitals", "Schema", "Crawlability"],
    content: [
      {
        type: "p",
        text: "Technical SEO is the foundation everything else builds on. You can create the best content in the world, but if Google can't crawl your site, your pages don't load fast, or your structured data is broken — none of it will rank. This checklist covers the 25 most impactful technical SEO fixes for 2026.",
      },
      {
        type: "h2",
        text: "Crawlability & Indexation (1-7)",
      },
      {
        type: "ul",
        items: [
          "Audit your robots.txt — ensure you're not accidentally blocking important pages or resources",
          "Check XML sitemap — include all canonical URLs, exclude redirects and noindex pages",
          "Review indexation in Google Search Console — identify and fix 'discovered but not indexed' pages",
          "Fix broken internal links — crawl your site with Screaming Frog or Sitebulb and fix 404s",
          "Eliminate redirect chains — every redirect should be a single hop, not a chain",
          "Check canonical tags — ensure each page has a self-referencing canonical and no conflicts",
          "Audit hreflang tags (if multi-region) — ensure proper implementation for international SEO",
        ],
      },
      {
        type: "h2",
        text: "Core Web Vitals (8-14)",
      },
      {
        type: "p",
        text: "Core Web Vitals are Google's official page experience signals. They measure how users perceive the speed and stability of your pages. Here's what to fix:",
      },
      {
        type: "ul",
        items: [
          "Optimize Largest Contentful Paint (LCP) — target under 2.5 seconds, usually an image or hero block",
          "Reduce Cumulative Layout Shift (CLS) — target under 0.1, caused by images without dimensions or dynamic content",
          "Improve Interaction to Next Paint (INP) — target under 200ms, replaces FID in 2024",
          "Compress and lazy-load images — use modern formats (WebP, AVIF) and loading='lazy'",
          "Minify and defer JavaScript — remove unused JS and defer non-critical scripts",
          "Use a CDN — serve static assets from edge locations closest to your users",
          "Implement resource hints — preconnect, preload, and prefetch critical resources",
        ],
      },
      {
        type: "h2",
        text: "Structured Data (15-19)",
      },
      {
        type: "p",
        text: "Structured data helps Google understand your content and enables rich results. In 2026, it's also critical for AI search visibility — models rely on schema to understand entities.",
      },
      {
        type: "ul",
        items: [
          "Implement Organization schema — includes logo, contact info, and social profiles",
          "Add Article schema to blog posts — enables rich results and AI citation",
          "Add FAQ schema to FAQ pages — enables expandable rich results",
          "Add Product/Offer schema (if ecommerce) — enables price and availability rich results",
          "Validate all schema with Google's Rich Results Test — fix any errors or warnings",
        ],
      },
      {
        type: "h2",
        text: "Site Architecture (20-25)",
      },
      {
        type: "ul",
        items: [
          "Flatten your site architecture — important pages should be reachable within 3 clicks from homepage",
          "Use descriptive, keyword-rich URLs — avoid parameter strings and unnecessary numbers",
          "Implement strategic internal linking — link from high-authority pages to important target pages",
          "Create HTML sitemap — helps users and crawlers discover deep pages",
          "Audit breadcrumb implementation — use BreadcrumbList schema for rich results",
        ],
      },
      {
        type: "callout",
        title: "Pro tip",
        text: "Don't try to fix everything at once. Prioritize by impact and effort — start with the quick wins (broken links, missing alt text, schema errors) before tackling bigger projects (site architecture, Core Web Vitals).",
      },
      {
        type: "h2",
        text: "How often should you audit?",
      },
      {
        type: "p",
        text: "Technical SEO isn't a one-time project — it's an ongoing discipline. Run a full technical audit quarterly, monitor Core Web Vitals monthly via Search Console, and set up alerts for critical issues (indexation drops, spike in 404s, schema errors).",
      },
      {
        type: "p",
        text: "The websites that win in 2026 aren't the ones with the most content — they're the ones with the strongest technical foundation. Fix these 25 issues and you'll have a base that lets every other SEO effort perform at its best.",
      },
    ],
  },

  // ────────── Article 5 ──────────
  {
    slug: "content-marketing-framework",
    title: "The Topical Authority Framework: How to Dominate Your Niche with Content",
    excerpt:
      "Stop publishing random blog posts. Learn the topical authority framework that helps you build depth, rank for entire categories, and establish expertise Google and AI models reward.",
    category: "Content Marketing",
    readTime: "10 min read",
    date: "2026-09-01",
    author: { name: "Climbix Team", role: "Content Strategy" },
    heroImage: "from-rose-500/20 to-rose-700/10",
    tags: ["Content Marketing", "SEO", "Topical Authority", "Strategy"],
    content: [
      {
        type: "p",
        text: "Most content marketing fails because it's scattered — random blog posts with no connecting strategy. Google rewards depth and topical coverage, not volume. The topical authority framework changes that: instead of publishing isolated articles, you build comprehensive coverage of entire categories that signals expertise to both Google and AI models.",
      },
      {
        type: "h2",
        text: "What is topical authority?",
      },
      {
        type: "p",
        text: "Topical authority is Google's assessment of how comprehensively your site covers a given topic. Sites with strong topical authority rank for hundreds of related keywords because Google trusts them as a definitive resource. Sites with scattered content rank for almost nothing — they signal expertise in no single area.",
      },
      {
        type: "p",
        text: "Think of it this way: would you rather get medical advice from a generalist who writes about everything, or a specialist who has published 50 deep articles on exactly your condition? Google makes the same calculation.",
      },
      {
        type: "h2",
        text: "The pillar-cluster model",
      },
      {
        type: "p",
        text: "The foundation of topical authority is the pillar-cluster model. For each major topic you want to own, you create:",
      },
      {
        type: "ul",
        items: [
          "One pillar page — a comprehensive, long-form page that covers the topic at a high level and links to all supporting articles",
          "10-30 cluster articles — each targeting a specific long-tail keyword or subtopic related to the pillar",
          "Internal linking — every cluster article links back to the pillar, and the pillar links to each cluster",
        ],
      },
      {
        type: "callout",
        title: "Why it works",
        text: "This structure signals to Google: 'We've covered this topic comprehensively from every angle.' The internal linking distributes authority from the pillar to the clusters, and the topical depth earns trust for the entire category.",
      },
      {
        type: "h2",
        text: "Step 1: Choose your topics strategically",
      },
      {
        type: "p",
        text: "Don't try to own every topic in your industry. Choose 3-5 topics where you have genuine expertise, your audience has questions, and competitors have weak coverage. Use keyword research to validate search demand and identify gaps in existing content.",
      },
      {
        type: "p",
        text: "For a SaaS company, pillar topics might be: 'project management best practices,' 'team collaboration strategies,' 'workflow automation guide.' Each becomes a comprehensive resource hub, not just a single article.",
      },
      {
        type: "h2",
        text: "Step 2: Map your keyword universe",
      },
      {
        type: "p",
        text: "For each pillar topic, identify 15-30 related long-tail keywords that represent specific questions, use cases, or subtopics. These become your cluster articles. Use tools like Ahrefs, SEMrush, or Google's 'People Also Ask' feature to discover what your audience is searching for.",
      },
      {
        type: "p",
        text: "Group keywords by intent — informational (how to, what is), comparison (vs, best), and transactional (buy, pricing). Each intent requires different content format and depth.",
      },
      {
        type: "h2",
        text: "Step 3: Build the pillar page",
      },
      {
        type: "p",
        text: "Your pillar page should be the definitive resource on the topic — 3,000-5,000 words covering every aspect at a high level. It should serve as a hub that links to all your cluster articles, and each cluster should link back to the pillar with relevant anchor text.",
      },
      {
        type: "p",
        text: "The pillar doesn't need to rank for every long-tail keyword — that's what the clusters are for. The pillar establishes topical authority and captures the high-level, high-volume category term.",
      },
      {
        type: "h2",
        text: "Step 4: Publish clusters on a consistent cadence",
      },
      {
        type: "p",
        text: "Publish cluster articles weekly or bi-weekly — each targeting a specific long-tail keyword. Each should be 1,500-2,500 words of genuinely useful, expert-led content (not content-farm fluff). Link to the pillar and to related clusters.",
      },
      {
        type: "quote",
        text: "After building three topical authority clusters over six months, our organic traffic grew 250% and we now rank in the top 3 for 47 industry keywords. The compounding effect is real — every new cluster article lifts the entire topic.",
        author: "Head of Growth, BrightPath",
      },
      {
        type: "h2",
        text: "Step 5: Refresh and expand",
      },
      {
        type: "p",
        text: "Topical authority isn't a set-and-forget strategy. Refresh your pillar pages quarterly with new information, expand clusters that are ranking well, and add new clusters as your audience's questions evolve. Content decay is real — even great articles lose rankings if not maintained.",
      },
      {
        type: "callout",
        title: "The compounding effect",
        text: "Unlike paid ads that stop the moment you stop paying, topical authority compounds. Every article you publish strengthens the entire topic, and the authority you build today will drive traffic for years. This is why content marketing is the highest-ROI channel for long-term growth.",
      },
    ],
  },
];

export const getArticle = (slug: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug);

export const BLOG_CATEGORIES = [
  "All",
  "SEO Strategy",
  "AI Search",
  "Lead Generation",
  "Technical SEO",
  "Content Marketing",
];
