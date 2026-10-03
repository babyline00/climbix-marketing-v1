"use client";

import * as React from "react";

/**
 * Registers the service worker that caches static assets for repeat visits.
 *
 * Registration is deferred until after load so it never competes with the
 * first render, and skipped outside production so local development always sees
 * the code just edited rather than a cached build.
 */
export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // A failed registration must not break the page; caching is an
        // enhancement, and everything works without it.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
