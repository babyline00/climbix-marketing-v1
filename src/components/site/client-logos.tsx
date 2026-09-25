"use client";

import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import {
  SECTION_CONTENT_DEFAULTS,
  type ItemsSectionContent,
} from "@/lib/section-content";

export type ClientLogoData = {
  id: string;
  name: string;
  imageUrl: string | null;
  website: string | null;
  position: number;
};

const DEFAULTS: ClientLogoData[] = [
  { id: "d1", name: "NexaCloud", imageUrl: null, website: null, position: 10 },
  { id: "d2", name: "Flowdesk", imageUrl: null, website: null, position: 20 },
  { id: "d3", name: "Quantly", imageUrl: null, website: null, position: 30 },
  { id: "d4", name: "Pinnacle", imageUrl: null, website: null, position: 40 },
  { id: "d5", name: "BrightPath", imageUrl: null, website: null, position: 50 },
  { id: "d6", name: "LeadForge", imageUrl: null, website: null, position: 60 },
  { id: "d7", name: "Skyline SaaS", imageUrl: null, website: null, position: 70 },
  { id: "d8", name: "Vertex", imageUrl: null, website: null, position: 80 },
];

export function ClientLogos({
  items,
  content,
}: {
  items?: ClientLogoData[];
  content?: Partial<ItemsSectionContent>;
}) {
  const list = items && items.length > 0 ? items : DEFAULTS;
  const intro = content?.intro || SECTION_CONTENT_DEFAULTS["client-logos"].intro;

  return (
    <section
      aria-label="Clients we work with"
      className="relative py-14 lg:py-16 bg-background border-b border-border overflow-hidden"
    >
      <div className="mx-auto max-w-7xl container-px">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center text-sm font-medium text-muted-foreground"
        >
          {intro}
        </motion.p>

        <div className="mt-8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex w-max marquee gap-6 lg:gap-8">
            {[...list, ...list].map((logo, i) => (
              <div
                key={`${logo.id}-${i}`}
                className="flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 min-w-[10rem] whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
              >
                {logo.imageUrl ? (
                  <Image
                    src={logo.imageUrl}
                    alt={logo.name}
                    width={140}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground tracking-tight">
                    {logo.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClientLogoPlaceholder() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <ImageOff className="size-4" />
    </div>
  );
}
