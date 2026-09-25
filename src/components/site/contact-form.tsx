"use client";

import * as React from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServices } from "@/components/site/services-context";
import { trackEvent, getUtmFields } from "@/lib/track-client";

type Status = "idle" | "loading" | "done" | "error";

export function ContactForm() {
  const services = useServices();
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    company: "",
    website: "",
    service: "",
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company || null,
          website: form.website || null,
          service: form.service || null,
          message: form.message || null,
          source: "contact-page",
          ...getUtmFields(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      trackEvent("generate_lead", { source: "contact-page" });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-brand-500/30 bg-brand-500/[0.04] p-8 text-center">
        <div className="mx-auto size-14 rounded-2xl bg-brand-500/15 ring-1 ring-inset ring-brand-500/30 flex items-center justify-center">
          <CheckCircle2 className="size-7 text-brand-600" />
        </div>
        <h3 className="mt-5 text-xl font-bold">Message received.</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Thanks for reaching out — a strategist (not a bot) will get back to
          you within one business day. Want to move faster? Book a strategy
          call and skip the inbox entirely.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Full name *</Label>
          <Input
            id="contact-name"
            required
            placeholder="Alex Morgan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Work email *</Label>
          <Input
            id="contact-email"
            type="email"
            required
            placeholder="alex@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact-company">Company</Label>
          <Input
            id="contact-company"
            placeholder="Company Inc."
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-website">Website</Label>
          <Input
            id="contact-website"
            placeholder="https://company.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>What are you interested in?</Label>
        <Select
          value={form.service || undefined}
          onValueChange={(v) => setForm({ ...form, service: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a service (optional)" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.slug} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
            <SelectItem value="Not sure yet">Not sure yet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Tell us about your goals</Label>
        <Textarea
          id="contact-message"
          rows={4}
          placeholder="What are you trying to grow, and what's getting in the way?"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <Send className="size-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We&apos;ll reply within one business day. No newsletters unless you
        ask — no data selling, ever.
      </p>
    </form>
  );
}
