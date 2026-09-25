"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  GraduationCap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { INDUSTRIES } from "@/data/industries";
import type { IndustriesContent } from "@/lib/section-content";

const BORDER_MAP: Record<string, string> = {
  saas: "hover:border-brand-500/40",
  b2b: "hover:border-violet-500/40",
  technology: "hover:border-sky-500/40",
  ecommerce: "hover:border-amber-500/40",
  healthcare: "hover:border-rose-500/40",
  "real-estate": "hover:border-emerald-500/40",
};

// Additional verticals we serve (no dedicated pages yet)
const OTHER_INDUSTRIES = [
  {
    icon: DollarSign,
    name: "Finance & Fintech",
    desc: "Compliance-aware SEO and demand generation for financial products.",
    accent: "from-emerald-500/15 to-emerald-700/5",
    border: "hover:border-emerald-500/40",
  },
  {
    icon: GraduationCap,
    name: "Education",
    desc: "Enrollment-driven SEO and content for schools and edtech.",
    accent: "from-sky-500/15 to-sky-700/5",
    border: "hover:border-sky-500/40",
  },
];

export function Industries({ content }: { content?: IndustriesContent }) {
  const c = {
    eyebrow: "Industry expertise",
    title: "Built for your market, not every market.",
    intro:
      "Generic playbooks don't survive contact with a real market. We bring category-specific benchmarks, keyword intelligence, and buyer insight to every engagement.",
    ctaLabel: "Explore Industries",
    ctaHref: "/industries",
    ...content,
  };

  return (
    <section
      id="industries"
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

        {/* Industry detail pages */}
        <div className="mt-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-4 flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            Industry playbooks — click to view the full page
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <motion.div
                  key={ind.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className={`group relative rounded-2xl border border-border bg-card p-5 card-hover ${BORDER_MAP[ind.slug]}`}
                >
                  <Link
                    href={`/industries/${ind.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={ind.name}
                  />
                  <div
                    className={`size-11 rounded-xl bg-gradient-to-br ${ind.accent} flex items-center justify-center mb-4 ring-1 ring-inset ring-black/5`}
                  >
                    <Icon className="size-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-base">{ind.name}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {ind.tagline}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ind.keywords.groups[3]?.keywords.slice(0, 2).map((k) => (
                      <span
                        key={k}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-all">
                    View industry page
                    <ArrowRight className="size-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Other industries */}
        <div className="mt-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            More industries we serve
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3">
            {OTHER_INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`group relative rounded-2xl border border-border bg-card p-4 card-hover ${ind.border}`}
              >
                <div
                  className={`size-10 rounded-xl bg-gradient-to-br ${ind.accent} flex items-center justify-center mb-3 ring-1 ring-inset ring-black/5`}
                >
                  <ind.icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{ind.name}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  {ind.desc}
                </p>
              </motion.div>
            ))}
            <Link
              href={c.ctaHref || "/industries"}
              className="group relative rounded-2xl border border-dashed border-brand-500/40 bg-brand-500/[0.04] p-4 card-hover flex flex-col justify-center"
            >
              <div className="text-sm font-semibold text-brand-700 inline-flex items-center gap-1.5">
                {c.ctaLabel}
                <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Detailed playbooks, keyword sets, and case studies per industry.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
