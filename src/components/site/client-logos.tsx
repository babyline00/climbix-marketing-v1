"use client";

import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import {
  SECTION_CONTENT_DEFAULTS,
  clampImageHeight,
  resolveShowText,
  type ImageStripContent,
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
  content?: Partial<ImageStripContent>;
}) {
  const list = items && items.length > 0 ? items : DEFAULTS;
  const intro = content?.intro || SECTION_CONTENT_DEFAULTS["client-logos"].intro;

  // Admin-chosen uniform height. Width stays intrinsic (object-contain), so a
  // tall narrow mark and a wide wordmark both sit on one visual baseline.
  const size = clampImageHeight(
    content?.imageHeight,
    clampImageHeight(
      SECTION_CONTENT_DEFAULTS["client-logos"].imageHeight,
      32
    )
  );
  // next/image still needs a width/height box; scale the 4:1 placeholder by the
  // same factor so the intrinsic ratio never fights the rendered size.
  const boxWidth = Math.round(size * 4);

  // A client logo's text *is* its fallback rendering — there is no separate
  // caption under the mark. "Marks only" therefore drops entries with no image,
  // since a blank tile is worse than a name. If that would empty the strip
  // (every logo still text-only), we keep the names rather than hide the
  // section entirely — the admin almost certainly has images left to upload.
  const showText = resolveShowText(content?.showText);
  const marksOnly = list.filter((l) => Boolean(l.imageUrl));
  const visible = showText || marksOnly.length === 0 ? list : marksOnly;

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
            {[...visible, ...visible].map((logo, i) => {
              // The list is duplicated for a seamless loop — the second pass is
              // decorative, so it must not be announced twice by screen readers.
              const isRepeat = i >= visible.length;
              const inner = logo.imageUrl ? (
                // The mark itself is the content here — there is no separate
                // caption under it, so the name stays as the alt text.
                <Image
                  src={logo.imageUrl}
                  alt={isRepeat ? "" : logo.name}
                  width={boxWidth}
                  height={size}
                  style={{ height: size }}
                  className="w-auto max-w-[14rem] object-contain"
                />
              ) : (
                // Text-fallback tile, only reachable while showText is on.
                <span
                  style={{ fontSize: Math.max(14, Math.round(size * 0.6)) }}
                  className="font-bold leading-none text-muted-foreground tracking-tight"
                >
                  {logo.name}
                </span>
              );

              if (!logo.website) {
                return (
                  <div
                    key={`${logo.id}-${i}`}
                    aria-hidden={isRepeat || undefined}
                    className="flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 min-w-[10rem] whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {inner}
                  </div>
                );
              }

              const external = /^https?:\/\//i.test(logo.website);
              return (
                <a
                  key={`${logo.id}-${i}`}
                  href={logo.website}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  tabIndex={isRepeat ? -1 : undefined}
                  aria-hidden={isRepeat || undefined}
                  className="flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 min-w-[10rem] whitespace-nowrap opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-opacity"
                >
                  {inner}
                </a>
              );
            })}
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
