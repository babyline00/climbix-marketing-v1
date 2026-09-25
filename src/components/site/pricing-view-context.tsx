"use client";

import * as React from "react";

type PricingViewContextValue = {
  isPricingActive: boolean;
  openPricing: () => void;
  closePricing: () => void;
};

const PricingViewContext = React.createContext<PricingViewContextValue | null>(
  null
);

export function PricingViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPricingActive, setIsPricingActive] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsPricingActive(window.location.hash === "#pricing");
    };

    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const openPricing = React.useCallback(() => {
    window.history.pushState(null, "", "#pricing");
    setIsPricingActive(true);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const closePricing = React.useCallback(() => {
    window.history.pushState(null, "", "#top");
    setIsPricingActive(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <PricingViewContext.Provider
      value={{ isPricingActive, openPricing, closePricing }}
    >
      {children}
    </PricingViewContext.Provider>
  );
}

export function usePricingView() {
  const ctx = React.useContext(PricingViewContext);
  if (!ctx) {
    throw new Error("usePricingView must be used within PricingViewProvider");
  }
  return ctx;
}
