"use client";

import * as React from "react";
import {
  User,
  Mail,
  Building2,
  Globe,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SERVICES,
  TIME_SLOTS,
  TIMEZONES,
  detectTimezone,
  getAvailableDates,
} from "./meeting-scheduler";
import { trackEvent } from "@/lib/track-client";

type FormState = "idle" | "submitting" | "success" | "error";

/**
 * Inline "Schedule a Strategy Call" form embedded in the hero (dark card).
 * Posts to /api/meetings with source attribution.
 */
export function StrategyCallForm({ id }: { id?: string }) {
  const [state, setState] = React.useState<FormState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    company: "",
    service: "General Strategy Call",
    date: "",
    time: "",
    timezone: "UTC",
    notes: "",
    website: "",
  });

  const dates = React.useMemo(() => getAvailableDates(), []);

  // Detect visitor timezone on mount (client only)
  React.useEffect(() => {
    setForm((f) => ({ ...f, timezone: detectTimezone() }));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date || !form.time) {
      setError("Please fill in your name, email, date, and time.");
      return;
    }

    setState("submitting");
    setError(null);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "hero-strategy-call" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to schedule meeting");
      }

      trackEvent("book_strategy_call", { service: form.service });
      setState("success");
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (state === "success") {
    return (
      <div
        id={id}
        className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8 text-center glow-ring"
      >
        <div className="mx-auto size-14 rounded-full bg-brand-500/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="size-7 text-brand-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          You&apos;re all set, {form.name.split(" ")[0]}!
        </h3>
        <p className="mt-2 text-sm text-white/70 max-w-sm mx-auto">
          Your strategy call is scheduled for{" "}
          <span className="font-semibold text-white">
            {dates.find((d) => d.value === form.date)?.label || form.date}
          </span>{" "}
          at{" "}
          <span className="font-semibold text-white">{form.time}</span> (
          {form.timezone.split(" ")[0]}). A confirmation email is on its way to{" "}
          <span className="font-semibold text-white">{form.email}</span>.
        </p>
        <ul className="mt-5 space-y-2 text-left text-sm text-white/80 max-w-xs mx-auto">
          {[
            "We review your website and goals",
            "Prepare a custom growth strategy",
            "Walk you through it on the call (30 min)",
          ].map((s) => (
            <li key={s} className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-brand-400 mt-0.5 shrink-0" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="relative scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 lg:p-7 glow-ring"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="size-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <CalendarCheck className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white leading-tight">
            Schedule a Strategy Call
          </h3>
          <p className="text-xs text-white/55">
            Free 30-minute growth session · No obligation
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hero-name" className="text-xs text-white/70">
              Full name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              <Input
                id="hero-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                required
                className="pl-8 h-10 text-sm bg-white/[0.07] border-white/15 text-white placeholder:text-white/35 focus-visible:ring-brand-400"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-email" className="text-xs text-white/70">
              Work email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              <Input
                id="hero-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
                required
                className="pl-8 h-10 text-sm bg-white/[0.07] border-white/15 text-white placeholder:text-white/35 focus-visible:ring-brand-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hero-company" className="text-xs text-white/70">
              Company
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              <Input
                id="hero-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Inc."
                className="pl-8 h-10 text-sm bg-white/[0.07] border-white/15 text-white placeholder:text-white/35 focus-visible:ring-brand-400"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-website" className="text-xs text-white/70">
              Website
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              <Input
                id="hero-website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="acme.com"
                className="pl-8 h-10 text-sm bg-white/[0.07] border-white/15 text-white placeholder:text-white/35 focus-visible:ring-brand-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Service of interest</Label>
          <Select
            value={form.service}
            onValueChange={(v) => setForm({ ...form, service: v })}
          >
            <SelectTrigger className="h-10 text-sm bg-white/[0.07] border-white/15 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70 flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Preferred date *
            </Label>
            <Select
              value={form.date}
              onValueChange={(v) => setForm({ ...form, date: v })}
            >
              <SelectTrigger className="h-10 text-sm bg-white/[0.07] border-white/15 text-white">
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70 flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Preferred time *
            </Label>
            <Select
              value={form.time}
              onValueChange={(v) => setForm({ ...form, time: v })}
            >
              <SelectTrigger className="h-10 text-sm bg-white/[0.07] border-white/15 text-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Timezone</Label>
          <Select
            value={form.timezone}
            onValueChange={(v) => setForm({ ...form, timezone: v })}
          >
            <SelectTrigger className="h-10 text-sm bg-white/[0.07] border-white/15 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={state === "submitting"}
          className="w-full h-11 bg-brand-500 hover:bg-brand-400 text-white font-semibold shadow-xl shadow-brand-500/30"
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Scheduling…
            </>
          ) : (
            <>
              <CalendarCheck className="size-4" />
              Confirm my strategy call
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-white/45 text-center">
          30-minute call · No obligation · Calendar invite sent to your email
        </p>
      </form>
    </div>
  );
}
