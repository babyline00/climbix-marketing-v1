import "server-only";
import { createHash } from "node:crypto";
import { getSettings } from "./settings";

export interface ServerLeadEvent {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  service?: string | null;
}

const GA4_MP_BASE = "https://www.google-analytics.com/mp/collect";
const META_CAPI_BASE = "https://graph.facebook.com/v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Fire Google Analytics 4 Measurement Protocol event (best-effort, non-blocking). */
async function sendGao4(
  ga4Id: string,
  apiSecret: string,
  lead: ServerLeadEvent,
  eventName: string
) {
  const params = new URLSearchParams({ measurement_id: ga4Id, api_secret: apiSecret });
  const payload = {
    client_id: lead.id,
    events: [
      {
        name: eventName,
        params: {
          event_source: "website",
          lead_id: lead.id,
          email: lead.email,
          source: lead.source || "",
          service: lead.service || "",
          company: lead.company || "",
        },
      },
    ],
  };
  await fetch(`${GA4_MP_BASE}?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Fire Meta Conversions API event (best-effort, non-blocking). */
async function sendMetaCapi(
  pixelId: string,
  accessToken: string,
  lead: ServerLeadEvent
) {
  const userData: Record<string, string> = {
    em: sha256(lead.email),
    client_user_agent: "climbix-server",
  };
  if (lead.phone) userData.ph = sha256(lead.phone);
  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: "https://climbixmarketing.com",
        user_data: userData,
        custom_data: {
          lead_id: lead.id,
          source: lead.source || "",
          service: lead.service || "",
          company: lead.company || "",
          email: lead.email,
        },
      },
    ],
  };
  await fetch(`${META_CAPI_BASE}/${pixelId}/events?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Send server-side conversion events for a newly-created lead.
 * Runs all configured integrations in parallel; individual failures are
 * swallowed so lead creation is never affected.
 */
export async function fireServerEvents(lead: ServerLeadEvent) {
  const s = await getSettings();
  const jobs: Promise<unknown>[] = [];

  const ga4Id = s["integrations.ga4Id"];
  const ga4Secret = s["integrations.ga4ApiSecret"];
  if (ga4Id && ga4Secret) {
    jobs.push(
      sendGao4(ga4Id, ga4Secret, lead, "generate_lead").catch((e) =>
        console.error("GA4 MP event failed:", e)
      )
    );
  }

  const pixelId = s["integrations.fbpPixelId"];
  const capiToken = s["integrations.metaCapiToken"];
  if (pixelId && capiToken) {
    jobs.push(
      sendMetaCapi(pixelId, capiToken, lead).catch((e) =>
        console.error("Meta CAPI event failed:", e)
      )
    );
  }

  await Promise.allSettled(jobs);
}