"use client";

import * as React from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScheduler } from "@/components/site/scheduler-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServiceIcon, type ServiceContent } from "@/data/services";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

// Same slide, starting opaque. The h1 is the LCP candidate and the subheading
// becomes the largest painted element on narrow viewports; LCP is only recorded
// once an element paints, so fading these in from opacity 0 delays it by the
// full animation duration.
const riseUp = {
  hidden: { opacity: 1, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export function ServiceDetail({ service }: { service: ServiceContent }) {
  // getServiceIcon reads from SERVICE_ICONS, a module-level Record built once
  // from the lucide imports. The returned reference is therefore identical on
  // every render, so <Icon /> is a stable element type and React will not
  // remount it. The static-components rule cannot see through the lookup, so it
  // is silenced at the JSX usage below rather than worked around.
  const Icon = getServiceIcon(service.icon);
  const { openScheduler } = useScheduler();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [service.slug]);

  return (
    <div>
      {/* ────────── HERO ────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-20 lg:pb-28">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="absolute -top-10 right-[10%] size-72 rounded-full bg-brand-500/20 blur-3xl animate-float" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          {/* Breadcrumb + back */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">{service.shortName}</span>
          </motion.div>

          <div className="max-w-3xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
            >
              {/* Stable reference from the static SERVICE_ICONS map — see the note above Icon. */}
              {/* eslint-disable-next-line react-hooks/static-components */}
              <Icon className="size-3.5" />
              {service.hero.eyebrow}
            </motion.div>

            <motion.h1
              custom={1}
              variants={riseUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
            >
              {service.hero.headline}{" "}
              <span className="gradient-text">{service.hero.highlight}</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={riseUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty"
            >
              {service.hero.subheading}
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
                    source: `service-${service.slug}-hero`,
                    service: service.name,
                  })
                }
                size="lg"
                className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30"
              >
                {service.hero.cta}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur"
              >
                <Link href="/free-growth-audit">Get Free Audit</Link>
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
              {service.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ────────── PROBLEM ────────── */}
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
              The Problem
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {service.problem.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground text-pretty"
            >
              {service.problem.intro}
            </motion.p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 lg:gap-6">
            {service.problem.points.map((p, i) => (
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
              {service.framework.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground text-pretty"
            >
              {service.framework.intro}
            </motion.p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {service.framework.pillars.map((p, i) => (
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

      {/* ────────── SUB-SERVICES ────────── */}
      <section className="relative py-20 lg:py-28 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl lg:text-4xl font-bold tracking-tight text-balance"
            >
              {service.subServices.title}
            </motion.h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {service.subServices.items.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="rounded-2xl border border-border bg-background p-5 card-hover hover:border-brand-500/40"
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

      {/* ────────── PROCESS ────────── */}
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
              {service.process.title}
            </motion.h2>
          </div>

          <div className="mt-12 relative">
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="grid gap-6 lg:gap-4 lg:grid-cols-5">
              {service.process.steps.map((s, i) => (
                <motion.div
                  key={s.no}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative"
                >
                  <div className="relative z-10 mb-5 inline-flex">
                    <div className="size-12 lg:size-14 rounded-2xl bg-background border border-brand-500/30 shadow-sm flex items-center justify-center">
                      <span className="text-sm font-mono font-bold text-brand-600">
                        {s.no}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-base">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────── RESULTS ────────── */}
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
              {service.results.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-white/70 text-pretty"
            >
              {service.results.intro}
            </motion.p>
          </div>

          {/* Metrics */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {service.results.metrics.map((m, i) => (
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

          {/* Case study blurb */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 lg:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-brand-500/15 ring-1 ring-inset ring-brand-500/30 flex items-center justify-center shrink-0">
                <Target className="size-5 text-brand-300" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">
                  Client Spotlight
                </div>
                <p className="text-sm lg:text-base text-white/80 leading-relaxed">
                  {service.results.blurb}
                </p>
              </div>
            </div>
          </motion.div>
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
              {service.faq.map((f, i) => (
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
        id="contact-service"
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
            {service.finalCta.headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 text-lg text-white/70 max-w-2xl mx-auto text-pretty"
          >
            {service.finalCta.subheading}
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
                  source: `service-${service.slug}-final-cta`,
                  service: service.name,
                })
              }
              size="lg"
              className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30 px-7"
            >
              {service.hero.cta}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur px-7"
            >
              <Link href="/free-growth-audit">Get Free Audit</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
