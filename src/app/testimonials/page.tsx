import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { Testimonials } from "@/components/site/testimonials";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { db } from "@/lib/db";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.testimonials;

export const revalidate = 120;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/testimonials" },
  openGraph: { title: meta.title, description: meta.description, url: "/testimonials", type: "website" },
};

async function getDbTestimonials() {
  try {
    const rows = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl,
      featured: t.featured,
      position: t.position,
    }));
  } catch {
    return undefined;
  }
}

export default async function TestimonialsPage() {
  const override = await getPageOverride("testimonials");
  if (override)
    return (
      <PageShell>
        <CmsPageBody page={override} />
      </PageShell>
    );
  const items = await getDbTestimonials();

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Testimonials", url: "/testimonials" },
            ])
          ),
        }}
      />

      {/* H1 band */}
      <section className="relative pt-28 lg:pt-36 pb-4 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Client reviews, in their words.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground text-pretty">
            Every review below comes from a real engagement — marketing
            leaders, founders, and directors describing what it&apos;s like to
            work with Climbix and what changed for their business.
          </p>
        </div>
      </section>

      <Testimonials items={items} />

      <section className="py-16 lg:py-20 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-3xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Ready to write the next review?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Start with a free growth audit or a strategy call — and see why
            94% of our clients stay with us past the first year.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/free-growth-audit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
            >
              Get My Free Audit
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/strategy-call"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/40 text-brand-700 hover:bg-brand-500/10 px-6 py-3 text-sm font-semibold"
            >
              Book a Strategy Call
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
