"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Bot,
  Target,
  PenLine,
  Megaphone,
  TrendingUp,
  Star,
  CalendarCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StrategyCallForm } from "./strategy-call-form";
import type { HeroContent } from "@/lib/section-content";

const HERO_DEFAULTS: HeroContent = {
  badge: "Global SEO, AI Search & Lead Generation Agency",
  headline: "Turn Search Visibility Into Revenue.",
  subheadline:
    "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
  ctaLabel: "Schedule a Strategy Call",
  secondaryLabel: "See How We Work",
  secondaryHref: "/services",
  proofs: [
    { label: "No long-term contracts" },
    { label: "Onboarding within 48 hours" },
    { label: "Talk to a strategist, not a bot" },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const HERO_BADGES = [
  { icon: Search, label: "SEO" },
  { icon: Bot, label: "AI Search" },
  { icon: Target, label: "Lead Gen" },
  { icon: PenLine, label: "Content" },
  { icon: Megaphone, label: "PPC" },
  { icon: TrendingUp, label: "CRO" },
];

export function Hero({ content }: { content?: HeroContent }) {
  const c = { ...HERO_DEFAULTS, ...content };

  // Split headline into base + highlighted last word
  const headline = c.headline;
  const headlineWords = headline.trim().split(" ");
  const headlineBase = headlineWords.slice(0, -1).join(" ");
  const highlight = headlineWords[headlineWords.length - 1];

  const scrollToForm = () => {
    document
      .getElementById("strategy-call")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-20 lg:pb-28"
    >
      {/* Background layers */}
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
      <div className="absolute inset-0 hero-radial" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" aria-hidden />

      {/* Floating orbs */}
      <div
        className="absolute top-32 right-[8%] size-72 rounded-full bg-brand-500/20 blur-3xl animate-float"
        aria-hidden
      />
      <div
        className="absolute bottom-10 left-[10%] size-64 rounded-full bg-brand-400/15 blur-3xl animate-pulse-soft"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl container-px">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: copy */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
              </span>
              {c.badge}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
            >
              {headlineBase}{" "}
              <span className="gradient-text">{highlight}</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-lg lg:text-xl text-white/70 max-w-xl text-pretty"
            >
              {c.subheadline}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={scrollToForm}
                size="lg"
                className="bg-brand-500 hover:bg-brand-400 text-white font-semibold shadow-xl shadow-brand-500/30"
              >
                {c.ctaLabel}
                <CalendarCheck className="size-4" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur"
              >
                <Link href={c.secondaryHref || "/services"}>
                  {c.secondaryLabel}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center gap-2"
            >
              {HERO_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"
                >
                  <b.icon className="size-3.5 text-brand-300" />
                  {b.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-10 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="size-4 fill-brand-400 text-brand-400"
                    />
                  ))}
                </div>
                <span>Trusted by growing businesses worldwide</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {(c.proofs || HERO_DEFAULTS.proofs).map((p) => (
                  <span
                    key={p.label}
                    className="inline-flex items-center gap-1.5 text-sm text-white/60"
                  >
                    <Zap className="size-4 text-brand-400 shrink-0" />
                    {p.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Schedule a Strategy Call form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="lg:col-span-5"
          >
            <StrategyCallForm id="strategy-call" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
