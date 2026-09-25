"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import {
  SECTION_CONTENT_DEFAULTS,
  type TestimonialsContent,
} from "@/lib/section-content";

const TESTIMONIALS = [
  {
    quote:
      "The team helped us significantly improve our organic visibility and generate more qualified leads. Within two quarters, our organic pipeline became our largest source of new business.",
    name: "Aisha Rahman",
    role: "VP Marketing",
    company: "NexaCloud",
    initials: "AR",
    accent: "from-brand-400 to-brand-600",
  },
  {
    quote:
      "We had traffic but no leads. Climbix Marketing rebuilt our funnel from the ground up — content, SEO, and CRO working together. The change in pipeline quality was immediate.",
    name: "Daniel Okafor",
    role: "Founder & CEO",
    company: "LeadForge",
    initials: "DO",
    accent: "from-violet-400 to-violet-600",
  },
  {
    quote:
      "Their AI search optimization work got us cited in ChatGPT and Perplexity for our core category. That visibility is now driving a steady stream of high-intent demo requests.",
    name: "Mira Tanaka",
    role: "Head of Growth",
    company: "Quantly",
    initials: "MT",
    accent: "from-amber-400 to-amber-600",
  },
  {
    quote:
      "Strategic, transparent, and relentless about ROI. The dashboards actually tie activity to revenue — finally an agency that speaks the language of business outcomes.",
    name: "Samuel Park",
    role: "CMO",
    company: "BrightPath",
    initials: "SP",
    accent: "from-rose-400 to-rose-600",
  },
  {
    quote:
      "We cut our cost per acquisition by 38% in the first 90 days. The retargeting and CRO experiments paid for the entire engagement before the quarter ended.",
    name: "Lena Volkov",
    role: "Director of Demand Gen",
    company: "Pinnacle",
    initials: "LV",
    accent: "from-sky-400 to-sky-600",
  },
  {
    quote:
      "Best decision we made this year. Our organic revenue is up 95% YoY and we finally have a content engine that compounds instead of one-off campaigns.",
    name: "Omar Haddad",
    role: "Co-founder",
    company: "Skyline SaaS",
    initials: "OH",
    accent: "from-orange-400 to-orange-600",
  },
];

export type TestimonialData = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  featured: boolean;
  position: number;
};

const ACCENTS = [
  "from-brand-400 to-brand-600",
  "from-violet-400 to-violet-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-sky-400 to-sky-600",
  "from-orange-400 to-orange-600",
];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Testimonials({
  items,
  content,
}: {
  items?: TestimonialData[];
  content?: Partial<TestimonialsContent>;
}) {
  const defaults = SECTION_CONTENT_DEFAULTS.testimonials;
  const eyebrow = content?.eyebrow || defaults.eyebrow;
  const title = content?.title || defaults.title;
  const ratingNote = content?.ratingNote || defaults.ratingNote;

  const list: TestimonialData[] =
    items && items.length > 0
      ? items
      : TESTIMONIALS.map((t, i) => ({
          id: `static-${i}`,
          name: t.name,
          role: t.role,
          company: t.company,
          quote: t.quote,
          rating: 5,
          avatarUrl: null,
          featured: false,
          position: i * 10,
        }));

  return (
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
            {eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 text-3xl lg:text-5xl font-bold tracking-tight text-balance"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="size-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span>{ratingNote}</span>
          </motion.div>
        </div>

        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6 [column-fill:_balance]">
          {list.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="mb-5 lg:mb-6 break-inside-avoid rounded-2xl border border-border bg-card p-6 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all"
            >
              <Quote className="size-6 text-brand-500/40" />
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-3 flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star
                    key={s}
                    className={`size-3.5 ${
                      s < t.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`size-10 rounded-full bg-gradient-to-br ${
                    ACCENTS[i % ACCENTS.length]
                  } flex items-center justify-center text-sm font-bold text-white`}
                >
                  {initialsOf(t.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
