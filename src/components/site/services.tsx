"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getServiceIcon } from "@/data/services";
import { useServices } from "@/components/site/services-context";
import type { ServicesContent } from "@/lib/section-content";

export function Services({ content }: { content?: ServicesContent }) {
  const services = useServices();
  const c = {
    eyebrow: "One Growth System. Multiple Channels.",
    title: "What we do — growth, engineered.",
    intro:
      "Every service we offer ties back to one outcome: business growth. We don't sell vanity metrics. We don't sell rankings for rankings' sake. We build a connected growth system where visibility becomes traffic, traffic becomes qualified leads, and leads become revenue.",
    ctaLabel: "Explore Our Services",
    ctaHref: "/services",
    ...content,
  };

  return (
    <section
      id="services"
      className="relative py-20 lg:py-28 bg-background scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl container-px">
        <div id="solution" className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700"
          >
            <CheckCircle2 className="size-3.5" />
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

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {services.map((s, i) => {
            const Icon = getServiceIcon(s.icon);
            const points = s.cardPoints ?? [];
            return (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                className={`group relative rounded-2xl border border-border bg-card p-6 card-hover hover:shadow-xl hover:shadow-black/[0.04] ${s.border}`}
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="absolute inset-0 z-10"
                  aria-label={s.name}
                />
                <div
                  className={`size-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-5 ring-1 ring-inset ring-black/5`}
                >
                  <Icon className="size-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="text-xs text-brand-700 font-medium mt-0.5">
                  {s.tagline}
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.cardDesc}
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-1.5">
                  {points.map((p) => (
                    <li
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs text-foreground/80"
                    >
                      <CheckCircle2 className="size-3.5 text-brand-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-all">
                  Learn more
                  <ArrowRight className="size-3.5" />
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
            <Link
              href={c.ctaHref || "/services"}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
            >
              {c.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
        </motion.div>
      </div>
    </section>
  );
}
