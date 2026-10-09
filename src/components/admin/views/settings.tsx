"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  Settings2,
  Palette,
  ShieldCheck,
  Mail,
  Bell,
  Search,
  RotateCcw,
  Bot,
  KeyRound,
  PlayCircle,
  Volume2,
  Square,
  TrendingUp,
  Code2,
  Cookie,
  Link2,
  BarChart3,
  Send,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { can, type SessionUser } from "@/lib/rbac";
import { RedirectsManager } from "./redirects-manager";
import {
  ELEVENLABS_VOICES,
  VOICE_GENDER_LABELS,
  VOICE_PREVIEW_TEXT,
  voiceNameOf,
} from "@/lib/voices";

type Settings = Record<string, string>;

const SECTIONS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "email", label: "Email", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "agent", label: "AI Agent", icon: Bot },
  { id: "apis", label: "APIs", icon: KeyRound },
  { id: "seo", label: "SEO", icon: Search },
  { id: "analytics", label: "Analytics & Tags", icon: TrendingUp },
  { id: "consent", label: "Cookies & Consent", icon: Cookie },
  { id: "alerts", label: "Lead Alerts", icon: Megaphone },
  { id: "gsc", label: "Search Console", icon: BarChart3 },
  { id: "redirects", label: "URL Redirects", icon: Link2 },
  { id: "code", label: "Custom Code", icon: Code2 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Field spec per section — key, label, input type, hint */
const FIELDS: Record<
  SectionId,
  {
    key: string;
    label: string;
    type?: string;
    hint?: string;
    boolean?: boolean;
    wide?: boolean;
    code?: boolean;
    rows?: number;
    select?: { value: string; label: string }[];
    showWhen?: { key: string; in: string[] };
  }[]
> = {
  general: [
    { key: "general.appName", label: "Application name" },
    { key: "general.email", label: "Public contact email", hint: "Used by the [email] shortcode" },
    { key: "general.phone", label: "Public contact phone", hint: "Used by the [phone] shortcode" },
    { key: "general.timezone", label: "Timezone", hint: "IANA name, e.g. Asia/Karachi" },
    { key: "general.currency", label: "Currency", hint: "ISO code, e.g. USD, PKR" },
    { key: "general.dateFormat", label: "Date format", hint: "e.g. MMM D, YYYY" },
    { key: "general.language", label: "Language", hint: "e.g. en, ur" },
  ],
  branding: [
    { key: "branding.primaryColor", label: "Primary color", type: "text", hint: "Hex, e.g. #FF6B2C" },
    { key: "branding.darkColor", label: "Dark color", type: "text", hint: "Hex, e.g. #080d19" },
    { key: "branding.logoUrl", label: "Logo URL", hint: "/logo.svg or https://…" },
    { key: "branding.faviconUrl", label: "Favicon URL", hint: "/favicon.ico or https://…" },
  ],
  security: [
    { key: "security.sessionDays", label: "Session lifetime (days)", type: "number", hint: "1–90 days" },
    { key: "security.maxLoginAttempts", label: "Max login attempts / minute", type: "number", hint: "3–100 per IP" },
    { key: "security.passwordMinLength", label: "Minimum password length", type: "number", hint: "6–64 characters" },
  ],
  email: [
    { key: "email.senderName", label: "Sender name" },
    { key: "email.senderEmail", label: "Sender email" },
    { key: "email.smtpHost", label: "SMTP host", hint: "e.g. smtp.gmail.com (optional)" },
    { key: "email.smtpPort", label: "SMTP port", hint: "e.g. 587" },
    { key: "email.smtpUser", label: "SMTP username" },
    { key: "email.smtpPassword", label: "SMTP password", type: "password", hint: "Stored securely — leave masked to keep" },
  ],
  notifications: [
    { key: "notifications.inAppEnabled", label: "In-app notifications", boolean: true },
    { key: "notifications.emailEnabled", label: "Email notifications", boolean: true, hint: "Requires SMTP configuration" },
    { key: "notifications.whatsappEnabled", label: "WhatsApp (future)", boolean: true },
    { key: "notifications.telegramEnabled", label: "Telegram (future)", boolean: true },
  ],
  agent: [
    { key: "agent.enabled", label: "Enable voice agent on site", boolean: true, hint: "Hides the floating assistant everywhere when off" },
    { key: "agent.name", label: "Agent name", hint: "Shown in the chat header (max 60 chars)" },
    { key: "agent.provider", label: "LLM provider", select: [
      { value: "", label: "Z.ai (GLM) — built-in" },
      { value: "openai", label: "OpenAI (ChatGPT)" },
      { value: "deepseek", label: "DeepSeek" },
      { value: "xai", label: "Grok (xAI)" },
      { value: "openrouter", label: "OpenRouter (any model)" },
      { value: "custom", label: "Custom OpenAI-compatible" },
    ], hint: "Adds an API key below to switch engines; falls back to GLM if the key fails" },
    { key: "agent.model", label: "Model ID", hint: "e.g. gpt-4o, deepseek-chat, grok-3, openai/gpt-4o-mini, glm-4.5 — blank = provider default" },
    { key: "agent.providerApiKey", label: "Provider API key", type: "password", wide: true, hint: "Stored securely — required to use a non-GLM provider. Leave masked to keep current value" },
    { key: "agent.providerBaseUrl", label: "Custom base URL", wide: true, hint: "Only for Custom provider — the /v1 root of an OpenAI-compatible endpoint, e.g. https://my-proxy.example/v1" },
    { key: "agent.ttsEnabled", label: "Speak replies aloud", boolean: true, hint: "ElevenLabs voice with browser-speech fallback" },
    { key: "agent.browserVoiceName", label: "Browser voice", type: "text", showWhen: { key: "agent.voiceProvider", in: ["browser"] }, wide: true, hint: "Exact name from your browser\u2019s speechSynthesis.getVoices() \u2014 leave empty for the browser default. Common picks:\n\u2022 en-US voices (e.g. Google US English, Microsoft Aria Online) appear on Windows/Chrome/Edge.\nTIP: open the widget, use the in-widget voice list to copy the exact name." },
    { key: "agent.voiceProvider", label: "Voice provider", select: [
      { value: "", label: "ElevenLabs — server TTS (default)" },
      { value: "browser", label: "Browser speech — no API key needed" },
      { value: "livekit", label: "LiveKit Agents — real-time voice" },
      { value: "pipecat", label: "Pipecat — real-time voice" },
      { value: "callkit", label: "CallKit — phone bridge" },
    ], hint: "ElevenLabs and browser both work today. LiveKit / Pipecat / CallKit stream audio from your own agent server — set up the matching fields below." },
    { key: "agent.livekitServerUrl", label: "LiveKit server URL", showWhen: { key: "agent.voiceProvider", in: ["livekit"] }, hint: "e.g. wss://my-agent.livekit.cloud — the LiveKit WebSocket server" },
    { key: "agent.livekitTokenUrl", label: "LiveKit token URL", showWhen: { key: "agent.voiceProvider", in: ["livekit"] }, hint: "e.g. https://api.example.com/livekit/token — your server endpoint that mints room tokens" },
    { key: "agent.pipecatServerUrl", label: "Pipecat server URL", showWhen: { key: "agent.voiceProvider", in: ["pipecat"] }, hint: "e.g. wss://agent.example.com — your pipecat WebSocket agent endpoint" },
    { key: "agent.pipecatApiKey", label: "Pipecat API key", type: "password", showWhen: { key: "agent.voiceProvider", in: ["pipecat"] }, wide: true, hint: "Shared secret your pipecat server verifies — stored securely. Leave masked to keep" },
    { key: "agent.callkitNumber", label: "CallKit number", showWhen: { key: "agent.voiceProvider", in: ["callkit"] }, hint: "International phone number your provider hosts, e.g. +14155552671" },
    { key: "agent.welcome", label: "Welcome message", type: "textarea", wide: true, hint: "First message visitors see (max 500 chars)" },
    { key: "agent.quickReplies", label: "Quick reply chips", type: "textarea", wide: true, hint: "One suggestion per line, up to 6 — shown above the input" },
    { key: "agent.systemPrompt", label: "System prompt override", type: "textarea", wide: true, hint: "Optional. Replaces the built-in Climbix prompt (max 4000 chars)" },
    { key: "agent.ttsModelId", label: "TTS model", select: [
      { value: "", label: "Default (eleven_multilingual_v2)" },
      { value: "eleven_multilingual_v2", label: "Multilingual v2 — best quality" },
      { value: "eleven_turbo_v2_5", label: "Turbo v2.5 — low latency" },
      { value: "eleven_flash_v2_5", label: "Flash v2.5 — fastest" },
    ] },
  ],
  apis: [
    { key: "apis.elevenlabsApiKey", label: "ElevenLabs API key", type: "password", wide: true, hint: "Overrides the server .env key when set — leave masked to keep current value" },
  ],
  seo: [
    { key: "seo.siteTitle", label: "Site title" },
    { key: "seo.siteDescription", label: "Meta description", type: "textarea" },
    { key: "seo.keywords", label: "Keywords", hint: "Comma separated" },
    { key: "seo.ogImage", label: "Social share image URL", hint: "/uploads/… or https://…" },
  ],
  analytics: [
    { key: "integrations.ga4Id", label: "Google Analytics (GA4) ID", hint: "e.g. G-AB12CD34EF" },
    { key: "integrations.gtmId", label: "Google Tag Manager ID", hint: "e.g. GTM-ABC1234 — loads alongside GA4 when set" },
    { key: "integrations.fbpPixelId", label: "Meta Pixel ID", hint: "Numeric ID from Meta Events Manager" },
    { key: "integrations.clarityId", label: "Microsoft Clarity ID", hint: "Project ID from clarity.microsoft.com" },
    { key: "integrations.hotjarSiteId", label: "Hotjar Site ID", hint: "Found in Hotjar → Site settings" },
    { key: "integrations.tiktokPixelId", label: "TikTok Pixel ID", hint: "e.g. C9RRE3BC77UABL6KQ8E0" },
    { key: "integrations.linkedinPartnerId", label: "LinkedIn Insight Tag ID", hint: "Numeric Partner ID from LinkedIn Campaign Manager" },
    { key: "integrations.pinterestTagId", label: "Pinterest Tag ID", hint: "Numeric tag ID from Pinterest Tag Manager" },
    { key: "integrations.metaCapiToken", label: "Meta Conversions API token", type: "password", hint: "System user access token for server-side Lead events — stored securely" },
    { key: "integrations.ga4ApiSecret", label: "GA4 Measurement Protocol secret", type: "password", hint: "Found at GA4 → Admin → Data streams → your stream → Measurement Protocol API secrets" },
  ],
  consent: [
    { key: "tracking.consentEnabled", label: "Show cookie consent banner", boolean: true, hint: "Displays a small consent dialog to first-time visitors" },
    { key: "tracking.consentMode", label: "GA4 consent mode v2", boolean: true, hint: "Signals consent state to GA4; tags only load after acceptance" },
    { key: "tracking.consentMessage", label: "Banner message", type: "textarea", wide: true, hint: "Shown in the consent dialog (keep it short)" },
    { key: "tracking.consentAcceptLabel", label: "Accept button label", hint: "e.g. Accept all" },
    { key: "tracking.consentNecessaryLabel", label: "Necessary-only button label", hint: "e.g. Necessary only" },
  ],
  alerts: [
    { key: "alerts.leadCreatedEnabled", label: "Enable lead alerts", boolean: true, hint: "Sends a message to every configured channel when a new lead arrives" },
    { key: "alerts.slackWebhookUrl", label: "Slack webhook URL", type: "password", wide: true, hint: "Incoming Webhook URL from your Slack app — stored securely" },
    { key: "alerts.discordWebhookUrl", label: "Discord webhook URL", type: "password", wide: true, hint: "Create in Discord channel → Integrations → Webhooks — stored securely" },
    { key: "alerts.telegramBotToken", label: "Telegram bot token", type: "password", hint: "From @BotFather, e.g. 123456:ABC… — stored securely" },
    { key: "alerts.telegramChatId", label: "Telegram chat ID", hint: "Numeric chat/channel ID to post into, e.g. -1001234567890" },
  ],
  gsc: [
    { key: "integrations.gscServiceAccountEmail", label: "Service account email", hint: "e.g. climbix-reporting@PROJECT.iam.gserviceaccount.com" },
    { key: "integrations.gscPrivateKey", label: "Service account private key", type: "password", wide: true, hint: "BEGIN PRIVATE KEY PEM from the JSON key file — stored securely" },
    { key: "integrations.gscSiteUrl", label: "Protected site URL", hint: "Property in Search Console, e.g. https://climbixmarketing.com/ or sc-domain:example.com" },
  ],
  redirects: [],
  code: [
    { key: "code.head", label: "Custom <head> code", type: "textarea", wide: true, code: true, hint: "HTML/JS injected at the top of every page (e.g. verification tags, extra meta, tracking scripts). No <script> wrapper needed — paste the full snippet." },
    { key: "code.footer", label: "Custom footer code", type: "textarea", wide: true, code: true, hint: "HTML/JS injected just before the closing </body> of every page (e.g. live-chat widgets, exit popups)." },
  ],
};

export function AdminSettings({ user }: { user: SessionUser }) {
  const [settings, setSettings] = React.useState<Settings>({});
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<SectionId | null>(null);
  const [dirty, setDirty] = React.useState<Set<SectionId>>(new Set());
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [playingVoice, setPlayingVoice] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const canView = can(user.permissions, "settings.view");
  const canManage = can(user.permissions, "settings.manage");

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings ?? {});
      } else {
        setError(data.error ?? "Failed to load settings");
        setLoadError(true);
      }
    } catch {
      setError("Unable to load settings. Please retry.");
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // `loading` is only read below the !canView early return, so when access is
  // denied there is nothing to clear — load() owns the flag. Resetting it here
  // was dead work that also cost an extra render.
  React.useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  if (!canView) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <ShieldCheck className="size-10 mx-auto text-slate-300 mb-3" />
        <h3 className="font-semibold text-slate-700">Settings are restricted</h3>
        <p className="text-sm text-slate-500 mt-1">
          You do not have permission to view system settings. Contact a Super Admin.
        </p>
      </div>
    );
  }

  const setValue = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const markDirty = (section: SectionId) => {
    setDirty((prev) => new Set(prev).add(section));
  };

  const saveSection = async (section: SectionId) => {
    setSaving(section);
    setError(null);
    setSuccess(null);
    try {
      const values: Record<string, string> = {};
      for (const field of FIELDS[section]) {
        if (field.showWhen && !field.showWhen.in.includes(settings[field.showWhen.key] ?? "")) {
          continue;
        }
        values[field.key] = settings[field.key] ?? "";
      }
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings ?? {});
        setSuccess(`Saved ${section} settings`);
        setDirty((prev) => {
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
        window.setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error ?? "Failed to save settings");
      }
    } catch {
      setError("Failed to save settings. Please retry.");
    } finally {
      setSaving(null);
    }
  };

  const resetSection = (section: SectionId) => {
    load().then(() => {
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
    });
  };

  // Live-check the agent brain with the currently SAVED configuration
  // (new unsaved edits must be saved first for this to reflect them).
  const testAgent = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Reply with exactly: Agent online" }],
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.reply) {
        setTestResult({ ok: true, text: `“${String(data.reply).slice(0, 120)}”` });
      } else {
        setTestResult({ ok: false, text: data?.error ?? `Request failed (${res.status})` });
      }
    } catch {
      setTestResult({ ok: false, text: "Network error — could not reach the agent" });
    } finally {
      setTesting(false);
    }
  };

  const testAlerts = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/alerts/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestResult({ ok: true, text: `Test alert sent to: ${(data.sent ?? []).join(", ")}` });
      } else {
        setTestResult({ ok: false, text: data.error ?? `Request failed (${res.status})` });
      }
    } catch {
      setTestResult({ ok: false, text: "Network error — could not reach the alerts service" });
    } finally {
      setTesting(false);
    }
  };

  /** Preview the currently selected voice. Uses saved settings via the live
   *  TTS endpoint (same path the site widget uses); falls back to the
   *  browser's speechSynthesis so admins can still audition genders/models. */
  const testVoice = async () => {
    if (playingVoice) {
      audioRef.current?.pause();
      audioRef.current = null;
      window.speechSynthesis?.cancel();
      setPlayingVoice(false);
      return;
    }
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setPlayingVoice(true);
    try {
      const res = await fetch("/api/agent/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: VOICE_PREVIEW_TEXT }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          setPlayingVoice(false);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          setPlayingVoice(false);
        };
        await audio.play();
        return;
      }
      // 503/502 → not configured or synthesis failed — use browser speech.
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(VOICE_PREVIEW_TEXT);
        utter.rate = 1.02;
        utter.onend = () => setPlayingVoice(false);
        utter.onerror = () => setPlayingVoice(false);
        window.speechSynthesis.speak(utter);
        return;
      }
      throw new Error("no speech engine");
    } catch {
      setPlayingVoice(false);
      const data = await fetch("/api/agent/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: VOICE_PREVIEW_TEXT }),
      })
        .then((r) => r.json().catch(() => ({})))
        .catch(() => null);
      setTestResult({
        ok: false,
        text: (data?.error as string) || "No voice engine available — add an ElevenLabs API key to preview real voices.",
      });
    }
  };

  const renderField = (
    field: (typeof FIELDS)[SectionId][number],
    section: SectionId
  ) => {
    if (field.boolean) {
      return (
        <div key={field.key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
          <div>
            <Label className="cursor-pointer">{field.label}</Label>
            {field.hint && <p className="text-xs text-slate-400 mt-0.5">{field.hint}</p>}
          </div>
          <Switch
            checked={(settings[field.key] ?? "false") === "true"}
            disabled={!canManage || saving !== null}
            onCheckedChange={(checked) => {
              setValue(field.key, String(checked));
              markDirty(section);
            }}
          />
        </div>
      );
    }
    return (
      <div key={field.key} className={`space-y-1.5 ${field.wide ? "md:col-span-2" : ""}`}>
        <Label htmlFor={field.key}>{field.label}</Label>
        {field.select ? (
          <select
            id={field.key}
            value={settings[field.key] ?? ""}
            disabled={!canManage || saving !== null}
            onChange={(e) => {
              setValue(field.key, e.target.value);
              markDirty(section);
            }}
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-60"
          >
            {field.select.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            id={field.key}
            value={settings[field.key] ?? ""}
            disabled={!canManage}
            onChange={(e) => {
              setValue(field.key, e.target.value);
              markDirty(section);
            }}
            rows={field.rows ?? (field.code ? 8 : 3)}
            spellCheck={false}
            className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-60 ${
              field.code ? "font-mono text-xs leading-relaxed" : ""
            }`}
          />
        ) : (
          <Input
            id={field.key}
            type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
            value={settings[field.key] ?? ""}
            disabled={!canManage || saving !== null}
            onChange={(e) => {
              setValue(field.key, e.target.value);
              markDirty(section);
            }}
          />
        )}
        {field.hint && <p className="text-xs text-slate-400">{field.hint}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-72 rounded-xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status banners */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">×</button>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 bg-white border border-slate-200 p-1 rounded-xl">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="gap-1.5 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-700">
              <s.icon className="size-3.5" />
              {s.label}
              {dirty.has(s.id) && <span className="size-1.5 rounded-full bg-amber-500" title="Unsaved changes" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((s) => (
          <TabsContent key={s.id} value={s.id}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{s.label} settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {canManage
                      ? "Changes apply across the admin system after saving."
                      : "Read-only — you do not have permission to edit settings."}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    {s.id === "agent" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void testAgent()}
                        disabled={saving !== null || testing}
                      >
                        {testing ? (
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                        ) : (
                          <PlayCircle className="size-3.5 mr-1" />
                        )}
                        Test agent
                      </Button>
                    )}
                    {s.id === "agent" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void testVoice()}
                        disabled={saving !== null}
                        className={playingVoice ? "bg-brand-500/10 text-brand-700" : ""}
                      >
                        {playingVoice ? (
                          <Square className="size-3.5 mr-1" />
                        ) : (
                          <Volume2 className="size-3.5 mr-1" />
                        )}
                        {playingVoice ? "Stop" : "Play voice"}
                      </Button>
                    )}
                    {s.id === "alerts" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void testAlerts()}
                        disabled={saving !== null || testing}
                      >
                        {testing ? (
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="size-3.5 mr-1" />
                        )}
                        Send test alert
                      </Button>
                    )}
                    {s.id !== "redirects" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => resetSection(s.id)} disabled={saving !== null}>
                          <RotateCcw className="size-3.5 mr-1" /> Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveSection(s.id)}
                          disabled={saving !== null}
                          className="bg-brand-600 hover:bg-brand-700 text-white"
                        >
                          {saving === s.id ? (
                            <Loader2 className="size-3.5 mr-1 animate-spin" />
                          ) : (
                            <Save className="size-3.5 mr-1" />
                          )}
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {s.id === "agent" &&
                  (settings["agent.voiceProvider"] ?? "") !== "livekit" &&
                  (settings["agent.voiceProvider"] ?? "") !== "pipecat" &&
                  (settings["agent.voiceProvider"] ?? "") !== "callkit" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="agent.ttsVoiceId">Voice (ElevenLabs)</Label>
                    <select
                      id="agent.ttsVoiceId"
                      value={settings["agent.ttsVoiceId"] ?? ""}
                      disabled={!canManage || saving !== null}
                      onChange={(e) => {
                        setValue("agent.ttsVoiceId", e.target.value);
                        markDirty(s.id);
                      }}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-60"
                    >
                      <option value="">Default voice</option>
                      {(["female", "male", "neutral"] as const).map((gender) => (
                        <optgroup key={gender} label={VOICE_GENDER_LABELS[gender]}>
                          {ELEVENLABS_VOICES.filter((v) => v.gender === gender).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      {(settings["agent.ttsVoiceId"] ?? "") &&
                        !ELEVENLABS_VOICES.some((v) => v.id === settings["agent.ttsVoiceId"]) && (
                          <option value={settings["agent.ttsVoiceId"] ?? ""}>
                            Custom: {settings["agent.ttsVoiceId"]}
                          </option>
                        )}
                    </select>
                    <p className="text-xs text-slate-400">
                      Selected: {voiceNameOf(settings["agent.ttsVoiceId"] ?? "")} — saved with the
                      rest of this tab. Use the field below to paste any custom ElevenLabs voice ID
                      (e.g. from voice.sh / your library).
                    </p>
                    <Input
                      placeholder="Custom ElevenLabs voice ID (optional)"
                      value={
                        settings["agent.ttsVoiceId"] &&
                        !ELEVENLABS_VOICES.some((v) => v.id === settings["agent.ttsVoiceId"])
                          ? settings["agent.ttsVoiceId"]
                          : ""
                      }
                      disabled={!canManage || saving !== null}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const isCustom =
                          settings["agent.ttsVoiceId"] &&
                          !ELEVENLABS_VOICES.some((v) => v.id === settings["agent.ttsVoiceId"]);
                        if (val) {
                          setValue("agent.ttsVoiceId", val);
                          markDirty(s.id);
                        } else if (isCustom) {
                          setValue("agent.ttsVoiceId", "");
                          markDirty(s.id);
                        }
                      }}
                    />
                  </div>
                )}
                {FIELDS[s.id]
                  .filter(
                    (f) =>
                      !f.showWhen ||
                      f.showWhen.in.includes(settings[f.showWhen.key] ?? "")
                  )
                  .map((f) => renderField(f, s.id))}
              </div>
              {s.id === "redirects" && (
                <div className="mt-2">
                  <RedirectsManager />
                </div>
              )}
              {(s.id === "agent" || s.id === "alerts") && testResult && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-2.5 text-sm ${
                    testResult.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  <span className="font-medium">{testResult.ok ? "Success: " : "Failed: "}</span>
                  {testResult.text}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
