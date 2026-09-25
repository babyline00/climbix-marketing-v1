import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Video,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { StrategyCallForm } from "@/components/site/strategy-call-form";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META["strategy-call"];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/strategy-call" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/strategy-call",
    type: "website",
  },
};

const AGENDA = [
  "A quick review of your website, funnel, and current channels",
  "The 2–3 biggest growth levers we see — with rough effort estimates",
  "Keyword and competitor snapshot for your market",
  "An honest take on whether an agency, a hire, or a DIY fix is right for you",
];

const EXPECTATIONS = [
  { icon: Clock, title: "30 focused minutes", desc: "No slide deck. We look at your actual data and talk specifics." },
  { icon: Video, title: "Video call or phone", desc: "Your choice — we'll send a link that works in any browser." },
  { icon: ShieldCheck, title: "Zero pressure", desc: "If we're not the right fit, we'll say so and point you to a better option." },
];

export default async function StrategyCallPage() {
  const override = await getPageOverride("strategy-call");
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
              { name: "Free Strategy Call", url: "/strategy-call" },
            ])
          ),
        }}
      />

      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-7xl container-px">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200">
                <CalendarCheck className="size-3.5" />
                Free Strategy Call
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-balance leading-[1.05]">
                30 minutes that save you{" "}
                <span className="gradient-text">months of guessing.</span>
              </h1>
              <p className="mt-6 text-lg text-white/70 max-w-xl text-pretty">
                Book a free call with a senior strategist. We&apos;ll review
                your funnel, show you the biggest growth levers we see, and
                give you a clear next step — whether that&apos;s working with
                us, hiring in-house, or a fix you can make yourself this
                week.
              </p>

              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-300">
                  What we&apos;ll cover
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {AGENDA.map((a) => (
                    <li key={a} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-brand-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/75 leading-relaxed">
                        {a}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                {EXPECTATIONS.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <e.icon className="size-5 text-brand-400" />
                    <h3 className="mt-2.5 text-sm font-semibold">{e.title}</h3>
                    <p className="mt-1 text-xs text-white/55 leading-relaxed">
                      {e.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              <StrategyCallForm />
              <p className="mt-4 text-xs text-white/50 text-center">
                Prefer email? Reach us at{" "}
                <Link
                  href="/contact"
                  className="text-brand-300 hover:underline inline-flex items-center gap-0.5"
                >
                  hello@climbixmarketing.com
                  <ArrowRight className="size-3" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
