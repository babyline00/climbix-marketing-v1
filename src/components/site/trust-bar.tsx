"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Globe2, Users, Repeat, TrendingUp } from "lucide-react";
import { useSiteContent } from "@/components/site/site-content-context";

const LOGOS = [
  "NexaCloud",
  "Flowdesk",
  "Quantly",
  "Pinnacle",
  "BrightPath",
  "LeadForge",
  "Skyline SaaS",
  "Vertex",
];

export function TrustBar() {
  const { content } = useSiteContent();

  const STATS = [
    { icon: Users, value: content["stats.clients"] || "120+", label: "Clients Served" },
    { icon: Globe2, value: content["stats.countries"] || "18+", label: "Countries" },
    { icon: Repeat, value: content["stats.retention"] || "94%", label: "Client Retention" },
    { icon: TrendingUp, value: content["stats.revenue"] || "$24M+", label: "Revenue Generated" },
  ];

  return (
    <section className="relative border-b border-border bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-7xl container-px">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="size-4 fill-amber-400 text-amber-400"
                />
              ))}
            </span>
            Trusted by growing businesses worldwide
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-5 lg:p-6 text-center card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="mx-auto size-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                <s.icon className="size-5 text-brand-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold tracking-tight">
                {s.value}
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground mt-1">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logo marquee */}
        <div className="mt-12 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex w-max marquee gap-12 opacity-60">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                className="text-xl font-bold text-muted-foreground/70 whitespace-nowrap tracking-tight"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
