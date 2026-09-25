"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SECTION_CONTENT_DEFAULTS, type FaqContent } from "@/lib/section-content";

export function Faq({ content }: { content?: Partial<FaqContent> }) {
  const defaults = SECTION_CONTENT_DEFAULTS.faq;
  const eyebrow = content?.eyebrow || defaults.eyebrow;
  const title = content?.title || defaults.title;
  const intro = content?.intro || defaults.intro;
  const items =
    content?.items && content.items.length > 0
      ? content.items
      : defaults.items;

  return (
    <section
      id="faq"
      className="relative py-20 lg:py-28 bg-muted/30 border-y border-border scroll-mt-20"
    >
      <div className="mx-auto max-w-4xl container-px">
        <div className="text-center max-w-2xl mx-auto">
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
            className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-muted-foreground text-pretty"
          >
            {intro}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {items.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-card px-5 data-[state=open]:border-brand-500/40 data-[state=open]:shadow-md transition-all"
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
  );
}
