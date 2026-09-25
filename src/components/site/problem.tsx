"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  XCircle,
  AlertTriangle,
  TrendingDown,
  Target,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import type { ProblemContent } from "@/lib/section-content";

const PROBLEM_ICONS = [TrendingDown, AlertTriangle, XCircle, Target];

const DEFAULTS: ProblemContent = {
  eyebrow: "The Growth Problem",
  title: "Your business doesn't need more marketing. It needs a growth system.",
  intro:
    "Most businesses don't have a traffic problem — they have a visibility, targeting, and conversion problem. Generic marketing tactics only amplify those issues. Here's what we see every day:",
  points: [
    {
      title: "Traffic but no leads",
      desc: "You're getting visitors, but they aren't converting into qualified opportunities.",
    },
    {
      title: "Expensive advertising",
      desc: "Cost per acquisition keeps rising while campaign ROI stays flat or declines.",
    },
    {
      title: "Low Google rankings",
      desc: "Competitors outrank you on the keywords that actually drive revenue.",
    },
    {
      title: "Poor conversion rates",
      desc: "Your site and funnels leak leads at every step of the buyer journey.",
    },
  ],
  footerNote: "Sound familiar? Let's fix it together.",
  footerLinkLabel: "See the solution",
};

export function Problem({ content }: { content?: ProblemContent }) {
  const c = { ...DEFAULTS, ...content };
  return (
    <section className="relative py-20 lg:py-28 bg-muted/30 border-b border-border">
      <div className="mx-auto max-w-7xl container-px">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700"
          >
            <Lightbulb className="size-3.5" />
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

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {c.points.map((p, i) => {
            const Icon = PROBLEM_ICONS[i % PROBLEM_ICONS.length];
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative rounded-2xl border border-border bg-background p-6 card-hover hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Icon className="size-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-base">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex items-center gap-3 text-base text-muted-foreground"
        >
          <span className="hidden sm:inline">{c.footerNote}</span>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-brand-700 font-semibold hover:gap-2.5 transition-all"
          >
            {c.footerLinkLabel}
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
