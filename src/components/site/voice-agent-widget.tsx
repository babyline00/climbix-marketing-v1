"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, MessageCircle, RefreshCw, Send, Volume2, VolumeX, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentPublicConfig {
  enabled: boolean;
  name: string;
  welcome: string;
  quickReplies: string[];
  ttsEnabled: boolean;
  voiceProvider: "elevenlabs" | "browser" | "livekit" | "pipecat" | "callkit";
  /** Browser voice name to prefer in browser mode ("" = browser default). */
  browserVoiceName: string;
}

const DEFAULT_CONFIG: AgentPublicConfig = {
  enabled: true,
  name: "Climbix Assistant",
  welcome:
    "Hi there! I'm Climbix Assistant. Ask me anything about our SEO, AI search and lead-generation services — type below or tap the mic and just talk.",
  quickReplies: [],
  ttsEnabled: true,
  voiceProvider: "elevenlabs",
  browserVoiceName: "",
};

type AgentStatus = "idle" | "thinking" | "speaking" | "listening";

const STORAGE_KEY = "climbix-agent-chat-v1";

function makeWelcome(cfg: AgentPublicConfig): ChatMessage {
  return { role: "assistant", content: cfg.welcome || DEFAULT_CONFIG.welcome };
}

// ---- Minimal Web Speech API typings (not in all TS libs) ----
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function stripForSpeech(text: string): string {
  return text.replace(/[*_#`~>\[\]]/g, " ").replace(/\s+/g, " ").trim();
}

export function VoiceAgentWidget() {
  const [config, setConfig] = useState<AgentPublicConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeWelcome(DEFAULT_CONFIG)]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [interim, setInterim] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const mutedRef = useRef(false);
  const busyRef = useRef(false);
  const openRef = useRef(false);
  const configRef = useRef<AgentPublicConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    busyRef.current = status === "thinking";
  }, [status]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Load admin-managed configuration (name, greeting, quick replies, switches).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/config", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AgentPublicConfig | null) => {
        if (cancelled || !data) return;
        const merged = { ...DEFAULT_CONFIG, ...data };
        configRef.current = merged;
        setConfig(merged);
        setMessages((prev) => [makeWelcome(merged), ...prev.slice(1)]);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore conversation history + detect mic support.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages((prev) => [prev[0], ...parsed.slice(-40)]);
        }
      }
    } catch {
      /* ignore corrupted history */
    }
    setMicSupported(getRecognitionCtor() !== null);
    return () => {
      recognitionRef.current?.abort();
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, interim, status, open]);

  const persist = useCallback((all: ChatMessage[]) => {
    try {
      // Index 0 is always the synthetic welcome message — not persisted.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(1).slice(-40)));
    } catch {
      /* storage full/unavailable */
    }
  }, []);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setInterim("");
  }, []);

  /** Resolve an admin-configured browser voice (name or voiceURI) to a real
   *  SpeechSynthesisVoice. getVoices() can be empty right after page load, so
   *  resolve lazily at speak time and return null (= browser default) rather
   *  than failing when the set hasn't populated yet. */
  function pickBrowserVoice(name: string): SpeechSynthesisVoice | null {
    if (!name) return null;
    try {
      const all = window.speechSynthesis?.getVoices?.() ?? [];
      return all.find((v) => v.name === name || v.voiceURI === name) ?? null;
    } catch {
      return null;
    }
  }

  /** Speak a reply: ElevenLabs first, browser speechSynthesis as fallback.
   *  In browser-only mode we skip the server round-trip entirely. */
  const speak = useCallback(
    async (text: string) => {
      if (mutedRef.current || !configRef.current.ttsEnabled) return;
      const clean = stripForSpeech(text);
      if (!clean) return;
      setStatus("speaking");
      if (configRef.current.voiceProvider === "browser") {
        try {
          if (!("speechSynthesis" in window)) throw new Error("no tts");
          const utter = new SpeechSynthesisUtterance(clean);
          const voice = pickBrowserVoice(configRef.current.browserVoiceName ?? "");
          if (voice) utter.voice = voice;
          utter.rate = 1.02;
          utter.onend = () => setStatus("idle");
          utter.onerror = () => setStatus("idle");
          window.speechSynthesis.speak(utter);
        } catch {
          setStatus("idle");
        }
        return;
      }
      try {
        const res = await fetch("/api/agent/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean }),
        });
        if (!res.ok) throw new Error(`tts ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) {
            audioRef.current = null;
            setStatus("idle");
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setStatus("idle");
        };
        await audio.play();
      } catch {
        // Fallback: browser built-in voice.
        try {
          if (!("speechSynthesis" in window)) throw new Error("no tts");
          const utter = new SpeechSynthesisUtterance(clean);
          utter.rate = 1.02;
          utter.onend = () => setStatus("idle");
          utter.onerror = () => setStatus("idle");
          window.speechSynthesis.speak(utter);
        } catch {
          setStatus("idle");
        }
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || busyRef.current) return;

      stopAudio();
      stopListening();

      const userMsg: ChatMessage = { role: "user", content: text };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        persist(next);
        return next;
      });
      setInput("");
      setInterim("");
      setStatus("thinking");

      try {
        const history = messages
          .slice(1) // skip the synthetic welcome message
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: "user", content: text });

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = (await res.json().catch(() => null)) as {
          reply?: string;
          error?: string;
        } | null;

        const reply =
          data?.reply ||
          "Sorry, I'm having trouble answering right now. Could you try again in a moment?";

        const assistantMsg: ChatMessage = { role: "assistant", content: reply };
        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          persist(next);
          return next;
        });
        void speak(reply);
      } catch {
        const fail: ChatMessage = {
          role: "assistant",
          content:
            "I seem to be offline at the moment. Please try again shortly, or use the contact form on the homepage.",
        };
        setMessages((prev) => {
          const next = [...prev, fail];
          persist(next);
          return next;
        });
        setStatus("idle");
      }
    },
    [messages, persist, speak, stopAudio, stopListening]
  );

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || busyRef.current) return;

    stopAudio();

    const recognition = new Ctor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = "";
    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInterim(finalText || interimText);
    };
    recognition.onend = () => {
      listeningRef.current = false;
      setInterim("");
      setStatus((s) => (s === "listening" ? "idle" : s));
      const text = finalText.trim();
      if (text && openRef.current) void sendMessage(text);
    };
    recognition.onerror = () => {
      listeningRef.current = false;
      setInterim("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      listeningRef.current = true;
      setStatus("listening");
    } catch {
      listeningRef.current = false;
    }
  }, [sendMessage, stopAudio]);

  const toggleListening = useCallback(() => {
    if (listeningRef.current) {
      stopListening();
      setStatus("idle");
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  const resetConversation = useCallback(() => {
    stopAudio();
    stopListening();
    setMessages([makeWelcome(configRef.current)]);
    setStatus("idle");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [stopAudio, stopListening]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (next) {
        stopAudio();
        if (status === "speaking") setStatus("idle");
      }
      return next;
    });
  }, [stopAudio, status]);

  const toggleOpen = useCallback(() => {
    setOpen((o) => {
      const next = !o;
      openRef.current = next;
      if (!next) {
        stopAudio();
        stopListening();
        setStatus("idle");
      }
      return next;
    });
  }, [stopAudio, stopListening]);

  const statusLabel =
    status === "thinking"
      ? "Thinking…"
      : status === "speaking"
        ? "Speaking…"
        : status === "listening"
          ? "Listening — go ahead"
          : micSupported
            ? config.ttsEnabled
              ? "Online · voice ready"
              : "Online · replies in text"
            : "Online · type to chat";

  const statusDot =
    status === "listening"
      ? "bg-red-400"
      : status === "speaking" || status === "thinking"
        ? "bg-amber-300"
        : "bg-emerald-400";

  // Admin can disable the agent entirely — hide launcher + panel.
  if (configLoaded && !config.enabled) return null;

  return (
    <>
      <style>{`
        @keyframes va-eq { 0%,100% { transform: scaleY(0.35);} 50% { transform: scaleY(1);} }
        .va-bar { animation: va-eq 0.9s ease-in-out infinite; transform-origin: bottom; }
        @keyframes va-ring { 0% { box-shadow: 0 0 0 0 rgba(255,107,44,0.45);} 100% { box-shadow: 0 0 0 14px rgba(255,107,44,0);} }
        .va-ring { animation: va-ring 1.6s ease-out infinite; }
      `}</style>

      {/* Floating launcher */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={open ? "Close Climbix voice assistant" : "Open Climbix voice assistant"}
        className={`fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${
          open ? "bg-[#080d19]" : "bg-primary va-ring"
        }`}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-white ring-2 ring-white">
            1
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Climbix voice assistant chat"
          className="fixed bottom-[5.5rem] right-4 z-[70] flex h-[min(68vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#080d19] px-4 py-3 text-white">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="h-5 w-5 text-white" />
              {status === "speaking" && (
                <span className="absolute inset-0 rounded-full ring-2 ring-primary/60 va-ring" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{config.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                {statusLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              aria-label="Start a new conversation"
              title="New conversation"
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute voice replies" : "Mute voice replies"}
              title={muted ? "Unmute" : "Mute"}
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Close assistant"
              className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
            {messages.map((m, i) => {
              const isLastAssistant =
                m.role === "assistant" && i === messages.length - 1;
              return (
                <div
                  key={`${i}-${m.role}`}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border bg-background text-foreground shadow-sm"
                    }`}
                  >
                    {m.content}
                    {isLastAssistant && status === "speaking" && (
                      <span className="ml-2 inline-flex h-3 items-end gap-[2px]" aria-hidden>
                        {[0, 1, 2, 3].map((b) => (
                          <span
                            key={b}
                            className="va-bar w-[3px] rounded-full bg-primary"
                            style={{ height: "12px", animationDelay: `${b * 0.15}s` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {status === "thinking" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border bg-background px-4 py-3 shadow-sm" aria-label="Assistant is typing">
                  <span className="flex items-center gap-1" aria-hidden>
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {status === "listening" && interim && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-sm italic text-muted-foreground">
                  {interim}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="border-t bg-background p-3">
            {config.quickReplies.length > 0 && messages.length === 1 && status === "idle" && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {config.quickReplies.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              {micSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={status === "thinking"}
                  aria-label={status === "listening" ? "Stop recording" : "Start talking"}
                  title={status === "listening" ? "Stop recording" : "Tap and speak"}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    status === "listening"
                      ? "animate-pulse bg-primary text-white shadow-lg"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  } disabled:opacity-40`}
                >
                  {status === "listening" ? (
                    <MicOff className="h-4.5 w-4.5" />
                  ) : (
                    <Mic className="h-4.5 w-4.5" />
                  )}
                </button>
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  title="Voice input not supported in this browser"
                >
                  <MicOff className="h-4 w-4" />
                </span>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder={
                  status === "listening" ? "Listening…" : "Type your message…"
                }
                aria-label="Message to Climbix Assistant"
                maxLength={500}
                className="h-10 min-w-0 flex-1 rounded-full border bg-muted/30 px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || status === "thinking"}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow transition hover:bg-primary/90 active:scale-95 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-none text-muted-foreground">
              AI voice assistant · replies are spoken aloud · tap the mic and just talk
            </p>
          </div>
        </div>
      )}
    </>
  );
}
