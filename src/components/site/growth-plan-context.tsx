"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GrowthPlanForm } from "@/components/site/growth-plan-form";
import { useScheduler } from "@/components/site/scheduler-context";

export type GrowthPlanConfig = {
  source?: string;
  title?: string;
  description?: string;
};

type GrowthPlanContextValue = {
  openGrowthPlan: (config?: GrowthPlanConfig) => void;
  closeGrowthPlan: () => void;
};

const GrowthPlanContext = React.createContext<GrowthPlanContextValue | null>(null);

/**
 * Dialog wrapper around the growth-plan form.
 *
 * Kept separate from the form itself so the form can be dropped into a page
 * (or embedded test) without the dialog chrome.
 */
export function GrowthPlanDialog({
  open,
  onOpenChange,
  config,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: GrowthPlanConfig;
}) {
  // The header CTA used to open the scheduler directly. Routing it through the
  // growth plan would otherwise strand the booking flow, so it stays reachable
  // from inside the dialog.
  const { openScheduler } = useScheduler();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{config?.title ?? "Start your growth plan"}</DialogTitle>
          <DialogDescription>
            {config?.description ??
              "Tell us about your business and we will prepare a growth strategy for you."}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 sm:p-9">
          <GrowthPlanForm source={config?.source ?? "growth-plan"} />
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              openScheduler({ source: config?.source ?? "growth-plan" });
            }}
            className="mt-8 w-full border-t border-border pt-5 text-center text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Prefer to talk first? Book a free 30-minute call
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GrowthPlanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<GrowthPlanConfig | undefined>(undefined);

  const openGrowthPlan = React.useCallback((cfg?: GrowthPlanConfig) => {
    setConfig(cfg);
    setOpen(true);
  }, []);

  const closeGrowthPlan = React.useCallback(() => setOpen(false), []);

  return (
    <GrowthPlanContext.Provider value={{ openGrowthPlan, closeGrowthPlan }}>
      {children}
      <GrowthPlanDialog open={open} onOpenChange={setOpen} config={config} />
    </GrowthPlanContext.Provider>
  );
}

export function useGrowthPlan() {
  const ctx = React.useContext(GrowthPlanContext);
  if (!ctx) {
    throw new Error("useGrowthPlan must be used within GrowthPlanProvider");
  }
  return ctx;
}