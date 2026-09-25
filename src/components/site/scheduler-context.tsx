"use client";

import * as React from "react";
import { MeetingScheduler, type SchedulerConfig } from "./meeting-scheduler";

type SchedulerContextValue = {
  openScheduler: (config?: SchedulerConfig) => void;
  closeScheduler: () => void;
};

const SchedulerContext = React.createContext<SchedulerContextValue | null>(
  null
);

export function SchedulerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<SchedulerConfig | undefined>(
    undefined
  );

  const openScheduler = React.useCallback((cfg?: SchedulerConfig) => {
    setConfig(cfg);
    setOpen(true);
  }, []);

  const closeScheduler = React.useCallback(() => setOpen(false), []);

  return (
    <SchedulerContext.Provider value={{ openScheduler, closeScheduler }}>
      {children}
      <MeetingScheduler
        open={open}
        onOpenChange={setOpen}
        config={config}
      />
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  const ctx = React.useContext(SchedulerContext);
  if (!ctx) {
    throw new Error("useScheduler must be used within SchedulerProvider");
  }
  return ctx;
}
