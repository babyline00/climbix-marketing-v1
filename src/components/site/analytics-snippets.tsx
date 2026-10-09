"use client";

import * as React from "react";
import { getConsent } from "@/lib/track-client";

/** Client-side tags loader — gated by consent. Tags load only after the visitor
 *  accepts all cookies (server renders nothing, keeping SSR static). */
export interface TagConfig {
  ga4Id?: string;
  gtmId?: string;
  fbpPixelId?: string;
  clarityId?: string;
  hotjarSiteId?: string;
  tiktokPixelId?: string;
  linkedinPartnerId?: string;
  pinterestTagId?: string;
  consentMode: boolean;
}

const LOADED_KEY = "climbix-tags-loaded";

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
}

function runInline(fn: (...args: any[]) => void, ...args: unknown[]) {
  const fnAny = fn as (...a: any[]) => void;
  const el = document.createElement("script");
  el.textContent = `(${fnAny.toString()})(${args.map((a) => JSON.stringify(a)).join(",")});`;
  document.head.appendChild(el);
  el.remove();
}

function loadTags(cfg: TagConfig) {
  if (sessionStorage.getItem(LOADED_KEY)) return;
  sessionStorage.setItem(LOADED_KEY, "1");

  if (!window.dataLayer) window.dataLayer = [];

  if (cfg.ga4Id) {
    const id = cfg.ga4Id;
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
    runInline(
      (gid: string, consentMode: boolean) => {
        const w = window as any;
        w.dataLayer = w.dataLayer || [];
        w.gtag = function () {
          // Vendored gtag snippet: the queue consumer reads the raw Arguments
          // object, so a rest-parameter rewrite would change the payload.
          // eslint-disable-next-line prefer-rest-params
          w.dataLayer.push(arguments);
        };
        if (consentMode) {
          w.gtag("consent", "default", {
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            analytics_storage: "denied",
          });
        }
        w.gtag("js", new Date());
        w.gtag("config", gid);
        if (consentMode) {
          w.gtag("consent", "update", {
            ad_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
            analytics_storage: "granted",
          });
        }
      },
      id,
      cfg.consentMode
    );
  }

  if (cfg.gtmId) {
    const id = cfg.gtmId;
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${id}&l=dataLayer`);
    runInline(() => {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    });
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${id}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);
  }

  if (cfg.fbpPixelId) {
    const pixel = cfg.fbpPixelId;
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    runInline((pid: string) => {
      const f = window as any;
      if (f.fbq) return;
      f.fbq = function () {
        // Vendored Meta pixel snippet. Both rewrites are unsafe here: the
        // explicit .apply(f.fbq, …) is what binds `this` to fbq when
        // callMethod runs, and the ternary is a statement, not an expression.
        /* eslint-disable-next-line prefer-rest-params, prefer-spread, @typescript-eslint/no-unused-expressions -- load-bearing vendor snippet */
        f.fbq.callMethod ? f.fbq.callMethod.apply(f.fbq, arguments) : f.fbq.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = f.fbq;
      f.fbq.push = f.fbq;
      f.fbq.loaded = true;
      f.fbq.version = "2.0";
      f.fbq.queue = [];
      f.fbq("init", pid);
      f.fbq("track", "PageView");
    }, pixel);
  }

  if (cfg.clarityId) {
    const cid = cfg.clarityId;
    runInline((id: string) => {
      const c = window as any;
      c.clarity = c.clarity || function () {
        // Vendored Microsoft Clarity snippet — clarityq entries are consumed as
        // Arguments objects, so a rest-parameter rewrite changes the shape.
        // eslint-disable-next-line prefer-rest-params
        (c.clarityq = c.clarityq || []).push(arguments);
      };
    }, cid);
    loadScript(`https://www.clarity.ms/tag/${cid}`);
  }

  if (cfg.hotjarSiteId) {
    const hjId = Number(cfg.hotjarSiteId);
    runInline((n: number) => {
      const h = window as any;
      h.hj = h.hj || function () {
        // Vendored Hotjar snippet — hjq entries are consumed as Arguments
        // objects, so a rest-parameter rewrite changes the shape.
        // eslint-disable-next-line prefer-rest-params
        (h.hjq = h.hjq || []).push(arguments);
      };
      h._hjSettings = { hjid: n, hjsv: 6 };
    }, hjId);
    loadScript(`https://static.hotjar.com/c/hotjar-${hjId}.js?sv=6`);
  }

  if (cfg.tiktokPixelId) {
    const pid = cfg.tiktokPixelId;
    runInline((id: string) => {
      const w = window as any;
      w.ttq = w.ttq || [];
      w.ttq.push(["init", id]);
      w.ttq.push(["track", "PageView"]);
    }, pid);
    loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${pid}`);
  }

  if (cfg.linkedinPartnerId) {
    const pid = cfg.linkedinPartnerId;
    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
    runInline((id: string) => {
      const w = window as any;
      w._linkedin_partner_id = id;
      w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || [];
      w._linkedin_data_partner_ids.push(id);
    }, pid);
  }

  if (cfg.pinterestTagId) {
    const pid = cfg.pinterestTagId;
    runInline((id: string) => {
      const w = window as any;
      w.pintrk = w.pintrk || function () {
        // Vendored Pinterest tag snippet — pintrk.q entries are consumed as
        // Arguments objects, so a rest-parameter rewrite changes the shape.
        // eslint-disable-next-line prefer-rest-params
        (w.pintrk.q = w.pintrk.q || []).push(arguments);
      };
      w.pintrk("load", id);
      w.pintrk("page");
    }, pid);
    loadScript("https://s.pinimg.com/ct/core.js");
  }
}

export function AnalyticsSnippets({ config }: { config: TagConfig }) {
  React.useEffect(() => {
    if (getConsent() === "all") {
      loadTags(config);
      return;
    }
    const onConsent = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "all") loadTags(config);
    };
    window.addEventListener("climbix-consent-change", onConsent);
    return () => window.removeEventListener("climbix-consent-change", onConsent);
  }, [config]);

  return null;
}