"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SiteContentProvider } from "@/components/site/site-content-context";
import { SchedulerProvider } from "@/components/site/scheduler-context";
import { GrowthPlanProvider } from "@/components/site/growth-plan-context";

/**
 * Global client providers shared by every page (home + all subpages).
 * Scheduler powers the strategy-call dialog; GrowthPlan powers the multi-step
 * lead form; SiteContent feeds live key-value copy (contact info, socials,
 * stats) to header/footer/CTAs.
 */
export function SiteProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Live-refresh when admins edit content in another tab
  React.useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("climbix-content");
      channel.onmessage = (event) => {
        if (
          event.data?.type === "homepage-updated" ||
          event.data?.type === "content-updated"
        ) {
          router.refresh();
        }
      };
    } catch {
      // BroadcastChannel not supported
    }
    return () => channel?.close();
  }, [router]);

  return (
    <SiteContentProvider>
      <SchedulerProvider>
        <GrowthPlanProvider>{children}</GrowthPlanProvider>
      </SchedulerProvider>
    </SiteContentProvider>
  );
}
