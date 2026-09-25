import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote, TrendingUp, Target, DollarSign } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META["case-studies"];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/case-studies" },
  openGraph: { title: meta.title, description: meta.description, url: "/case-studies", type: "website" },
};

type CaseStudy = {
  client: string;
  industry: string;
  duration: string;
  challenge: string;
  strategy: string[];
  outcomes: { icon: typeof TrendingUp; label: string; value: string }[];
  quote?: { text: string; name: string; role: string };
};

const CASES: CaseStudy[] = [
  {
    client: "NexaCloud",
    industry: "SaaS — Workflow Automation",
    duration: "9 months",
    challenge:
      "NexaCloud had decent traffic but a leaky funnel: 40,000 monthly visits converting to demos at 0.4%. Paid acquisition covered 80% of pipeline at a CAC that was quietly climbing every quarter. The blog ranked for everything except the keywords buyers actually searched before signing up.",
    strategy: [
      "Rebuilt keyword strategy around bottom-funnel comparison and alternative searches",
      "Created 14 pillar-and-cluster content hubs mapped to the buyer journey",
      "Launched free-tool lead magnets feeding the email nurture program",
      "Cut landing page friction with CRO experiments on the demo flow",
    ],
    outcomes: [
      { icon: TrendingUp, label: "Organic traffic", value: "+250%" },
      { icon: Target, label: "Qualified leads", value: "+180%" },
      { icon: DollarSign, label: "Organic-sourced revenue", value: "+120%" },
    ],
    quote: {
      text: "Within two quarters, our organic pipeline became our largest source of new business. The reporting was the real surprise — I finally knew which content dollars were paying off.",
      name: "Aisha Rahman",
      role: "VP Marketing, NexaCloud",
    },
  },
  {
    client: "Pinnacle Consulting Group",
    industry: "B2B — Professional Services",
    duration: "6 months",
    challenge:
      "Every new client came from referrals or LinkedIn ads with a $4,100 cost per acquisition. Proposals went out, conversion stalled. The website read like a brochure and ranked for nothing beyond the brand name.",
    strategy: [
      "Full PPC account restructure with SKAG-style intent segmentation",
      "Retargeting funnels rebuilt around proposal-stage objections",
      "Service pages rewritten around buyer pain points and proof",
      "CRO program on the consultation booking flow (form, proof, pricing signals)",
    ],
    outcomes: [
      { icon: DollarSign, label: "Cost per acquisition", value: "-40%" },
      { icon: Target, label: "Monthly qualified leads", value: "+200%" },
      { icon: TrendingUp, label: "Blended ROAS", value: "+165%" },
    ],
    quote: {
      text: "We cut our cost per acquisition by 38% in the first 90 days. The retargeting and CRO experiments paid for the entire engagement before the quarter ended.",
      name: "Lena Volkov",
      role: "Director of Demand Gen, Pinnacle",
    },
  },
  {
    client: "Quantly",
    industry: "SaaS — Analytics Platform",
    duration: "8 months",
    challenge:
      "Quantly's buyers had started asking ChatGPT for tool recommendations — and Quantly wasn't in the answer. Traditional rankings were stable, but AI assistants were shaping vendor shortlists the brand couldn't see or influence.",
    strategy: [
      "Entity and schema optimization across the site and knowledge graph sources",
      "Citation-worthy assets: original data studies and definitive how-to guides",
      "Structured comparisons of Quantly vs. category alternatives",
      "Digital PR to earn mentions on high-authority sources AI models cite",
    ],
    outcomes: [
      { icon: TrendingUp, label: "AI citations (ChatGPT, Perplexity)", value: "+340%" },
      { icon: Target, label: "Demo requests from AI search", value: "+95%" },
      { icon: DollarSign, label: "Pipeline influenced by AI answers", value: "$1.2M" },
    ],
    quote: {
      text: "Their AI search optimization work got us cited in ChatGPT and Perplexity for our core category. That visibility is now driving a steady stream of high-intent demo requests.",
      name: "Mira Tanaka",
      role: "Head of Growth, Quantly",
    },
  },
  {
    client: "Skyline Commerce",
    industry: "Ecommerce — DTC Home Goods",
    duration: "8 months",
    challenge:
      "Flat revenue for three straight quarters. 90% of sales depended on paid ads with rising CPMs, collection pages ranked for nothing, and 71% of customers never bought twice. Email was a monthly newsletter and a prayer.",
    strategy: [
      "Rebuilt 40 collection pages with unique copy, internal links, and FAQ schema",
      "Launched buying-guide hub targeting long-tail purchase-intent searches",
      "Restructured Performance Max campaigns by contribution margin tiers",
      "Rebuilt email/SMS: welcome, abandonment, post-purchase, win-back flows",
    ],
    outcomes: [
      { icon: TrendingUp, label: "Organic revenue", value: "+214%" },
      { icon: DollarSign, label: "Blended CAC", value: "-31%" },
      { icon: Target, label: "Average order value", value: "+22%" },
    ],
    quote: {
      text: "Organic became our second-largest revenue channel in eight months. Email now drives over a third of monthly revenue — margin we used to spend on ads.",
      name: "Omar Haddad",
      role: "Co-founder, Skyline Commerce",
    },
  },
  {
    client: "BrightPath Health",
    industry: "Healthcare — Multi-Location Clinics",
    duration: "6 months",
    challenge:
      "Seven clinics with wildly inconsistent visibility: two fully booked, five with empty chairs. No review strategy (3.9★ average), no location pages, and a website Google barely indexed. Paid ads produced clicks but not bookings.",
    strategy: [
      "Location-by-location Google Business Profile and citation cleanup",
      "Service × location page architecture with medically-reviewed content",
      "Compliant review-generation flow built into post-appointment messaging",
      "Call tracking and booking funnels configured with patient privacy in mind",
    ],
    outcomes: [
      { icon: TrendingUp, label: "Map pack appearances", value: "+178%" },
      { icon: Target, label: "New patient calls", value: "+120%" },
      { icon: DollarSign, label: "Cost per booked patient", value: "-68%" },
    ],
    quote: {
      text: "All seven of our locations now show up in the map pack for their core services. We open new clinics with a playbook instead of guesswork.",
      name: "Samuel Park",
      role: "COO, BrightPath Health",
    },
  },
  {
    client: "Meridian Properties",
    industry: "Real Estate — Luxury Brokerage",
    duration: "9 months",
    challenge:
      "Every lead came from portals at $60+ each. The website ranked for nothing beyond the brand name, agents ran fragmented personal marketing, and listings vanished from search the day they sold — wasting every dollar spent on them.",
    strategy: [
      "35 hyperlocal neighborhood hubs with market data and lifestyle content",
      "Home valuation funnel capturing seller leads with real intent",
      "Listing page templates with schema for instant indexing and building-level SEO",
      "Unified agent pages with review programs under one brand",
    ],
    outcomes: [
      { icon: TrendingUp, label: "Organic leads", value: "+310%" },
      { icon: DollarSign, label: "Cost per qualified lead", value: "$19" },
      { icon: Target, label: "Top-3 neighborhood rankings", value: "25 terms" },
    ],
  },
];

export default async function CaseStudiesPage() {
  const override = await getPageOverride("case-studies");
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
              { name: "Case Studies", url: "/case-studies" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="Case Studies"
        title="Real clients. Real numbers."
        highlight="No cherry-picking."
        intro="Every engagement below is documented with the challenge, the strategy, and the measurable outcome. Some names are anonymized by client request — the numbers aren't. If you want the version of a case study relevant to your market, book a call and we'll walk through the full data."
      />

      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl container-px space-y-8">
          {CASES.map((c, i) => (
            <article
              key={c.client}
              className="rounded-3xl border border-border bg-card overflow-hidden hover:border-brand-500/40 hover:shadow-xl hover:shadow-black/[0.04] transition-all"
            >
              <div className="grid lg:grid-cols-5">
                {/* Left summary */}
                <div className="lg:col-span-2 p-6 lg:p-8 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                      {c.industry}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {c.duration}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    {c.client}
                  </h2>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {c.challenge}
                  </p>
                  {c.quote && (
                    <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                      <Quote className="size-4 text-brand-500/50" />
                      <p className="mt-2 text-sm italic text-foreground/80 leading-relaxed">
                        &ldquo;{c.quote.text}&rdquo;
                      </p>
                      <p className="mt-2 text-xs font-semibold">
                        {c.quote.name}
                        <span className="ml-1 font-normal text-muted-foreground">
                          — {c.quote.role}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Right details */}
                <div className="lg:col-span-3 p-6 lg:p-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    What we did
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {c.strategy.map((s) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <div className="mt-0.5 size-1.5 rounded-full bg-brand-500 shrink-0" />
                        <span className="text-sm text-foreground/85 leading-relaxed">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Outcomes
                  </h3>
                  <div className="mt-3 grid sm:grid-cols-3 gap-3">
                    {c.outcomes.map((o) => (
                      <div
                        key={o.label}
                        className="rounded-xl border border-border bg-background/60 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                            <o.icon className="size-4 text-brand-600" />
                          </div>
                          <div className="text-lg font-bold text-brand-700">
                            {o.value}
                          </div>
                        </div>
                        <div className="mt-1.5 text-xs text-muted-foreground leading-snug">
                          {o.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative py-16 lg:py-24 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-3xl container-px text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Want results like these in your market?
          </h2>
          <p className="mt-4 text-lg text-white/70 text-pretty">
            The fastest way to find out is a free growth audit. We&apos;ll
            review your funnel and show you which of these plays apply to your
            business — and in what order.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/free-growth-audit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-500/30"
            >
              Get My Free Growth Audit
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/strategy-call"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold"
            >
              Book a Strategy Call
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
