import "server-only";
import { prisma } from "./db-alias";
import { unstable_cache } from "next/cache";
import { resolveBrand, DEFAULT_BRAND, type BrandSettings } from "./brand";

// ─────────────────────────────────────────────────────────────
// Settings — typed key/value configuration stored in the DB
// Defaults apply automatically until a value is overridden.
// ─────────────────────────────────────────────────────────────

export const SETTING_DEFAULTS: Record<string, string> = {
  // General
  "general.appName": "Climbix Marketing",
  // Public contact details. Rendered by the [email] / [phone] shortcodes on
  // custom HTML pages, so leaving them blank is a valid state.
  "general.email": "hello@climbixmarketing.com",
  "general.phone": "",
  "general.timezone": "Asia/Karachi",
  "general.currency": "USD",
  "general.dateFormat": "MMM D, YYYY",
  "general.language": "en",
  // Branding
  "branding.primaryColor": "#FF6B2C",
  "branding.darkColor": "#080d19",
  "branding.logoUrl": "",
  "branding.faviconUrl": "",
  "branding.siteName": DEFAULT_BRAND.siteName,
  "branding.logoAlt": "",
  "branding.showName": "true",
  // Security
  "security.sessionDays": "7",
  "security.maxLoginAttempts": "8",
  "security.passwordMinLength": "8",
  // Notifications
  "notifications.inAppEnabled": "true",
  "notifications.emailEnabled": "false",
  "notifications.whatsappEnabled": "false",
  "notifications.telegramEnabled": "false",
  // Email
  "email.senderName": "Climbix Marketing",
  "email.senderEmail": "hello@climbixmarketing.com",
  "email.smtpHost": "",
  "email.smtpPort": "587",
  "email.smtpUser": "",
  "email.smtpPassword": "",
  // SEO
  "seo.siteTitle": "Climbix Marketing — SEO, AI Search & Lead Generation",
  "seo.siteDescription":
    "Climbix Marketing helps brands rank on Google and AI search engines with data-driven SEO, GEO and lead generation.",
  "seo.keywords": "seo, ai search optimization, lead generation, digital marketing",
  "seo.ogImage": "",
  // AI Chat Agent (voice assistant widget)
  "agent.enabled": "true",
  "agent.name": "Climbix Assistant",
  "agent.welcome":
    "Hi there! I'm Climbix Assistant. Ask me anything about our SEO, AI search and lead-generation services — type below or tap the mic and just talk.",
  "agent.systemPrompt": "",
  "agent.provider": "", // "" = Z.ai/GLM (built-in) | openai | deepseek | xai | openrouter | custom
  "agent.model": "",
  "agent.providerBaseUrl": "", // custom OpenAI-compatible endpoint base URL (used when provider = custom)
  "agent.providerApiKey": "", // API key for the selected provider (leave empty to fall back to Z.ai)
  "agent.quickReplies":
    "What services do you offer?\nHow much does SEO cost?\nWhat is AI Search Optimization?\nBook a strategy call",
  "agent.ttsEnabled": "true",
  "agent.ttsVoiceId": "",
  "agent.ttsModelId": "",
  // Voice provider: "" = ElevenLabs server TTS | browser | livekit | pipecat | callkit
  "agent.voiceProvider": "",
  // Browser voice (speechSynthesis) — exact voice name; empty = browser default
  "agent.browserVoiceName": "",
  // LiveKit Agents (real-time voice) — server/token URL, no key needed on-site
  "agent.livekitServerUrl": "",
  "agent.livekitTokenUrl": "",
  // Pipecat (real-time voice via an agent server)
  "agent.pipecatServerUrl": "",
  "agent.pipecatApiKey": "",
  // CallKit (telephony bridge — E.164 number hosted by the provider)
  "agent.callkitNumber": "",
  // API keys (third-party services)
  "apis.elevenlabsApiKey": "",
  // Analytics & tracking tags
  "integrations.ga4Id": "",
  "integrations.gtmId": "",
  "integrations.fbpPixelId": "",
  "integrations.clarityId": "",
  "integrations.hotjarSiteId": "",
  "integrations.tiktokPixelId": "",
  "integrations.linkedinPartnerId": "",
  "integrations.pinterestTagId": "",
  // Cookie consent & privacy
  "tracking.consentEnabled": "true",
  "tracking.consentMode": "true", // GA4 consent mode (default denied, updates on accept)
  "tracking.consentMessage":
    "We use cookies and similar technologies to improve your experience, analyze traffic and personalize marketing.",
  "tracking.consentAcceptLabel": "Accept all",
  "tracking.consentNecessaryLabel": "Necessary only",
  // Server-side event tracking (Meta Conversions API + GA4 Measurement Protocol)
  "integrations.metaCapiToken": "",
  "integrations.ga4ApiSecret": "",
  // Google Search Console (service account reporting)
  "integrations.gscServiceAccountEmail": "",
  "integrations.gscPrivateKey": "",
  "integrations.gscSiteUrl": "",
  // Lead alerts (webhooks fired on new lead)
  "alerts.leadCreatedEnabled": "false",
  "alerts.slackWebhookUrl": "",
  "alerts.discordWebhookUrl": "",
  "alerts.telegramBotToken": "",
  "alerts.telegramChatId": "",
  // Custom code injection (advanced)
  "code.head": "",
  "code.footer": "",
};

/** Per-key max value length (overrides the generic 2000-char cap) */
export const VALUE_MAX_LENGTHS: Record<string, number> = {
  // Brand fields render inside the header lockup, which is width-constrained.
  "branding.siteName": 40,
  "branding.logoAlt": 120,
  "general.appName": 80,
  "general.email": 120,
  "general.phone": 40,
  "agent.welcome": 500,
  "agent.systemPrompt": 4000,
  "agent.provider": 20,
  "agent.model": 80,
  "agent.providerBaseUrl": 300,
  "agent.providerApiKey": 500,
  "agent.voiceProvider": 30,
  "agent.browserVoiceName": 200,
  "agent.livekitServerUrl": 300,
  "agent.livekitTokenUrl": 300,
  "agent.pipecatServerUrl": 300,
  "agent.pipecatApiKey": 500,
  "agent.callkitNumber": 20,
  "agent.quickReplies": 1000,
  "agent.name": 60,
  "integrations.ga4Id": 32,
  "integrations.gtmId": 32,
  "integrations.fbpPixelId": 24,
  "integrations.clarityId": 24,
  "integrations.hotjarSiteId": 16,
  "integrations.tiktokPixelId": 24,
  "integrations.linkedinPartnerId": 16,
  "integrations.pinterestTagId": 20,
  "tracking.consentMessage": 600,
  "tracking.consentAcceptLabel": 60,
  "tracking.consentNecessaryLabel": 60,
  "integrations.metaCapiToken": 500,
  "integrations.ga4ApiSecret": 120,
  "integrations.gscServiceAccountEmail": 200,
  "integrations.gscPrivateKey": 5000,
  "integrations.gscSiteUrl": 300,
  "alerts.slackWebhookUrl": 500,
  "alerts.discordWebhookUrl": 500,
  "alerts.telegramBotToken": 200,
  "alerts.telegramChatId": 40,
  "code.head": 20000,
  "code.footer": 20000,
};

/** Allowed values for enum-like settings (empty string = default) */
export const SETTING_ENUMS: Record<string, Set<string>> = {
  "agent.provider": new Set([
    "",
    "openai", // OpenAI / ChatGPT
    "deepseek", // DeepSeek (deepseek-chat / deepseek-reasoner)
    "xai", // Grok (x.ai)
    "openrouter", // OpenRouter — any model via one key
    "custom", // any OpenAI-compatible endpoint
  ]),
  "agent.ttsModelId": new Set([
    "",
    "eleven_multilingual_v2",
    "eleven_turbo_v2_5",
    "eleven_flash_v2_5",
  ]),
  "agent.voiceProvider": new Set([
    "", // "" = ElevenLabs server TTS (default)
    "browser", // Web Speech API only — no API key needed
    "livekit", // LiveKit Agents real-time voice
    "pipecat", // Pipecat real-time voice
    "callkit", // CallKit telephony bridge
  ]),
};

/** Keys whose values are secrets — masked on read, ignored on write when masked */
export const SECRET_KEYS = new Set([
  "email.smtpPassword",
  "apis.elevenlabsApiKey",
  "agent.providerApiKey",
  "agent.pipecatApiKey",
  "integrations.metaCapiToken",
  "integrations.ga4ApiSecret",
  "integrations.gscPrivateKey",
  "alerts.slackWebhookUrl",
  "alerts.discordWebhookUrl",
  "alerts.telegramBotToken",
]);
export const VALUE_MASK = "________MASKED________";

/** Keys that are on/off switches stored as "true"/"false" */
export const BOOLEAN_KEYS = new Set([
  "branding.showName",
  "notifications.inAppEnabled",
  "notifications.emailEnabled",
  "notifications.whatsappEnabled",
  "notifications.telegramEnabled",
  "agent.enabled",
  "agent.ttsEnabled",
  "tracking.consentEnabled",
  "tracking.consentMode",
  "alerts.leadCreatedEnabled",
]);

/** Valid key whitelist for writes */
export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS);

/** Load all settings merged over defaults */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const merged = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    if (row.key in SETTING_DEFAULTS) merged[row.key] = row.value;
  }
  return merged;
}

export interface AgentRuntimeConfig {
  enabled: boolean;
  name: string;
  welcome: string;
  quickReplies: string[];
  systemPrompt: string;
  provider: string;
  model: string;
  providerBaseUrl: string;
  providerApiKey: string;
  ttsEnabled: boolean;
  ttsVoiceId: string;
  ttsModelId: string;
  elevenlabsApiKey: string;
  voiceProvider: string;
  browserVoiceName: string;
  livekitServerUrl: string;
  livekitTokenUrl: string;
  pipecatServerUrl: string;
  pipecatApiKey: string;
  callkitNumber: string;
}

/** Effective AI-agent runtime config resolved from DB settings + env fallbacks */
export async function getAgentConfig(): Promise<AgentRuntimeConfig> {
  const s = await getSettings();
  return {
    enabled: s["agent.enabled"] !== "false",
    name: s["agent.name"].trim() || "Climbix Assistant",
    welcome: s["agent.welcome"].trim(),
    quickReplies: s["agent.quickReplies"]
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean)
      .slice(0, 6),
    systemPrompt: s["agent.systemPrompt"].trim(),
    provider: s["agent.provider"].trim(),
    model: s["agent.model"].trim(),
    providerBaseUrl: s["agent.providerBaseUrl"].trim(),
    providerApiKey:
      s["agent.providerApiKey"].trim() || process.env.AGENT_PROVIDER_API_KEY || "",
    ttsEnabled: s["agent.ttsEnabled"] !== "false",
    ttsVoiceId:
      s["agent.ttsVoiceId"].trim() || process.env.ELEVENLABS_VOICE_ID || "hpp4J3VqNfWAUOO0d1Us",
    ttsModelId:
      s["agent.ttsModelId"].trim() || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    elevenlabsApiKey: s["apis.elevenlabsApiKey"].trim() || process.env.ELEVENLABS_API_KEY || "",
    voiceProvider: s["agent.voiceProvider"].trim(),
    browserVoiceName: s["agent.browserVoiceName"].trim(),
    livekitServerUrl: s["agent.livekitServerUrl"].trim(),
    livekitTokenUrl: s["agent.livekitTokenUrl"].trim(),
    pipecatServerUrl: s["agent.pipecatServerUrl"].trim(),
    pipecatApiKey: s["agent.pipecatApiKey"].trim(),
    callkitNumber: s["agent.callkitNumber"].trim(),
  };
}

/** Load one setting with default fallback */
export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key] ?? "";
}

/** Persist a batch of settings in a transaction (values pre-validated) */
export async function setSettings(values: Record<string, string>): Promise<number> {
  const entries = Object.entries(values).filter(([k]) => SETTING_KEYS.includes(k));
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
  return entries.length;
}

/** Cached copy of settings for server components (public site rendering).
 *  Wrapped so pages can stay statically prerendered (ISR) while scripts stay
 *  in sync with admin edits within the revalidate window. */
export const SETTINGS_CACHE_TAG = "climbix-public-settings";

export const getSettingsCached = unstable_cache(async () => getSettings(), [SETTINGS_CACHE_TAG], {
  revalidate: 60,
  tags: [SETTINGS_CACHE_TAG],
});

/** Resolved brand identity (logo, wordmark, favicon) for the public header. */
export async function getBrand(): Promise<BrandSettings> {
  return resolveBrand(await getSettingsCached());
}
