import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  BarChart3,
  Globe2,
  TrendingUp,
  HeartHandshake,
  ShieldCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.about;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/about" },
  openGraph: { title: meta.title, description: meta.description, url: "/about", type: "website" },
};

const VALUES = [
  {
    icon: Target,
    title: "Outcomes over outputs",
    desc: "Nobody hires an agency because they want more blog posts or dashboards. They hire one because they want more revenue. We hold every deliverable to that standard — if it doesn't move pipeline, we question why we're doing it.",
  },
  {
    icon: ShieldCheck,
    title: "Radical transparency",
    desc: "You see what we see: the wins, the misses, and the experiments that flopped. Shared dashboards, plain-language reports, and weekly updates. If a channel isn't working, you'll hear it from us first — not after six months of invoices.",
  },
  {
    icon: Compass,
    title: "Strategy before tactics",
    desc: "We've inherited enough 'they just started posting' horror stories to know better. Every engagement starts with research: your market, your buyers, your competitors, your funnel math. Tactics come after the thesis, never before.",
  },
  {
    icon: HeartHandshake,
    title: "Partners, not vendors",
    desc: "The best work happens when we know your business well enough to argue with you — respectfully. Our clients loop us into roadmap reviews and pricing debates because that context makes the marketing sharper. We like it that way.",
  },
];

const MILESTONES = [
  {
    year: "2020",
    title: "Founded remote-first",
    desc: "Climbix started as a two-person SEO consultancy with a simple bet: senior strategists, no account-manager telephone game, and pricing tied to outcomes.",
  },
  {
    year: "2022",
    title: "Went full-funnel",
    desc: "Clients kept asking us to fix what happened after the click — so we added paid media, CRO, and email under one roof. One team, one P&L view.",
  },
  {
    year: "2023",
    title: "AI search practice launched",
    desc: "We noticed our clients appearing (or vanishing) inside ChatGPT and Google AI Overviews long before most agencies did. We built a dedicated GEO/AEO practice around it.",
  },
  {
    year: "2026",
    title: "18+ countries, one playbook per market",
    desc: "Today we serve clients across North America, EMEA, and APAC — with localized strategies per market, not translated PDFs.",
  },
];

const STATS = [
  { value: "120+", label: "Clients served" },
  { value: "18+", label: "Countries" },
  { value: "94%", label: "Client retention" },
  { value: "$24M+", label: "Client revenue influenced" },
];

export default async function AboutPage() {
  const override = await getPageOverride("about");
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
              { name: "About Us", url: "/about" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="About Climbix Marketing"
        title="We're the growth team"
        highlight="you wish you'd hired first."
        intro="Climbix is a remote-first marketing agency built around one belief: marketing should pay for itself. Since 2020, we've helped 120+ companies across 18+ countries turn search visibility into qualified leads, predictable pipeline, and revenue their finance teams can actually verify."
      />

      {/* Story */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-4xl container-px">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Why we exist
          </h2>
          <div className="mt-6 space-y-5 text-lg text-muted-foreground leading-relaxed text-pretty">
            <p>
              Climbix started because our founders kept seeing the same movie:
              a company pays for SEO, gets a report full of green arrows, and
              the sales team still asks where the leads are. Rankings went up;
              revenue didn&apos;t. The agency celebrated the arrows. The
              business paid for them.
            </p>
            <p>
              We believed there was room for an agency that starts from the
              revenue line and works backwards — that treats organic search,
              paid media, content, and conversion rate optimization as one
              connected system instead of four separate invoices. So we built
              it. No account managers relaying messages between you and the
              people doing the work. No twelve-month contracts hiding
              underwhelming delivery. Just senior strategists who own your
              growth like it&apos;s their own P&amp;L.
            </p>
            <p>
              That model turned out to scale better than we expected. Today
              our team spans SaaS, B2B services, ecommerce, healthcare, and
              real estate — but the operating principle hasn&apos;t moved an
              inch: if it doesn&apos;t show up in your funnel numbers, it
              doesn&apos;t count.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <div className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-700">
                  {s.value}
                </div>
                <div className="mt-1 text-xs lg:text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
              What we&apos;re like to work with
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Plenty of agencies have a &quot;values&quot; page. Ours are the
              four rules we actually get graded on by clients — in their
              words, not ours.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-4 lg:gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6 lg:p-7 card-hover hover:border-brand-500/40"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 ring-1 ring-inset ring-brand-500/20 flex items-center justify-center mb-5">
                  <v.icon className="size-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-4xl container-px">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            How we got here
          </h2>
          <div className="mt-10 space-y-8">
            {MILESTONES.map((m) => (
              <div key={m.year} className="flex gap-6">
                <div className="shrink-0">
                  <div className="size-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-700">
                    {m.year}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 lg:py-24 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-4xl container-px text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-200">
            <BarChart3 className="size-3.5" />
            Let&apos;s talk
          </div>
          <h2 className="mt-6 text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Want to see how we&apos;d approach your market?
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
            Book a free strategy call. We&apos;ll audit your current funnel,
            show you the biggest levers we see, and be upfront about whether
            we&apos;re the right partner — no 12-slide pitch deck required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/strategy-call"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-500/30"
            >
              Book a Free Strategy Call
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold"
            >
              See Our Results
              <TrendingUp className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
