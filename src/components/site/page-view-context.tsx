"use client";

import * as React from "react";

type PageViewContextValue = {
  isPageActive: boolean;
  pageSlug: string | null;
  openPage: (slug: string) => void;
  closePage: () => void;
};

const PageViewContext = React.createContext<PageViewContextValue | null>(null);

export function PageViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageSlug, setPageSlug] = React.useState<string | null>(null);
  const [isPageActive, setIsPageActive] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#page/")) {
        const slug = hash.slice("#page/".length);
        setIsPageActive(true);
        setPageSlug(slug);
      } else {
        setIsPageActive(false);
        setPageSlug(null);
      }
    };

    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const openPage = React.useCallback((slug: string) => {
    window.history.pushState(null, "", `#page/${slug}`);
    setIsPageActive(true);
    setPageSlug(slug);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const closePage = React.useCallback(() => {
    window.history.pushState(null, "", "#top");
    setIsPageActive(false);
    setPageSlug(null);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <PageViewContext.Provider
      value={{ isPageActive, pageSlug, openPage, closePage }}
    >
      {children}
    </PageViewContext.Provider>
  );
}

export function usePageView() {
  const ctx = React.useContext(PageViewContext);
  if (!ctx) {
    throw new Error("usePageView must be used within PageViewProvider");
  }
  return ctx;
}
