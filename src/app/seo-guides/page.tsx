import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META["seo-guides"];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/seo-guides" },
  openGraph: { title: meta.title, description: meta.description, url: "/seo-guides", type: "website" },
};

const GUIDES = [
  {
    level: "Beginner",
    title: "The Complete SEO Audit Checklist (30 Points, Zero fluff)",
    desc: "The exact 30-point checklist our strategists use on paid engagements — crawlability, indexation, Core Web Vitals, on-page signals, and the quick wins most sites miss. Work through it in an afternoon and you'll know precisely why your site ranks the way it does.",
    readTime: "18 min read",
    topics: ["Technical SEO", "Site audits", "Checklists"],
  },
  {
    level: "Beginner",
    title: "Keyword Research for Businesses, Not Bloggers",
    desc: "Most keyword guides are written for affiliate bloggers. This one is written for businesses: how to find keywords your buyers search before signing a contract, how to read intent behind a query, and how to prioritize by revenue potential instead of search volume.",
    readTime: "14 min read",
    topics: ["Keyword research", "Search intent", "Prioritization"],
  },
  {
    level: "Intermediate",
    title: "On-Page SEO That Actually Moves Rankings in 2026",
    desc: "Title tags and keyword density advice is a decade out of date. This guide covers what matters now: entity coverage, helpful-content signals, internal link architecture, and how to structure pages so both Google and AI assistants understand exactly what you do.",
    readTime: "16 min read",
    topics: ["On-page SEO", "Content structure", "Entities"],
  },
  {
    level: "Intermediate",
    title: "Link Building Without Spam: A Digital PR Playbook",
    desc: "Buying links is a treadmill you can't get off. This playbook covers the approach we use for clients: linkable asset creation, journalist outreach, HARO-style positioning, and unlinked-brand-mention recovery — with templates you can copy.",
    readTime: "21 min read",
    topics: ["Link building", "Digital PR", "Outreach"],
  },
  {
    level: "Intermediate",
    title: "Local SEO: Win the Map Pack in Your City",
    desc: "For businesses with a physical presence, the map pack is worth more than ten page-one rankings. Learn how Google ranks local results, how to optimize your Google Business Profile properly, and the review-generation system that compounds month after month.",
    readTime: "15 min read",
    topics: ["Local SEO", "Google Business Profile", "Reviews"],
  },
  {
    level: "Advanced",
    title: "AI Search Optimization (GEO/AEO): The Field Guide",
    desc: "ChatGPT, Gemini, Perplexity, and Google AI Overviews now shape vendor shortlists before a single click happens. This guide explains how AI engines choose which brands to cite, and the entity, schema, and citation-worthy-content strategy we use to get clients recommended.",
    readTime: "24 min read",
    topics: ["GEO / AEO", "AI search", "Entities & schema"],
  },
  {
    level: "Advanced",
    title: "Ecommerce SEO: Collection Pages, Facets & Scale",
    desc: "Product pages rarely rank; collection pages are where ecommerce revenue lives. This guide covers collection-page copy at scale, faceted navigation control, internal linking for large catalogs, and platform-specific fixes for Shopify and WooCommerce.",
    readTime: "19 min read",
    topics: ["Ecommerce SEO", "Shopify", "Faceted navigation"],
  },
  {
    level: "Advanced",
    title: "Content Cannibalization: Find and Fix It in One Day",
    desc: "When five pages target the same intent, Google ranks none of them well. This step-by-step guide shows you how to find cannibalization with any SEO tool, decide which page should rank, and merge or re-target the rest without losing traffic.",
    readTime: "12 min read",
    topics: ["Content strategy", "Cannibalization", "Site structure"],
  },
];

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-700",
  Intermediate: "bg-amber-500/10 text-amber-700",
  Advanced: "bg-rose-500/10 text-rose-700",
};

export default async function SeoGuidesPage() {
  const override = await getPageOverride("seo-guides");
  if (override)
    return (
      <PageShell>
        <CmsPageBody page={override} />
      </PageShell>
    );
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "SEO Guides", url: "/seo-guides" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="SEO Guides"
        title="The playbooks we use on"
        highlight="paid engagements — free."
        intro="These aren't 500-word listicles written to fill a content calendar. They're the working documents our strategists use on client engagements, rewritten for you to execute. Take them, run with them, and if you want help applying them — you know where to find us."
      />

      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {GUIDES.map((g) => (
              <article
                key={g.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 card-hover hover:border-brand-500/40 hover:shadow-xl hover:shadow-black/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${LEVEL_STYLES[g.level]}`}
                  >
                    {g.level}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {g.readTime}
                  </span>
                </div>
                <h2 className="mt-4 font-semibold leading-snug text-balance">
                  {g.title}
                </h2>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed flex-1">
                  {g.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.topics.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  <BookOpen className="size-4" />
                  Guide in the blog
                </div>
              </article>
            ))}
          </div>

          {/* How to use these guides */}
          <div className="mt-14 rounded-3xl border border-border bg-muted/30 p-8 lg:p-10">
            <h2 className="text-2xl font-bold tracking-tight">
              How to get the most out of these guides
            </h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: "1. Start with the audit",
                  desc: "The 30-point audit checklist tells you where you stand. Everything else in SEO is easier once you know which third of the checklist is broken.",
                },
                {
                  title: "2. Fix intent before volume",
                  desc: "A page-one ranking for a keyword buyers never use is a participation trophy. The keyword research guide shows how to tell the difference before you write a word.",
                },
                {
                  title: "3. Instrument everything",
                  desc: "Set up conversion tracking before you publish anything. Guides can't tell you what's working in YOUR market — your data can.",
                },
              ].map((s) => (
                <div key={s.title}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-brand-600" />
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
              Rather have us run the playbooks for you?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Reading is the easy part. If you want a senior team executing
              this week after week — with reporting that ties to revenue —
              let&apos;s talk.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/strategy-call"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
              >
                Book a Free Strategy Call
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/free-growth-audit"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/40 text-brand-700 hover:bg-brand-500/10 px-6 py-3 text-sm font-semibold"
              >
                Start With a Free Audit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
