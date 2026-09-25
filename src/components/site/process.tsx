"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Lightbulb,
  Rocket,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import type { ProcessContent } from "@/lib/section-content";

const STEP_ICONS = [Search, Lightbulb, Rocket, RefreshCw, TrendingUp];

const DEFAULTS: ProcessContent = {
  eyebrow: "Our process",
  title: "How we grow your business",
  intro:
    "A repeatable, transparent five-stage process designed to compound growth over time — not a one-off campaign that fades after launch.",
  steps: [
    {
      title: "Discover",
      desc: "We start by understanding your business, customers, competitors, and current growth bottlenecks — backed by audit data, not assumptions.",
    },
    {
      title: "Strategy",
      desc: "We build a custom growth strategy with prioritized channels, target keywords, content roadmap, and measurable milestones tied to revenue.",
    },
    {
      title: "Execute",
      desc: "We launch SEO, ads, and content campaigns in tight sprints — with weekly visibility, shared dashboards, and clear ownership of every workstream.",
    },
    {
      title: "Optimize",
      desc: "We continuously optimize based on data — doubling down on what works, cutting what doesn't, and refining the funnel at every stage.",
    },
    {
      title: "Scale",
      desc: "We scale the strategies that prove profitable — expanding into new keywords, audiences, geographies, and channels with predictable ROI.",
    },
  ],
};

export function Process({ content }: { content?: ProcessContent }) {
  const c = { ...DEFAULTS, ...content };
  return (
    <section
      id="process"
      className="relative py-20 lg:py-28 bg-background scroll-mt-20"
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

        <div className="mt-12 lg:mt-16 relative">
          {/* Vertical line on mobile / horizontal on desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid gap-6 lg:gap-4 lg:grid-cols-5">
            {c.steps.map((s, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative"
                >
                  {/* Step circle */}
                  <div className="relative z-10 mb-5 inline-flex">
                    <div className="size-12 lg:size-14 rounded-2xl bg-background border border-brand-500/30 shadow-sm flex items-center justify-center">
                      <Icon className="size-5 lg:size-6 text-brand-600" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 text-[10px] font-mono font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
