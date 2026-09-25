import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { PAGE_META } from "@/data/seo-meta";
import { INDUSTRIES } from "@/data/industries";
import { breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.industries;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/industries" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/industries",
    type: "website",
  },
};

export default async function IndustriesPage() {
  const override = await getPageOverride("industries");
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
              { name: "Industries", url: "/industries" },
            ])
          ),
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200">
              <CheckCircle2 className="size-3.5" />
              Industries We Serve
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              Playbooks built for{" "}
              <span className="gradient-text">your market.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty">
              The keywords your buyers search, the objections your sales team
              hears, and the benchmarks that define &quot;good&quot; in your
              category — they&apos;re all different. Pick your industry to see
              how we approach growth in it: the strategy, the keyword sets, and
              the results we&apos;ve driven.
            </p>
          </div>
        </div>
      </section>

      {/* Industry grid */}
      <section className="relative py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.slug}
                  className="group relative rounded-2xl border border-border bg-card p-6 card-hover hover:border-brand-500/40 hover:shadow-xl hover:shadow-black/[0.04]"
                >
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={ind.name}
                  />
                  <div
                    className={`size-12 rounded-xl bg-gradient-to-br ${ind.accent} flex items-center justify-center mb-5 ring-1 ring-inset ring-black/5`}
                  >
                    <Icon className="size-6 text-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">{ind.name}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {ind.tagline}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {ind.hero.subheading}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-all">
                    View {ind.shortName} playbook
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-3xl border border-border bg-muted/30 p-8 lg:p-10 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
              Don&apos;t see your industry?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-pretty">
              We&apos;ve also driven results in finance, education, legal, and
              professional services. If your market isn&apos;t listed, book a
              strategy call — if we&apos;re not the right fit, we&apos;ll tell
              you honestly and point you to someone who is.
            </p>
            <Link
              href="/strategy-call"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
            >
              Talk to a Strategist
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
