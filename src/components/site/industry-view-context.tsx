"use client";

import * as React from "react";
import type { IndustrySlug } from "@/data/industries";

type IndustryViewContextValue = {
  selectedIndustry: IndustrySlug | null;
  setSelectedIndustry: (slug: IndustrySlug | null) => void;
};

const IndustryViewContext = React.createContext<IndustryViewContextValue | null>(
  null
);

export function IndustryViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedIndustry, setSelectedIndustryState] =
    React.useState<IndustrySlug | null>(null);

  // Sync with URL hash so back button and deep links work
  React.useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#industry-(.+)$/);
    if (match) {
      setSelectedIndustryState(match[1] as IndustrySlug);
    }

    const onHashChange = () => {
      const h = window.location.hash;
      const m = h.match(/^#industry-(.+)$/);
      if (m) {
        setSelectedIndustryState(m[1] as IndustrySlug);
      } else if (h === "" || h === "#top" || h.startsWith("#service-")) {
        setSelectedIndustryState(null);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setSelectedIndustry = React.useCallback(
    (slug: IndustrySlug | null) => {
      setSelectedIndustryState(slug);
      if (slug) {
        window.history.pushState(null, "", `#industry-${slug}`);
      } else if (window.location.hash.startsWith("#industry-")) {
        window.history.pushState(null, "", "#top");
      }
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    []
  );

  return (
    <IndustryViewContext.Provider
      value={{ selectedIndustry, setSelectedIndustry }}
    >
      {children}
    </IndustryViewContext.Provider>
  );
}

export function useIndustryView() {
  const ctx = React.useContext(IndustryViewContext);
  if (!ctx) {
    throw new Error(
      "useIndustryView must be used within IndustryViewProvider"
    );
  }
  return ctx;
}
