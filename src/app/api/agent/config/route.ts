import { NextResponse } from "next/server";
import { getAgentConfig } from "@/lib/settings";

export const runtime = "nodejs";

// GET /api/agent/config — public, non-secret widget configuration.
// Lets the voice agent widget pick up admin-managed name, greeting,
// quick replies, and enabled/TTS switches. Never exposes secrets.
export async function GET() {
  try {
    const cfg = await getAgentConfig();
    return NextResponse.json({
      enabled: cfg.enabled,
      name: cfg.name,
      welcome: cfg.welcome,
      quickReplies: cfg.quickReplies,
      ttsEnabled: cfg.ttsEnabled,
      // Voice provider mode. Always resolves to a safe, working default when
      // the selected provider isn't fully configured server-side.
      voiceProvider: voiceProviderOf(cfg),
      // Browser voice: only meaningful in browser mode; expose the name so the
      // widget can resolve it via speechSynthesis.getVoices() ("" = browser default).
      browserVoiceName:
        cfg.voiceProvider === "browser" ? cfg.browserVoiceName : "",
    });
  } catch (err) {
    console.error("[agent/config] error:", err);
    // Fail closed to safe defaults — the widget has its own fallbacks.
    return NextResponse.json(
      {
        enabled: true,
        name: "Climbix Assistant",
        welcome: "",
        quickReplies: [],
        ttsEnabled: true,
        voiceProvider: "elevenlabs",
        browserVoiceName: "",
      },
      { status: 200 }
    );
  }
}

/** Map the DB value to an effective public provider the widget can act on. */
function voiceProviderOf(cfg: {
  voiceProvider: string;
  livekitServerUrl: string;
  livekitTokenUrl: string;
  pipecatServerUrl: string;
  pipecatApiKey: string;
  callkitNumber: string;
}): string {
  switch (cfg.voiceProvider) {
    case "browser":
      return "browser";
    case "livekit":
      return cfg.livekitServerUrl && cfg.livekitTokenUrl ? "livekit" : "browser";
    case "pipecat":
      return cfg.pipecatServerUrl && cfg.pipecatApiKey ? "pipecat" : "browser";
    case "callkit":
      return cfg.callkitNumber ? "callkit" : "browser";
    default:
      // "" (ElevenLabs) — always works (server TTS + browser fallback)
      return "elevenlabs";
  }
}
