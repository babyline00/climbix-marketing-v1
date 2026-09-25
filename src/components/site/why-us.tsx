"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Target,
  BarChart3,
  Globe2,
  TrendingUp,
  ArrowDown,
} from "lucide-react";
import type { WhyUsContent } from "@/lib/section-content";

const REASON_ICONS = [Target, BarChart3, Globe2, TrendingUp];

const DEFAULTS: WhyUsContent = {
  eyebrow: "Why businesses choose us",
  title: "We build predictable growth systems.",
  intro:
    "Most agencies sell rankings. We sell business growth. Here's what makes our approach fundamentally different from the typical full-service digital marketing shop.",
  reasons: [
    {
      title: "Strategy before execution",
      desc: "We don't use one-size-fits-all marketing. Every engagement starts with a deep audit of your business, competitors, and market — so the tactics we deploy actually move the metrics that matter to you, not just vanity numbers.",
    },
    {
      title: "Data-driven decisions",
      desc: "Every recommendation we make is backed by data — search volume, intent signals, conversion analytics, and revenue attribution. No gut-feel campaigns. No guesses. Just measurable experiments and proven patterns.",
    },
    {
      title: "Global expertise",
      desc: "Strategies designed for competitive international markets. We've helped businesses across 18+ countries rank, convert, and scale — whether you're targeting North America, EMEA, APAC, or emerging markets.",
    },
    {
      title: "Focus on ROI",
      desc: "We focus on business growth — not vanity metrics. Traffic is a means to an end. Every report we send ties activity back to qualified leads, pipeline, and revenue so you always know what you're paying for.",
    },
  ],
  funnelTitle: "Our growth model",
  funnelIntro:
    "We don't sell traffic. We engineer a system that turns visibility into revenue — step by step.",
  funnel: [
    { label: "Visibility", desc: "Get found on Google & AI search" },
    { label: "Traffic", desc: "Attract the right audience" },
    { label: "Qualified Leads", desc: "Convert visitors into prospects" },
    { label: "Conversions", desc: "Turn prospects into customers" },
    { label: "Revenue", desc: "Scale predictable growth" },
  ],
};

export function WhyUs({ content }: { content?: WhyUsContent }) {
  const c = { ...DEFAULTS, ...content };
  return (
    <section
      id="why-us"
      className="relative py-20 lg:py-28 bg-ink-900 text-white overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
      <div
        className="absolute inset-0 hero-radial opacity-60"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl container-px">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200"
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
            className="mt-5 text-lg text-white/70 text-pretty"
          >
            {c.intro}
          </motion.p>
        </div>

        {/* Reasons grid */}
        <div className="mt-12 grid sm:grid-cols-2 gap-4 lg:gap-6">
          {c.reasons.map((r, i) => {
            const Icon = REASON_ICONS[i % REASON_ICONS.length];
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:p-7 hover:bg-white/[0.06] transition-colors"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-brand-500/20 flex items-center justify-center mb-5">
                  <Icon className="size-6 text-brand-300" />
                </div>
                <h3 className="text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  {r.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Growth funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:p-10"
        >
          <div className="text-center">
            <h3 className="text-xl lg:text-2xl font-bold">{c.funnelTitle}</h3>
            <p className="mt-2 text-sm text-white/60 max-w-xl mx-auto">
              {c.funnelIntro}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-2 items-stretch">
            {c.funnel.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="h-full rounded-2xl bg-gradient-to-b from-brand-500/15 to-brand-700/5 border border-brand-500/20 p-5 text-center">
                  <div className="text-xs text-brand-300 font-mono mb-2">
                    0{i + 1}
                  </div>
                  <div className="text-base font-bold">{step.label}</div>
                  <div className="mt-1 text-xs text-white/55 leading-snug">
                    {step.desc}
                  </div>
                </div>
                {i < c.funnel.length - 1 && (
                  <ArrowDown
                    className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 size-5 text-brand-400/70"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
