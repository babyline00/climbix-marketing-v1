import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Calculator,
  Bot,
  ArrowRight,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { RoiCalculator } from "@/components/site/roi-calculator";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META["free-tools"];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/free-tools" },
  openGraph: { title: meta.title, description: meta.description, url: "/free-tools", type: "website" },
};

const TOOLS = [
  {
    icon: Search,
    title: "Free Growth Audit",
    desc: "Enter your URL and get a 30-point analysis: technical SEO health, Core Web Vitals, on-page optimization, content gaps, and a prioritized 90-day roadmap. Delivered in minutes, no signup wall.",
    cta: "Run the audit",
    href: "/free-growth-audit",
    badge: "Most popular",
  },
  {
    icon: Bot,
    title: "AI Growth Assistant",
    desc: "Chat with our AI assistant — it answers questions about SEO, AI search, and lead generation in plain language, 24/7. Ask it what GEO/AEO means or what to fix first on your site. Prefer a human? It'll book you a call.",
    cta: "Open the chat",
    href: null,
    badge: "Bottom-right corner",
  },
  {
    icon: FileCheck,
    title: "SEO Playbook Library",
    desc: "Eight in-depth guides covering technical audits, keyword research, link building, local SEO, and AI search optimization — the same playbooks our strategists use on client work, free to execute.",
    cta: "Browse the guides",
    href: "/seo-guides",
    badge: null,
  },
];

export default async function FreeToolsPage() {
  const override = await getPageOverride("free-tools");
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
              { name: "Free Tools", url: "/free-tools" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="Free Tools"
        title="Tools that earn trust,"
        highlight="not email addresses."
        intro="Most 'free tools' are lead-capture forms in a trench coat. Ours give you the actual answer — an audit you can act on, an assistant that knows its stuff, and a calculator that shows you what growth is worth. Use them without giving up anything but time."
      />

      {/* ROI calculator — interactive */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-5xl container-px">
          <RoiCalculator />
        </div>
      </section>

      {/* Other tools */}
      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl container-px">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            More free resources
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5 lg:gap-6">
            {TOOLS.map((t) => (
              <div
                key={t.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 card-hover hover:border-brand-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 ring-1 ring-inset ring-brand-500/20 flex items-center justify-center">
                    <t.icon className="size-5 text-brand-600" />
                  </div>
                  {t.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-brand-500/10 text-brand-700">
                      {t.badge}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {t.desc}
                </p>
                {t.href ? (
                  <Link
                    href={t.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:gap-2.5 transition-all"
                  >
                    {t.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                    {t.cta} — it&apos;s already on this page ↘
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-3xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Used the tools and want a human opinion on the results?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Book a free strategy call. Bring your audit report and calculator
            numbers — we&apos;ll tell you what they actually mean for your
            market and which fixes pay for themselves first.
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
              <Search className="size-4" />
              Run the Free Audit
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
