import * as React from "react";
import { cn } from "@/lib/utils";
import {
  splitWordmark,
  type BrandSettings,
} from "@/lib/brand";

/**
 * Brand lockup shared by the header, mobile menu, footer and the admin
 * live preview, so all four stay visually identical by construction.
 */

/** The default gradient tile + chart glyph used when no logo is uploaded. */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h6v6" />
      </svg>
    </div>
  );
}

/**
 * Logo image when one is uploaded, otherwise the default glyph.
 * `alt` is empty when the wordmark sits next to it (decorative), because the
 * visible text already names the brand.
 */
export function BrandLogo({
  brand,
  decorative,
  className,
}: {
  brand: BrandSettings;
  decorative?: boolean;
  className?: string;
}) {
  if (!brand.logoUrl) return <BrandGlyph className={className} />;

  return (
    <img
      src={brand.logoUrl}
      alt={decorative ? "" : brand.logoAlt || brand.siteName}
      className={cn(
        "h-9 max-h-9 w-auto max-w-[10rem] shrink-0 object-contain",
        className
      )}
    />
  );
}

/** Wordmark with the gradient accent on its tail. */
export function BrandWordmark({
  brand,
  className,
}: {
  brand: BrandSettings;
  className?: string;
}) {
  const { base, accent } = splitWordmark(brand.siteName);
  return (
    <span className={className}>
      {base}
      {accent && <span className="gradient-text">{accent}</span>}
    </span>
  );
}

/** Full lockup: logo + optional wordmark. Used in header and admin preview. */
export function BrandLockup({
  brand,
  showName = brand.showName,
  className,
  wordmarkClassName,
  hover = true,
}: {
  brand: BrandSettings;
  showName?: boolean;
  className?: string;
  wordmarkClassName?: string;
  hover?: boolean;
}) {
  const nameVisible = showName && brand.siteName.trim().length > 0;

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="relative inline-flex">
        <BrandLogo brand={brand} decorative={nameVisible} />
        {hover && (
          <span className="absolute -inset-1 -z-10 rounded-xl bg-brand-500/30 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
        )}
      </span>
      {nameVisible && (
        <BrandWordmark
          brand={brand}
          className={cn(
            "text-[1.35rem] font-bold leading-none tracking-[-0.04em] sm:text-[1.45rem]",
            hover &&
              "transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none",
            wordmarkClassName
          )}
        />
      )}
    </span>
  );
}
