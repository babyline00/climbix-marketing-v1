import { NextRequest, NextResponse } from "next/server";
import { isResponse, logActivity, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db-alias";
import {
  BOOLEAN_KEYS,
  SECRET_KEYS,
  SETTING_ENUMS,
  SETTING_KEYS,
  VALUE_MASK,
  VALUE_MAX_LENGTHS,
  getSettings,
  setSettings,
} from "@/lib/settings";

export const runtime = "nodejs";

// GET /api/settings — all settings (secrets masked)
export async function GET(req: NextRequest) {
  const session = await requirePermission(req, "settings.view");
  if (isResponse(session)) return session;

  try {
    const settings = await getSettings();
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      masked[key] = SECRET_KEYS.has(key) && value ? VALUE_MASK : value;
    }
    return NextResponse.json({ settings: masked });
  } catch (e) {
    console.error("GET /api/settings error", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PUT /api/settings — batch update { values: { key: value } }
export async function PUT(req: NextRequest) {
  const session = await requirePermission(req, "settings.manage");
  if (isResponse(session)) return session;

  try {
    const body = await req.json();
    const values = body?.values;
    if (!values || typeof values !== "object" || Array.isArray(values)) {
      return NextResponse.json({ error: "Invalid payload — expected { values }" }, { status: 400 });
    }

    const clean: Record<string, string> = {};
    for (const [key, raw] of Object.entries(values)) {
      if (!SETTING_KEYS.includes(key)) {
        return NextResponse.json({ error: `Unknown setting key "${key}"` }, { status: 400 });
      }
      const value = String(raw ?? "");

      // Never overwrite secrets with the mask value; empty string clears the secret
      if (SECRET_KEYS.has(key) && value === VALUE_MASK) continue;

      // Enum-like keys (chat/TTS model selection)
      if (SETTING_ENUMS[key] && !SETTING_ENUMS[key].has(value)) {
        return NextResponse.json(
          { error: `Invalid value for "${key}"` },
          { status: 400 }
        );
      }

      // Boolean on/off switches
      if (BOOLEAN_KEYS.has(key) && value && !"true|false".split("|").includes(value)) {
        return NextResponse.json(
          { error: `${key} must be "true" or "false"` },
          { status: 400 }
        );
      }

      // ElevenLabs voice ID: 20-char alphanumeric identifier
      if (key === "agent.ttsVoiceId" && value && !/^[A-Za-z0-9]{16,40}$/.test(value)) {
        return NextResponse.json(
          { error: "Voice ID must be the alphanumeric ElevenLabs voice identifier" },
          { status: 400 }
        );
      }

      // LiveKit server / token URLs
      if (["agent.livekitServerUrl", "agent.livekitTokenUrl"].includes(key) && value) {
        if (!/^(wss|https):\/\/\S+$/.test(value)) {
          return NextResponse.json(
            { error: `${key.split(".")[2]} must be a wss:// or https:// URL` },
            { status: 400 }
          );
        }
      }

      // Pipecat server URL
      if (key === "agent.pipecatServerUrl" && value) {
        if (!/^(wss|https):\/\/\S+$/.test(value)) {
          return NextResponse.json(
            { error: "Pipecat server must be a wss:// or https:// URL" },
            { status: 400 }
          );
        }
      }

      // Pipecat API key
      if (key === "agent.pipecatApiKey" && value && !/^[A-Za-z0-9_\-]{10,500}$/.test(value)) {
        return NextResponse.json({ error: "Pipecat API key looks invalid" }, { status: 400 });
      }

      // CallKit E.164 phone number
      if (key === "agent.callkitNumber" && value && !/^\+[1-9][0-9]{6,14}$/.test(value)) {
        return NextResponse.json(
          { error: "CallKit number must be an international number, e.g. +14155552671" },
          { status: 400 }
        );
      }

      // ElevenLabs API key format
      if (key === "apis.elevenlabsApiKey" && value && !/^[A-Za-z0-9_\-]{20,120}$/.test(value)) {
        return NextResponse.json(
          { error: "ElevenLabs API key looks invalid" },
          { status: 400 }
        );
      }

      // Agent LLM provider config
      if (key === "agent.providerBaseUrl" && value) {
        if (!/^https?:\/\/\S+$/.test(value)) {
          return NextResponse.json(
            { error: "Provider base URL must be an http(s) URL, e.g. https://api.openai.com/v1" },
            { status: 400 }
          );
        }
      }
      if (key === "agent.model" && value) {
        // Model IDs are provider-specific free text; basic sanity only.
        if (!/^[\w.\-:/]+$/.test(value)) {
          return NextResponse.json(
            { error: "Model ID may only contain letters, numbers, dots, dashes, colons and slashes" },
            { status: 400 }
          );
        }
      }

      // Per-key length caps (fall back to generic 2000)
      const maxLen = VALUE_MAX_LENGTHS[key] ?? 2000;
      if (value.length > maxLen) {
        return NextResponse.json(
          { error: `Value for "${key}" too long (max ${maxLen})` },
          { status: 400 }
        );
      }

      // Validate typed fields
      if (key === "security.sessionDays" || key === "security.maxLoginAttempts") {
        const n = Number(value);
        const min = key === "security.sessionDays" ? 1 : 3;
        const max = key === "security.sessionDays" ? 90 : 100;
        if (!Number.isInteger(n) || n < min || n > max) {
          return NextResponse.json(
            { error: `${key.split(".")[1]} must be an integer between ${min} and ${max}` },
            { status: 400 }
          );
        }
      }
      if (key === "security.passwordMinLength") {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 6 || n > 64) {
          return NextResponse.json(
            { error: "passwordMinLength must be an integer between 6 and 64" },
            { status: 400 }
          );
        }
      }
      if (key === "email.senderEmail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return NextResponse.json({ error: "Invalid sender email address" }, { status: 400 });
      }
      if (key === "email.smtpPort" && value && !/^\d{1,5}$/.test(value)) {
        return NextResponse.json({ error: "SMTP port must be numeric" }, { status: 400 });
      }
      if (["branding.primaryColor", "branding.darkColor"].includes(key) && value) {
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
          return NextResponse.json({ error: "Brand colors must be hex like #FF6B2C" }, { status: 400 });
        }
      }
      if (["branding.logoUrl", "branding.faviconUrl", "seo.ogImage"].includes(key) && value) {
        if (!value.startsWith("/") && !/^https?:\/\//.test(value)) {
          return NextResponse.json(
            { error: "Image URLs must start with / or http(s)://" },
            { status: 400 }
          );
        }
      }

      // Tracking tag formats
      const ID_PATTERNS: Record<string, { re: RegExp; label: string }> = {
        "integrations.ga4Id": { re: /^G-[A-Z0-9]{4,12}$/, label: "GA4 ID (e.g. G-AB12CD34EF)" },
        "integrations.gtmId": { re: /^GTM-[A-Z0-9]{4,10}$/, label: "GTM container ID (e.g. GTM-ABC1234)" },
        "integrations.fbpPixelId": { re: /^[0-9]{8,16}$/, label: "Meta Pixel ID (numeric)" },
        "integrations.clarityId": { re: /^[0-9]{8,12}$/, label: "Clarity project ID (numeric)" },
        "integrations.hotjarSiteId": { re: /^[0-9]{4,10}$/, label: "Hotjar site ID (numeric)" },
        "integrations.tiktokPixelId": { re: /^[A-Z0-9]{15,25}$/, label: "TikTok Pixel ID (e.g. C9RRE3BC77UABL6KQ8E0)" },
        "integrations.linkedinPartnerId": { re: /^\d{5,12}$/, label: "LinkedIn Partner ID (numeric)" },
        "integrations.pinterestTagId": { re: /^[0-9]{10,15}$/, label: "Pinterest Tag ID (numeric)" },
      };
      if (key in ID_PATTERNS && value) {
        const spec = ID_PATTERNS[key];
        if (!spec.re.test(value)) {
          return NextResponse.json({ error: spec.label }, { status: 400 });
        }
      }

      // Webhook URLs must be https
      if (["alerts.slackWebhookUrl", "alerts.discordWebhookUrl"].includes(key) && value) {
        if (!/^https:\/\/\S+$/.test(value)) {
          return NextResponse.json(
            { error: `${key.split(".")[1]} must be an https:// webhook URL` },
            { status: 400 }
          );
        }
      }
      if (key === "alerts.telegramBotToken" && value && !/^[0-9]{5,15}:[A-Za-z0-9_\-]{30,40}$/.test(value)) {
        return NextResponse.json({ error: "Telegram bot token looks invalid" }, { status: 400 });
      }
      if (key === "alerts.telegramChatId" && value && !/^-?[0-9]{5,20}$/.test(value)) {
        return NextResponse.json({ error: "Telegram chat ID must be numeric" }, { status: 400 });
      }
      if (key === "integrations.gscServiceAccountEmail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return NextResponse.json({ error: "GSC service account email looks invalid" }, { status: 400 });
      }
      if (key === "integrations.gscSiteUrl" && value && !/^https?:\/\/\S+$/.test(value)) {
        return NextResponse.json({ error: "GSC site must be an http(s) URL" }, { status: 400 });
      }

      clean[key] = value;
    }

    const count = await setSettings(clean);

    // Bust settings-dependent caches and notify
    await prisma.notification.create({
      data: {
        type: "system",
        title: "Settings updated",
        message: `${count} setting(s) updated by ${session.user.name}`,
        href: "#admin",
      },
    });

    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      action: "settings.update",
      module: "settings",
      details: `Updated ${count} setting(s): ${Object.keys(clean).join(", ")}`,
    });

    const settings = await getSettings();
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      masked[key] = SECRET_KEYS.has(key) && value ? VALUE_MASK : value;
    }
    return NextResponse.json({ settings: masked, updated: count });
  } catch (e) {
    console.error("PUT /api/settings error", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
