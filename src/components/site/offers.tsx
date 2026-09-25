"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgePercent, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  SECTION_CONTENT_DEFAULTS,
  type ItemsSectionContent,
} from "@/lib/section-content";

export type OfferData = {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  imageUrl?: string | null;
  ctaLabel: string;
  ctaHref: string;
  expiresAt: string | null;
  position: number;
};

export function Offers({
  items,
  content,
}: {
  items?: OfferData[];
  content?: Partial<ItemsSectionContent>;
}) {
  if (!items || items.length === 0) return null;
  const eyebrow = content?.eyebrow || SECTION_CONTENT_DEFAULTS.offers.eyebrow;
  const title = content?.title || SECTION_CONTENT_DEFAULTS.offers.title;

  return (
    <section
      aria-label="Current offers"
      className="relative py-16 lg:py-20 bg-background"
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
            <BadgePercent className="size-3.5" />
            {eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
          >
            {title}
          </motion.h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group relative flex flex-col rounded-2xl border border-brand-500/25 bg-gradient-to-b from-brand-500/[0.06] to-card p-6 card-hover hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all"
            >
              {o.imageUrl && (
                <div className="mb-5 overflow-hidden rounded-xl border border-brand-500/10 bg-white/60">
                  <Image src={o.imageUrl} alt="" width={640} height={288} className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              {o.badge && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-500/30">
                  <BadgePercent className="size-3" />
                  {o.badge}
                </span>
              )}

              <h3 className="text-lg font-semibold tracking-tight">
                {o.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                {o.description}
              </p>

              {o.expiresAt && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-brand-600" />
                  Ends{" "}
                  {new Date(o.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}

              <Button
                asChild
                className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white"
              >
                <a href={o.ctaHref || "#strategy-call"}>
                  {o.ctaLabel || "Claim Offer"}
                  <ArrowRight className="size-4" />
                </a>
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3" />
                No obligation · Limited slots
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
