"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  DollarSign,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaseStudiesContent } from "@/lib/section-content";

const CASE_ICONS = [TrendingUp, Target, DollarSign];

const DEFAULTS: CaseStudiesContent = {
  eyebrow: "Real results. Real businesses.",
  title: "Growth that compounds, quarter after quarter.",
  intro:
    "We measure success the same way you do — in pipeline, revenue, and retention. Here's a snapshot of the outcomes we've driven for clients across SaaS, B2B, and ecommerce.",
  cases: [
    {
      client: "SaaS — Workflow Platform",
      challenge: "Low organic traffic, heavy paid acquisition dependency",
      strategy: "SEO + Content + Lead Magnets",
      metric1Label: "Organic Traffic",
      metric1Value: "+250%",
      metric2Label: "Qualified Leads",
      metric2Value: "+180%",
      metric3Label: "Revenue",
      metric3Value: "+120%",
    },
    {
      client: "B2B — Professional Services",
      challenge: "Expensive paid ads with poor conversion",
      strategy: "PPC Audit + CRO + Retargeting",
      metric1Label: "Cost / Acquisition",
      metric1Value: "-40%",
      metric2Label: "More Leads",
      metric2Value: "+200%",
      metric3Label: "ROAS",
      metric3Value: "+165%",
    },
    {
      client: "Ecommerce — DTC Brand",
      challenge: "Stagnant revenue, low brand visibility",
      strategy: "AI Search + Content + Technical SEO",
      metric1Label: "AI Citations",
      metric1Value: "+340%",
      metric2Label: "Organic Revenue",
      metric2Value: "+95%",
      metric3Label: "Avg. Order Value",
      metric3Value: "+22%",
    },
  ],
  ctaLabel: "See all case studies",
  ctaHref: "/case-studies",
};

export function CaseStudies({ content }: { content?: CaseStudiesContent }) {
  const c = { ...DEFAULTS, ...content };
  const CASE_ACCENTS = [
    { accent: "from-brand-500/15 to-brand-700/5", border: "border-brand-500/30" },
    { accent: "from-violet-500/15 to-violet-700/5", border: "border-violet-500/30" },
    { accent: "from-amber-500/15 to-amber-700/5", border: "border-amber-500/30" },
  ];
  return (
    <section
      id="case-studies"
      className="relative py-20 lg:py-28 bg-muted/30 border-y border-border scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl container-px">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700"
          >
            <TrendingUp className="size-3.5" />
            {c.eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-3xl lg:text-5xl font-bold tracking-tight text-balance"
          >
            {c.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground text-pretty"
          >
            {c.intro}
          </motion.p>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-5 lg:gap-6">
          {c.cases.map((cs, i) => {
            const accent = CASE_ACCENTS[i % CASE_ACCENTS.length];
            const metrics = [
              { icon: CASE_ICONS[0], label: cs.metric1Label, value: cs.metric1Value },
              { icon: CASE_ICONS[1], label: cs.metric2Label, value: cs.metric2Value },
              { icon: CASE_ICONS[2], label: cs.metric3Label, value: cs.metric3Value },
            ];
            return (
              <motion.div
                key={cs.client}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`group relative rounded-3xl border ${accent.border} bg-card overflow-hidden card-hover hover:shadow-xl hover:shadow-black/[0.04]`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent.accent} opacity-60 pointer-events-none`}
                  aria-hidden
                />
                <div className="relative p-6 lg:p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cs.client}
                    </span>
                    <Quote className="size-5 text-brand-500/40" />
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground">Challenge</div>
                    <p className="text-sm font-medium mt-0.5">{cs.challenge}</p>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground">Strategy</div>
                    <p className="text-sm font-medium mt-0.5">{cs.strategy}</p>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    {metrics.map((m) => (
                      <div
                        key={m.label}
                        className="flex items-center justify-between rounded-xl bg-background/60 border border-border p-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                            <m.icon className="size-4 text-brand-600" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {m.label}
                          </span>
                        </div>
                        <span className="text-base font-bold text-brand-700">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={
                      cs.client.toLowerCase().includes("saas")
                        ? "/case-studies/nexacloud"
                        : cs.client.toLowerCase().includes("b2b")
                          ? "/case-studies/pinnacle-consulting-group"
                          : "/case-studies/skyline-commerce"
                    }
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 group-hover:gap-2.5 transition-all"
                  >
                    View case study
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-brand-500/40 text-brand-700 hover:bg-brand-500/10"
          >
            <Link href={c.ctaHref || "/case-studies"}>
              {c.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
