"use client";

import * as React from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/track-client";

/** setConsent dispatches this event, so the store notifies on every choice. */
function subscribeToConsent(onChange: () => void) {
  window.addEventListener("climbix-consent-change", onChange);
  return () => window.removeEventListener("climbix-consent-change", onChange);
}

export function ConsentBanner({
  message,
  acceptLabel,
  necessaryLabel,
}: {
  message: string;
  acceptLabel: string;
  necessaryLabel: string;
}) {
  const [dismissing, setDismissing] = React.useState(false);
  const [gone, setGone] = React.useState(false);

  // Read consent as an external store rather than seeding state from an effect.
  // The server snapshot reports "already consented", so the server render and
  // the first client render both hide the banner — a lazy useState initializer
  // would read localStorage during SSR and mismatch instead. The client
  // snapshot is adopted right after hydration, so the banner still appears
  // without the extra render pass the old effect caused.
  const hasConsent = React.useSyncExternalStore(
    subscribeToConsent,
    () => getConsent() !== null,
    () => true
  );

  const visible = !hasConsent && !gone;

  const choose = (choice: "all" | "necessary") => {
    setConsent(choice);
    setDismissing(true);
    window.setTimeout(() => setGone(true), 200);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[120] p-4 sm:p-6"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div
        className={`mx-auto max-w-3xl rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl shadow-black/20 backdrop-blur transition-all duration-200 ${
          dismissing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-inset ring-brand-500/30">
            <Cookie className="size-5 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => choose("necessary")}
            >
              {necessaryLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => choose("all")}
            >
              {acceptLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}