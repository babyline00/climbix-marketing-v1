"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Target,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScheduler } from "@/components/site/scheduler-context";
import { getIndustry } from "@/data/industries";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export function IndustryDetail({ slug }: { slug: string }) {
  const industry = getIndustry(slug);
  const Icon = industry?.icon;
  const { openScheduler } = useScheduler();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  if (!industry || !Icon) return null;

  return (
    <div>
      {/* ────────── HERO ────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-20 lg:pb-28">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="absolute -top-10 right-[10%] size-72 rounded-full bg-brand-500/20 blur-3xl animate-float" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link
              href="/industries"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/industries" className="hover:text-white">
              Industries
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">{industry.shortName}</span>
          </motion.div>

          <div className="max-w-3xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
            >
              <Icon className="size-3.5" />
              {industry.hero.eyebrow}
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
            >
              {industry.hero.headline}{" "}
              <span className="gradient-text">{industry.hero.highlight}</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty"
            >
              {industry.hero.subheading}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={() =>
                  openScheduler({
                    source: `industry-${industry.slug}-hero`,
                    service: industry.name,
                  })
                }
                size="lg"
                className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30"
              >
                {industry.hero.cta}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={() => {}}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur"
              >
                See Other Industries
              </Button>
            </motion.div>

            <motion.p
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 inline-flex items-center gap-2 text-sm text-white/50"
            >
              <Sparkles className="size-3.5 text-brand-300" />
              {industry.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ────────── CHALLENGES ────────── */}
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
              <XCircle className="size-3.5" />
              The Challenge
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {industry.challenges.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground text-pretty"
            >
              {industry.challenges.intro}
            </motion.p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 lg:gap-6">
            {industry.challenges.points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FRAMEWORK ────────── */}
      <section className="relative py-20 lg:py-28 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700"
            >
              <CheckCircle2 className="size-3.5" />
              The Solution
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {industry.framework.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground text-pretty"
            >
              {industry.framework.intro}
            </motion.p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {industry.framework.pillars.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-card p-6 card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="text-xs font-mono text-brand-600 font-bold mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-semibold text-base">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── KEYWORDS ────────── */}
      <section className="relative py-20 lg:py-28 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700"
            >
              <Search className="size-3.5" />
              Target Keywords
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {industry.keywords.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground text-pretty"
            >
              {industry.keywords.intro}
            </motion.p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {industry.keywords.groups.map((group, i) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
                  {group.label}
                </h3>
                <ul className="space-y-2">
                  {group.keywords.map((kw) => (
                    <li
                      key={kw}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="size-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span className="font-mono text-xs leading-relaxed">
                        {kw}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── CASE STUDY ────────── */}
      <section className="relative py-20 lg:py-28 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
        <div className="absolute inset-0 hero-radial opacity-60" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200"
            >
              <TrendingUp className="size-3.5" />
              Real Results
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {industry.caseStudy.title}
            </motion.h2>
          </div>

          {/* Metrics */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {industry.caseStudy.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text">
                  {m.value}
                </div>
                <div className="mt-2 text-xs lg:text-sm text-white/60">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Case study details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:p-8"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="size-12 rounded-xl bg-brand-500/15 ring-1 ring-inset ring-brand-500/30 flex items-center justify-center shrink-0">
                <Target className="size-5 text-brand-300" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">
                  Client Spotlight
                </div>
                <div className="font-semibold text-lg">
                  {industry.caseStudy.client}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  Challenge
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {industry.caseStudy.challenge}
                </p>
              </div>
              <div>
                <div className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  Strategy
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {industry.caseStudy.strategy}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-black/20 p-4 border border-white/5">
              <p className="text-sm text-white/80 leading-relaxed">
                {industry.caseStudy.blurb}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────── SERVICES ────────── */}
      <section className="relative py-20 lg:py-28 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {industry.services.title}
            </motion.h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {industry.services.items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 card-hover hover:border-brand-500/40"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FAQ ────────── */}
      <section className="relative py-20 lg:py-28 bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-4xl container-px">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-bold tracking-tight text-center text-balance"
          >
            Frequently asked questions
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {industry.faq.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="rounded-2xl border border-border bg-background px-5 data-[state=open]:border-brand-500/40 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ────────── FINAL CTA ────────── */}
      <section
        id={`contact-industry-${industry.slug}`}
        className="relative py-20 lg:py-28 bg-ink-900 text-white overflow-hidden"
      >
        <div className="absolute inset-0 hero-grid opacity-50" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="absolute top-10 left-[20%] size-72 rounded-full bg-brand-500/15 blur-3xl animate-float" aria-hidden />

        <div className="relative mx-auto max-w-5xl container-px text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-200"
          >
            <Sparkles className="size-3.5" />
            Ready when you are
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-balance leading-[1.05]"
          >
            {industry.finalCta.headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 text-lg text-white/70 max-w-2xl mx-auto text-pretty"
          >
            {industry.finalCta.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              onClick={() =>
                openScheduler({
                  source: `industry-${industry.slug}-final-cta`,
                  service: industry.name,
                })
              }
              size="lg"
              className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30 px-7"
            >
              {industry.hero.cta}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur px-7"
            >
              <Link href="/industries">See Other Industries</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
