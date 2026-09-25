"use client";

import * as React from "react";

// Default content — used if DB has no saved value yet
export const DEFAULT_CONTENT: Record<string, string> = {
  "hero.headline": "Turn Search Visibility Into Revenue.",
  "hero.subheadline":
    "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
  "hero.cta": "Get Your Free Growth Strategy",
  "finalCta.headline": "Ready to grow your business?",
  "finalCta.subheading":
    "Let's build a marketing strategy designed around your business goals — engineered for visibility, qualified leads, and revenue that compounds.",
  "contact.email": "hello@climbixmarketing.com",
  "contact.phone": "+1 (555) 010-2026",
  "contact.address":
    "Remote-first · Serving clients in USA, UK, Canada, Australia, UAE & beyond",
  "social.linkedin": "https://linkedin.com/company/climbixmarketing",
  "social.twitter": "https://twitter.com/climbixmarketing",
  "stats.clients": "120+",
  "stats.countries": "18+",
  "stats.retention": "94%",
  "stats.revenue": "$24M+",
  "seo.defaultTitle": "Climbix Marketing — SEO, AI Search & Lead Generation Agency",
  "seo.defaultDescription":
    "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
};

type SiteContentContextValue = {
  content: Record<string, string>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SiteContentContext = React.createContext<SiteContentContextValue | null>(
  null
);

export function SiteContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = React.useState<Record<string, string>>(
    DEFAULT_CONTENT
  );
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/site-content");
      if (!res.ok) return;
      const data = await res.json();
      if (data.content && typeof data.content === "object") {
        // Merge DB content over defaults so we always have all keys
        setContent({ ...DEFAULT_CONTENT, ...data.content });
      }
    } catch (e) {
      console.error("Failed to fetch site content:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();

    // Real-time content refresh via BroadcastChannel
    // When admin saves content in another tab, this tab receives the update
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("climbix-content");
      channel.onmessage = (event) => {
        if (event.data?.type === "content-updated") {
          refresh();
        }
      };
    } catch {
      // BroadcastChannel not supported — polling fallback
      const interval = setInterval(refresh, 30000); // poll every 30s
      return () => clearInterval(interval);
    }

    return () => {
      channel?.close();
    };
  }, [refresh]);

  return (
    <SiteContentContext.Provider value={{ content, loading, refresh }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = React.useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}

// Helper hook for a single content key
export function useContent(key: string): string {
  const { content } = useSiteContent();
  return content[key] ?? DEFAULT_CONTENT[key] ?? "";
}
