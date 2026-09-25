import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getAgentConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 800;

// Strip markdown/symbols that should not be spoken aloud.
function speakableText(input: string): string {
  return input
    .replace(/[*_#`~>\[\]()]/g, " ")
    .replace(/https?:\/\/\S+/g, "this link")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}

let client: ElevenLabsClient | null = null;
let clientKeyUsed = "";
function getClient(apiKey: string) {
  if (!apiKey) return null;
  // Rebuild the client if the admin switched API keys
  if (!client || clientKeyUsed !== apiKey) {
    client = new ElevenLabsClient({ apiKey });
    clientKeyUsed = apiKey;
  }
  return client;
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req, "agent-tts"), 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  // Admin-configured voice settings (DB values resolve with env fallbacks)
  const cfg = await getAgentConfig();
  if (!cfg.ttsEnabled) {
    return NextResponse.json(
      { error: "Voice replies are currently disabled by the site administrator." },
      { status: 503 }
    );
  }

  // Browser-native voice mode — the widget speaks via the Web Speech API,
  // no ElevenLabs key needed. Server TTS is intentionally unavailable here.
  if (cfg.voiceProvider === "browser") {
    return NextResponse.json(
      { error: "Browser voice mode — server TTS is disabled." },
      { status: 503 }
    );
  }

  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const text = speakableText(body.text);
  if (!text) {
    return NextResponse.json({ error: "text is empty" }, { status: 400 });
  }

  const elevenlabs = getClient(cfg.elevenlabsApiKey);
  if (!elevenlabs) {
    return NextResponse.json(
      { error: "Voice is not configured" },
      { status: 503 }
    );
  }

  try {
    const audio = await elevenlabs.textToSpeech.convert(cfg.ttsVoiceId, {
      text,
      modelId: cfg.ttsModelId,
      outputFormat: "mp3_44100_128",
    });

    // Buffer the stream so we can set Content-Length and validate.
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    if (total === 0) {
      return NextResponse.json(
        { error: "Empty audio response" },
        { status: 502 }
      );
    }

    const payload = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      payload.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new Response(payload, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(total),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[agent/tts] error:", err);
    // 502 lets the client fall back to the browser's built-in speech engine.
    return NextResponse.json(
      { error: "Voice synthesis failed" },
      { status: 502 }
    );
  }
}
