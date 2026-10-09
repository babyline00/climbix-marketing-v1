"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Zap,
  Star,
  BadgeCheck,
  ThumbsUp,
  Clock,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  SECTION_CONTENT_DEFAULTS,
  clampImageHeight,
  resolveShowText,
  type ImageStripContent,
} from "@/lib/section-content";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type TrustBadgeData = {
  id: string;
  label: string;
  icon: string;
  imageUrl?: string | null;
  position: number;
};

// Icon key registry — admin picks one of these keys per badge
export const TRUST_BADGE_ICONS: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  award: Award,
  zap: Zap,
  star: Star,
  "badge-check": BadgeCheck,
  "thumbs-up": ThumbsUp,
  clock: Clock,
  globe: Globe,
};

const DEFAULTS: TrustBadgeData[] = [
  { id: "d1", label: "Google Partner", icon: "badge-check", position: 10 },
  { id: "d2", label: "500+ Campaigns Delivered", icon: "award", position: 20 },
  { id: "d3", label: "Results in 90 Days", icon: "zap", position: 30 },
  { id: "d4", label: "4.9/5 Client Rating", icon: "star", position: 40 },
];

export function TrustBadges({
  items,
  content,
}: {
  items?: TrustBadgeData[];
  content?: Partial<ImageStripContent>;
}) {
  const list =
    items && items.length > 0
      ? items
      : DEFAULTS;

  // One size for the whole strip, chosen in the admin, so a mix of 500px
  // partner marks and 160px emblems still lines up.
  const size = clampImageHeight(
    content?.imageHeight,
    clampImageHeight(
      SECTION_CONTENT_DEFAULTS["trust-badges"].imageHeight,
      20
    )
  );

  // Admin can hide the labels and show bare marks. The text stays in the DOM as
  // screen-reader-only, because a badge reduced to an unlabelled icon (or an
  // image with empty alt) would otherwise carry no accessible name at all.
  const showText = resolveShowText(content?.showText);

  return (
    <section
      aria-label="Trust badges"
      className="relative border-b border-border bg-muted/40 py-8"
    >
      <div className="mx-auto max-w-7xl container-px">
        <ul className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
          {list.map((b, i) => {
            const Icon = TRUST_BADGE_ICONS[b.icon] || ShieldCheck;
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm"
              >
                {b.imageUrl ? (
                  <Image
                    src={b.imageUrl}
                    alt=""
                    width={size}
                    height={size}
                    style={{ width: size, height: size }}
                    className="shrink-0 object-contain"
                  />
                ) : (
                  <Icon
                    style={{ width: size, height: size }}
                    className="shrink-0 text-brand-600"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "text-sm font-medium text-foreground/80",
                    !showText && "sr-only"
                  )}
                >
                  {b.label}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
