"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Building2,
  Globe,
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
import { Textarea } from "@/components/ui/textarea";

type SchedulerState = "idle" | "submitting" | "success" | "error";

export type SchedulerConfig = {
  source: string;
  service?: string;
  heading?: string;
  subheading?: string;
};

type MeetingSchedulerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: SchedulerConfig;
};

export const TIMEZONES = [
  "UTC",
  "America/New_York (EST/EDT)",
  "America/Chicago (CST/CDT)",
  "America/Denver (MST/MDT)",
  "America/Los_Angeles (PST/PDT)",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London (GMT/BST)",
  "Europe/Paris (CET)",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai (GST)",
  "Asia/Karachi (PKT)",
  "Asia/Kolkata (IST)",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Australia/Melbourne",
];

export const SERVICES = [
  "Performance Marketing",
  "SEO Services",
  "Lead Generation",
  "AI Automation",
  "Website Development",
  "AI Content Marketing",
  "AI Search Optimization",
  "General Strategy Call",
];

// Local YYYY-MM-DD (avoids toISOString() UTC off-by-one for UTC+ timezones)
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Detect the visitor's timezone and match it to the closest known zone
export function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "UTC";
    const exact = TIMEZONES.find((t) => t === tz || t.startsWith(`${tz} `));
    if (exact) return exact;
    const region = tz.split("/")[0];
    const partial = TIMEZONES.find((t) => t.startsWith(`${region}/`));
    return partial || "UTC";
  } catch {
    return "UTC";
  }
}

// Generate next 14 days for date selection (excluding today if past 6pm)
export function getAvailableDates(): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  const startHour = now.getHours();

  for (let i = 0; i < 21 && dates.length < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    // Skip Sundays (0) — weekend off
    if (d.getDay() === 0) continue;
    // If today and past 6pm, skip
    if (i === 0 && startHour >= 18) continue;

    const value = toLocalDateKey(d);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    dates.push({ value, label });
  }
  return dates;
}

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export function MeetingScheduler({
  open,
  onOpenChange,
  config,
}: MeetingSchedulerProps) {
  const [state, setState] = React.useState<SchedulerState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    company: "",
    service: config?.service || "General Strategy Call",
    date: "",
    time: "",
    timezone: "UTC",
    notes: "",
    website: "",
    goal: "",
  });

  const dates = React.useMemo(() => getAvailableDates(), []);

  // Detect visitor timezone once when the modal opens
  React.useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        timezone: detectTimezone(),
        service: config?.service || "General Strategy Call",
      }));
    }
  }, [open, config?.service]);

  // Close on Escape only when no Radix Select dropdown is open (Select handles its own Escape)
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const selectOpen = document.querySelector('[data-slot="select-content"]');
      if (selectOpen) return;
      e.preventDefault();
      onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        body: JSON.stringify({
          ...form,
          source: config?.source || "meeting-scheduler",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to schedule meeting");
      }

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

  const close = () => onOpenChange(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-3xl bg-background border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <CalendarCheck className="size-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight">
                    {state === "success"
                      ? "Meeting scheduled!"
                      : "Schedule a strategy call"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {state === "success"
                      ? "We'll send a confirmation shortly"
                      : "Pick a time that works for you"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                aria-label="Close"
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {state === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="text-center py-6"
                  >
                    <div className="mx-auto size-16 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="size-8 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      You're all set, {form.name.split(" ")[0]}!
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                      Your strategy call is scheduled for{" "}
                      <span className="font-semibold text-foreground">
                        {dates.find((d) => d.value === form.date)?.label ||
                          form.date}
                      </span>{" "}
                      at{" "}
                      <span className="font-semibold text-foreground">
                        {form.time}
                      </span>{" "}
                      ({form.timezone}). A confirmation email is on its way to{" "}
                      <span className="font-semibold text-foreground">
                        {form.email}
                      </span>
                      .
                    </p>
                    <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4 text-left">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        What happens next
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-brand-500 mt-0.5 shrink-0" />
                          <span>We review your website and goals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-brand-500 mt-0.5 shrink-0" />
                          <span>Prepare a custom growth strategy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-brand-500 mt-0.5 shrink-0" />
                          <span>Walk you through it on the call (30 min)</span>
                        </li>
                      </ul>
                    </div>
                    <Button
                      onClick={close}
                      className="mt-6 bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={onSubmit}
                    className="space-y-4"
                  >
                    {config?.heading && (
                      <p className="text-sm text-muted-foreground">
                        {config.heading}
                      </p>
                    )}

                    {/* Name + Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sched-name" className="text-xs">
                          Full name *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            id="sched-name"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Jane Smith"
                            required
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sched-email" className="text-xs">
                          Work email *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            id="sched-email"
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                            placeholder="jane@company.com"
                            required
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company + Website */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sched-company" className="text-xs">
                          Company
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            id="sched-company"
                            value={form.company}
                            onChange={(e) =>
                              setForm({ ...form, company: e.target.value })
                            }
                            placeholder="Acme Inc."
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sched-website" className="text-xs">
                          Website
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                          <Input
                            id="sched-website"
                            value={form.website}
                            onChange={(e) =>
                              setForm({ ...form, website: e.target.value })
                            }
                            placeholder="acme.com"
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Service of interest</Label>
                      <Select
                        value={form.service}
                        onValueChange={(v) =>
                          setForm({ ...form, service: v })
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
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

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Preferred date *
                      </Label>
                      <Select
                        value={form.date}
                        onValueChange={(v) =>
                          setForm({ ...form, date: v })
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
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

                    {/* Time + Timezone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          Preferred time *
                        </Label>
                        <Select
                          value={form.time}
                          onValueChange={(v) =>
                            setForm({ ...form, time: v })
                          }
                        >
                          <SelectTrigger className="h-9 text-sm">
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
                      <div className="space-y-1.5">
                        <Label className="text-xs">Timezone</Label>
                        <Select
                          value={form.timezone}
                          onValueChange={(v) =>
                            setForm({ ...form, timezone: v })
                          }
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label htmlFor="sched-notes" className="text-xs">
                        Anything we should know before the call?
                      </Label>
                      <Textarea
                        id="sched-notes"
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                        placeholder="Tell us about your goals, current challenges, or specific questions..."
                        className="text-sm min-h-[70px] resize-none"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                        <AlertCircle className="size-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={state === "submitting"}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold"
                    >
                      {state === "submitting" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Scheduling…
                        </>
                      ) : (
                        <>
                          <CalendarCheck className="size-4" />
                          Confirm meeting
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-muted-foreground text-center">
                      30-minute call · No obligation · We'll send a calendar
                      invite to your email
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
