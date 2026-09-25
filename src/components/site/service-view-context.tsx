"use client";

import * as React from "react";

type ServiceViewContextValue = {
  selectedService: string | null;
  setSelectedService: (slug: string | null) => void;
};

const ServiceViewContext = React.createContext<ServiceViewContextValue | null>(
  null
);

export function ServiceViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedService, setSelectedService] =
    React.useState<string | null>(null);

  // Sync with URL hash so back button and deep links work
  React.useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#service-(.+)$/);
    if (match) {
      setSelectedService(match[1]);
    }

    const onHashChange = () => {
      const h = window.location.hash;
      const m = h.match(/^#service-(.+)$/);
      if (m) {
        setSelectedService(m[1]);
      } else if (h === "" || h === "#top") {
        setSelectedService(null);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = React.useCallback((slug: string | null) => {
    setSelectedService(slug);
    if (slug) {
      window.history.pushState(null, "", `#service-${slug}`);
    } else if (window.location.hash.startsWith("#service-")) {
      window.history.pushState(null, "", "#top");
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <ServiceViewContext.Provider
      value={{ selectedService, setSelectedService: select }}
    >
      {children}
    </ServiceViewContext.Provider>
  );
}

export function useServiceView() {
  const ctx = React.useContext(ServiceViewContext);
  if (!ctx) {
    throw new Error("useServiceView must be used within ServiceViewProvider");
  }
  return ctx;
}
