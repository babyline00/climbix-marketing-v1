import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { Process } from "@/components/site/process";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.process;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/process" },
  openGraph: { title: meta.title, description: meta.description, url: "/process", type: "website" },
};

export default async function ProcessPage() {
  const override = await getPageOverride("process");
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
              { name: "Our Process", url: "/process" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="Our Process"
        title="A growth system,"
        highlight="not a monthly surprise."
        intro="Every Climbix engagement runs on the same five-stage operating system. You always know what we're doing, why we're doing it, and what result it's tied to. Here's the full journey — from the first audit to compounding scale."
      />

      <Process />

      {/* What working together looks like */}
      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl container-px">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            What working together actually looks like
          </h2>
          <div className="mt-8 space-y-6">
            {[
              {
                title: "Week 1–2: Onboarding sprint",
                desc: "Access setup, analytics audit, stakeholder interviews, and baseline reporting. By day 10 you have the findings deck and the prioritized 90-day roadmap — not a 'we're still getting oriented' email.",
              },
              {
                title: "Weekly: Visibility without meetings",
                desc: "A shared dashboard shows live progress on every workstream. One short weekly update email tells you what shipped, what we learned, and what's next. Meetings are for decisions, not status theater.",
              },
              {
                title: "Monthly: The numbers that matter",
                desc: "One report, in plain language, tying every activity to traffic, leads, pipeline, and revenue — with honest commentary on what's working and what isn't. If something underperformed, the fix is already in the plan.",
              },
              {
                title: "Quarterly: Strategy reset",
                desc: "Markets shift and data accumulates. Every quarter we re-prioritize the roadmap against results — doubling down where the ROI is real and cutting what isn't. Your strategy never goes stale.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold text-brand-700">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-3xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            See the process applied to your business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Book a free strategy call and we&apos;ll map your first 90 days
            through this exact framework — no obligation, no hard sell.
          </p>
          <Link
            href="/strategy-call"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
          >
            Book My Free Strategy Call
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
