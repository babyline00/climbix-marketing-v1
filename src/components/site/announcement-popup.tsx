"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SitePopupItem } from "@/lib/header";

const STORAGE_KEY = "climbix-popup-dismissed-at";

/**
 * Admin-managed announcement / promo popup.
 * Rendered on public views only (never in the admin panel).
 * - Auto-opens `delaySeconds` after page load when active.
 * - Respects per-visitor dismissal memory for `showEveryDays` days.
 */
export function AnnouncementPopup({ popup }: { popup: SitePopupItem | null }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!popup) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const dismissedAt = new Date(raw).getTime();
        const reShowAfterMs = Math.max(0, popup.showEveryDays || 0) * 86_400_000;
        if (Date.now() - dismissedAt < reShowAfterMs) {
          return; // visitor dismissed it recently — stay quiet
        }
      }
    } catch {
      // localStorage unavailable — still show
    }

    timer = setTimeout(
      () => setOpen(true),
      Math.max(0, popup.delaySeconds || 0) * 1000
    );

    return () => clearTimeout(timer);
  }, [popup]);

  /** Close + remember dismissal so the popup does not nag the visitor. */
  const dismiss = React.useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
  }, []);

  if (!popup) return null;

  const isExternalCta = (popup.ctaHref ?? "").startsWith("http");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl" aria-describedby={undefined}>
        {popup.imageUrl && (
          <Image
            src={popup.imageUrl}
            alt={popup.title}
            width={640}
            height={352}
            className="h-44 w-full object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        )}

        {popup.customHtml && (
          <iframe
            title="Announcement content"
            srcDoc={popup.customHtml}
            sandbox=""
            className="block h-44 w-full border-0 bg-white"
          />
        )}

        <div className="p-6 pt-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="size-4.5 text-white" />
            </div>
            {popup.badge && (
              <span className="inline-flex items-center rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {popup.badge}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              {popup.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {popup.message}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {popup.ctaLabel && popup.ctaHref && (
              <Button
                asChild
                onClick={dismiss}
                className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25"
              >
                {isExternalCta ? (
                  <a
                    href={popup.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {popup.ctaLabel}
                  </a>
                ) : (
                  <Link href={popup.ctaHref}>{popup.ctaLabel}</Link>
                )}
              </Button>
            )}
            <Button variant="ghost" onClick={dismiss} className="text-muted-foreground">
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
