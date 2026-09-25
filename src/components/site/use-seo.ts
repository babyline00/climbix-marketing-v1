"use client";

import * as React from "react";

// Hook to update document title and meta tags on client side
export function useSEO(seo: {
  title?: string;
  description?: string;
  ogImage?: string | null;
} | null) {
  React.useEffect(() => {
    if (!seo) return;

    if (seo.title) {
      document.title = seo.title;
    }

    if (seo.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", seo.description);
    }

    if (seo.ogImage) {
      // Only set OG image if it's a URL (not a gradient class)
      if (seo.ogImage.startsWith("http") || seo.ogImage.startsWith("/")) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement("meta");
          ogImage.setAttribute("property", "og:image");
          document.head.appendChild(ogImage);
        }
        ogImage.setAttribute("content", seo.ogImage);
      }
    }

    // Update og:title and og:description
    if (seo.title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", seo.title);
    }

    if (seo.description) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute("content", seo.description);
    }
  }, [seo]);
}
