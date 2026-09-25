"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe2, ArrowRight } from "lucide-react";
import type { LocationsContent } from "@/lib/section-content";

const DEFAULTS: LocationsContent = {
  eyebrow: "Global presence",
  title: "Digital marketing services, worldwide.",
  intro:
    "We help businesses compete and win in the world's most demanding markets. Each location page is built with localized intent, relevant proof, and unique value — never copy-pasted template pages that Google ignores.",
  points: [
    "Localized keyword research per market",
    "Region-specific competitor analysis",
    "Cultural + language-aware content",
    "Local search + map pack optimization",
  ],
  locations: [
    { country: "USA", city: "New York · San Francisco", flag: "US" },
    { country: "UK", city: "London · Manchester", flag: "UK" },
    { country: "Canada", city: "Toronto · Vancouver", flag: "CA" },
    { country: "Australia", city: "Sydney · Melbourne", flag: "AU" },
    { country: "UAE", city: "Dubai · Abu Dhabi", flag: "AE" },
    { country: "Germany", city: "Berlin · Munich", flag: "DE" },
  ],
};

export function Locations({ content }: { content?: LocationsContent }) {
  const c = { ...DEFAULTS, ...content };
  return (
    <section className="relative py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl container-px">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700"
            >
              <Globe2 className="size-3.5" />
              {c.eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
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

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 space-y-2.5"
            >
              {c.points.map((point) => (
                <div key={point} className="flex items-center gap-2.5">
                  <div className="size-1.5 rounded-full bg-brand-500" />
                  <span className="text-sm text-foreground/80">{point}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <Link
                href="/locations"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:gap-2.5 transition-all"
              >
                Explore all locations
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: location grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {c.locations.map((loc, i) => (
              <motion.div
                key={loc.country}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group rounded-2xl border border-border bg-card p-5 card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {loc.flag}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3 font-semibold">{loc.country}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {loc.city}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
