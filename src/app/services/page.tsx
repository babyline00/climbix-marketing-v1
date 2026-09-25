import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { ServiceOverview } from "@/components/site/service-overview";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.services;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/services" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/services",
    type: "website",
  },
};

export default async function ServicesPage() {
  const override = await getPageOverride("services");
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
              { name: "Services", url: "/services" },
            ])
          ),
        }}
      />
      <ServiceOverview />
      <section className="relative py-16 lg:py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-4xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Not sure which service fits? That&apos;s exactly what the free
            strategy call is for.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            We&apos;ll look at your current funnel, your market, and your goals
            — then recommend the smallest set of channels that will move your
            revenue. Sometimes it&apos;s SEO. Sometimes it&apos;s ads. Often
            it&apos;s the unglamorous fix in between. Either way, you&apos;ll
            leave the call with a clear next step, whether we work together or
            not.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/strategy-call"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
            >
              Book a Free Strategy Call
            </Link>
            <Link
              href="/free-growth-audit"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/40 text-brand-700 hover:bg-brand-500/10 px-6 py-3 text-sm font-semibold"
            >
              Start With a Free Audit
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
