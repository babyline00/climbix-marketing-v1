import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getAgentConfig, type AgentRuntimeConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_SYSTEM_PROMPT = `You are "Climbix Assistant", the friendly AI voice agent for Climbix Marketing — a global SEO, AI Search Optimization and lead-generation agency.

PERSONALITY
- Warm, confident, professional. You are in a spoken conversation, so write like you talk.
- Keep replies short: 1-3 sentences, under 60 words, unless the user explicitly asks for detail.
- Plain conversational sentences only. NEVER use markdown, bullet points, emojis, or symbols like * or #.

WHAT CLIMBIX DOES
- Services: SEO, AI Search Optimization (getting brands cited inside AI answer engines), paid ads (PPC), content marketing, social media marketing, email marketing, web design & development, branding, analytics & conversion optimization.
- Approach: data-backed strategies, transparent reporting, measurable lead growth.
- Pricing: custom quotes based on each business's goals — never invent specific prices.
- Primary call-to-action: booking a free strategy call (the "Schedule a Strategy Call" form on the homepage).

RULES
1. Encourage visitors to book a free strategy call when they show interest.
2. If the user shares their name, email or goals, thank them and say a strategist will follow up — they can also submit the homepage form.
3. Politely redirect topics unrelated to marketing or Climbix back to how Climbix can help their business.
4. Never promise specific rankings, timelines, revenue numbers or guarantees.
5. If you don't know something, say the team will confirm and suggest the strategy call.
6. Always reply in the same language the user writes in.`;

const MAX_MESSAGES = 16;
const MAX_CONTENT_LEN = 2000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeMessages(raw: unknown): IncomingMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const cleaned: IncomingMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (
      !item ||
      typeof item !== "object" ||
      ((item as IncomingMessage).role !== "user" &&
        (item as IncomingMessage).role !== "assistant") ||
      typeof (item as IncomingMessage).content !== "string"
    ) {
      continue;
    }
    const content = (item as IncomingMessage).content
      .slice(0, MAX_CONTENT_LEN)
      .trim();
    if (!content) continue;
    cleaned.push({ role: (item as IncomingMessage).role, content });
  }
  // The last message must come from the user.
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return null;
  }
  return cleaned;
}

// Reuse one SDK instance across requests.
let zaiPromise: Promise<ZAI> | null = null;
function getZAI(): Promise<ZAI> {
  if (!zaiPromise) {
    zaiPromise = ZAI.create().catch((err) => {
      zaiPromise = null;
      throw err;
    });
  }
  return zaiPromise;
}

// ─────────────────────────────────────────────────────────────
// Multi-provider chat completion (OpenAI-compatible endpoints)
// ─────────────────────────────────────────────────────────────

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com/v1",
  xai: "https://api.x.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

/** Sensible default model when the admin leaves the model blank. */
const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  deepseek: "deepseek-chat",
  xai: "grok-3",
  openrouter: "openai/gpt-4o-mini",
  custom: "",
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI (ChatGPT)",
  deepseek: "DeepSeek",
  xai: "Grok (xAI)",
  openrouter: "OpenRouter",
  custom: "Custom endpoint",
};

/** Resolve the provider base URL (custom providers may pass a full URL). */
function providerBaseUrl(cfg: AgentRuntimeConfig): string | null {
  const presetUrl = PROVIDER_BASE_URLS[cfg.provider];
  if (cfg.provider === "custom") {
    if (!cfg.providerBaseUrl) return null;
    // Accept a full endpoint or just the base — strip trailing "/chat/completions".
    return cfg.providerBaseUrl
      .trim()
      .replace(/\/+$/, "")
      .replace(/\/chat\/completions$/i, "");
  }
  return presetUrl || null;
}

interface ChatRequestMessage {
  role: "user" | "assistant";
  content: string;
}

function createCompletion(
  zai: ZAI,
  messages: ChatRequestMessage[],
  model?: string
) {
  return zai.chat.completions.create({
    messages,
    ...(model ? { model } : {}),
    thinking: { type: "disabled" },
  } as Parameters<typeof zai.chat.completions.create>[0]);
}

/** Call any OpenAI-compatible /chat/completions endpoint. */
async function createOpenAiCompatibleCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatRequestMessage[]
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = await res.json().catch(() => null);
  const reply = data?.choices?.[0]?.message?.content?.trim?.();
  if (!reply) throw new Error("Empty completion from provider");
  return reply;
}

/** Produce a reply using whichever provider the admin configured, with smart fallbacks. */
async function generateReply(cfg: AgentRuntimeConfig, messages: ChatRequestMessage[]) {
  const baseUrl = providerBaseUrl(cfg);
  const apiKey = cfg.providerApiKey;
  const model = cfg.model || PROVIDER_DEFAULT_MODELS[cfg.provider] || "";

  const providerName = PROVIDER_LABELS[cfg.provider] || "Z.ai (GLM)";
  let providerError: string | null = null;

  // Non-ZAI providers are reachable only when an API key + URL are configured.
  if (cfg.provider && baseUrl && apiKey && model) {
    try {
      return await createOpenAiCompatibleCompletion(baseUrl, apiKey, model, messages);
    } catch (err) {
      providerError = err instanceof Error ? err.message : String(err);
      console.warn(`[agent/chat] ${providerName} failed — falling back to Z.ai:`, err);
    }
  } else if (cfg.provider && cfg.provider !== "custom" && (!apiKey || !model)) {
    // Provider selected but incomplete — warn and fall back instead of erroring.
    console.warn(`[agent/chat] ${providerName} is not fully configured (apiKey/model) — using Z.ai`);
  }

  // Z.ai / GLM default (or explicit model override for the default engine).
  let zai: ZAI | null = null;
  try {
    zai = await getZAI();
    return await createCompletion(zai, messages, cfg.provider ? undefined : cfg.model);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (zai && cfg.model && !cfg.provider) {
      // Retry once with the provider default model (e.g. GLM model too new).
      return await createCompletion(zai, messages);
    }
    // Z.ai unavailable: report the real problem — configured provider error first.
    if (providerError) throw new Error(`LLM provider failed (${providerName}): ${providerError}`);
    if (/configuration file not found/i.test(msg)) {
      throw new Error(
        "No LLM provider is configured. Add an OpenAI/DeepSeek/Grok/OpenRouter API key in Settings → AI Agent, or set up a Z.ai config."
      );
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req, "agent-chat"), 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down a little." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  // Admin-configured runtime settings (enable switch, prompt, model)
  const cfg = await getAgentConfig();
  if (!cfg.enabled) {
    return NextResponse.json(
      { error: "The assistant is currently disabled by the site administrator." },
      { status: 503 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return NextResponse.json(
      { error: "messages must end with a non-empty user message" },
      { status: 400 }
    );
  }

  try {
    const systemPrompt = cfg.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const requestMessages: ChatRequestMessage[] = [
      { role: "assistant", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await generateReply(cfg, requestMessages);
    if (!reply) {
      return NextResponse.json(
        { error: "The assistant could not generate a reply." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[agent/chat] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /No LLM provider is configured|LLM provider failed/i.test(msg)
    ) {
      // Configuration problem — surface it so the admin can fix settings.
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Assistant is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
