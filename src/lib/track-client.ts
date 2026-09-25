// Client-side analytics helpers. Safe to import from "use client" components.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
    ttwq?: unknown[];
    ttq?: unknown[];
    pintrk?: ((cmd: string, ...args: unknown[]) => void) & { q?: unknown[] };
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  }
}

const CONSENT_KEY = "climbix-consent";
const CONSENT_COOKIE = "climbix_consent";

export type ConsentChoice = "all" | "necessary";

export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "all" || stored === "necessary") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, choice);
    const maxAge = choice === "all" ? 60 * 60 * 24 * 365 : 60 * 60 * 24 * 30;
    document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${maxAge}; samesite=Lax`;
    window.dispatchEvent(new CustomEvent("climbix-consent-change", { detail: choice }));
  } catch {
    /* ignore */
  }
}

/** Fire a conversion event to GA4 (gtag), dataLayer and Meta Pixel (fbq) if loaded. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (Array.isArray((window as Window).dataLayer)) {
      (window as Window).dataLayer!.push({ event: name, ...params });
    }
    if (typeof window.fbq === "function") window.fbq("track", "Lead", params);
  } catch {
    /* ignore */
  }
}

/** Read UTM params (+ gclid) from the current URL. */
export function getUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    const keys =
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"] as const;
    for (const k of keys) {
      const v = params.get(k);
      if (v) out[k] = v.slice(0, 200);
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** Normalized mapping of UTM params -> Lead fields. */
export function getUtmFields(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  const utm = getUtm();
  return {
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmTerm: utm.utm_term,
    utmContent: utm.utm_content,
  };
}