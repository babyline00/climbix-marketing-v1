import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { CASE_STUDIES } from "@/data/case-studies";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/data/seo-meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = CASE_STUDIES.find((entry) => entry.slug === slug);
  if (!item) return {};
  return {
    title: `${item.client} Case Study`,
    description: `${item.client}: ${item.industry} growth case study covering strategy, timeline and reported outcomes.`,
    alternates: { canonical: `/case-studies/${item.slug}` },
    openGraph: { title: `${item.client} Case Study | ${SITE_NAME}`, description: item.challenge, url: `/case-studies/${item.slug}`, type: "article" },
  };
}

export default async function CaseStudyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = CASE_STUDIES.find((entry) => entry.slug === slug);
  if (!item) notFound();

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
        { name: "Home", url: "/" }, { name: "Case Studies", url: "/case-studies" }, { name: item.client, url: `/case-studies/${item.slug}` },
      ])) }} />
      <PageHero eyebrow={item.industry} title={`${item.client}: the engagement`} highlight={item.duration} intro={item.challenge} />
      <main className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-6xl container-px space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            {item.outcomes.map((outcome) => (
              <div key={outcome.label} className="rounded-2xl border border-border bg-card p-6">
                <div className="text-3xl font-bold text-brand-700">{outcome.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{outcome.label}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-5 gap-8">
            <section className="lg:col-span-3 rounded-3xl border border-border bg-card p-7 lg:p-9">
              <h2 className="text-2xl font-bold">Strategy & deliverables</h2>
              <ul className="mt-6 space-y-4">
                {item.strategy.map((work) => <li key={work} className="flex gap-3 text-sm leading-6"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" />{work}</li>)}
              </ul>
              <h2 className="mt-10 text-2xl font-bold">Phased timeline</h2>
              <div className="mt-6 space-y-5">
                {item.timeline.map((phase) => <div key={phase.phase} className="border-l-2 border-brand-500/30 pl-5"><div className="font-semibold">{phase.phase}</div><p className="mt-1 text-sm text-muted-foreground leading-6">{phase.work}</p></div>)}
              </div>
            </section>
            <aside className="lg:col-span-2 space-y-5">
              {item.quote && <blockquote className="rounded-3xl border border-border bg-muted/30 p-7"><p className="text-base italic leading-7">“{item.quote.text}”</p><footer className="mt-5 text-sm font-semibold">{item.quote.name}<span className="block font-normal text-muted-foreground">{item.quote.role}</span></footer></blockquote>}
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6"><h2 className="font-semibold">Case-study disclosure</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.disclosure}</p></div>
            </aside>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="size-4" />All case studies</Link>
            <Link href="/strategy-call" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">Discuss a similar engagement<ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
