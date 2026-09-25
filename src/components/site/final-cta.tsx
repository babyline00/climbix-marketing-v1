"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScheduler } from "@/components/site/scheduler-context";
import { SECTION_CONTENT_DEFAULTS, type FinalCtaContent } from "@/lib/section-content";

export function FinalCta({ content }: { content?: Partial<FinalCtaContent> }) {
  const { openScheduler } = useScheduler();
  const defaults = SECTION_CONTENT_DEFAULTS["final-cta"];
  const c = { ...defaults, ...content };
  return (
    <section
      id="contact"
      className="relative py-20 lg:py-28 bg-ink-900 text-white overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 hero-grid opacity-50" aria-hidden />
      <div className="absolute inset-0 hero-radial" aria-hidden />

      {/* Floating orbs */}
      <div className="absolute top-10 left-[20%] size-72 rounded-full bg-brand-500/15 blur-3xl animate-float" aria-hidden />
      <div className="absolute bottom-10 right-[15%] size-80 rounded-full bg-orange-400/15 blur-3xl animate-pulse-soft" aria-hidden />

      <div className="relative mx-auto max-w-5xl container-px text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-200"
        >
          <Sparkles className="size-3.5" />
          {c.eyebrow}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
        >
          {c.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-5 text-lg lg:text-xl text-white/70 max-w-2xl mx-auto text-pretty"
        >
          {c.subheading}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            onClick={() => openScheduler({ source: "final-cta" })}
            size="lg"
            className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30 px-7"
          >
            <Calendar className="size-4" />
            {c.ctaLabel}
            <ArrowRight className="size-4" />
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur px-7"
          >
            <Link href={c.secondaryHref || "/free-growth-audit"}>
              <Search className="size-4" />
              {c.secondaryLabel}
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 text-xs text-white/50"
        >
          {c.note}
        </motion.p>
      </div>
    </section>
  );
}
