"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Multi-step lead capture ("Growth Plan").
 *
 * Three steps behind a progress bar: services, business details, goals. The
 * shape is deliberate — a single long form on a marketing page converts badly,
 * and asking which services first lets the sales team route the lead.
 *
 * Two variants, because the two placements sit on opposite surfaces:
 *   dialog — the light theme used by the modal
 *   hero   — the site's dark glass surface, used inline in the hero
 * Keeping both palettes in one lookup makes the difference explicit instead of
 * scattering conditionals through the markup, and guarantees the hero card and
 * the hero's other cards stay in step when the theme changes.
 */

const SERVICE_OPTIONS = [
  { value: "SEO", label: "SEO & Organic Growth" },
  { value: "AI Search Optimization", label: "AI Search / GEO" },
  { value: "Google Ads", label: "Google Ads / PPC" },
  { value: "Meta Ads", label: "Meta Ads" },
  { value: "Lead Generation", label: "Lead Generation" },
  { value: "Conversion Optimization", label: "Conversion Optimization" },
  { value: "Website Development", label: "Website Development" },
  { value: "AI Automation", label: "AI Automation" },
] as const;

const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000 - $3,000",
  "$3,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
] as const;

const GOAL_OPTIONS = [
  { value: "Generate more qualified leads", label: "Generate more qualified leads" },
  { value: "Increase sales and revenue", label: "Increase sales & revenue" },
  { value: "Improve advertising ROAS", label: "Improve advertising ROAS" },
  { value: "Improve SEO visibility", label: "Improve Google visibility" },
  { value: "Improve AI Search visibility", label: "Improve AI Search visibility" },
  { value: "Scale into new markets", label: "Scale into new markets" },
] as const;

const TOTAL_STEPS = 3;

/** Palette per surface. Colours come from the project's own brand tokens. */
const TONE = {
  light: {
    card: "",
    progressTrack: "bg-border",
    progressBar: "bg-primary",
    meta: "text-muted-foreground",
    heading: "mb-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] outline-none sm:text-5xl",
    body: "max-w-xl leading-relaxed text-muted-foreground",
    optionIdle: "border-border bg-card hover:-translate-y-0.5 hover:border-foreground",
    optionSelected: "border-foreground bg-foreground text-background",
    optionArrowOn: "opacity-100",
    optionArrowOff: "opacity-35",
    fieldLabel: "text-xs font-bold tracking-wide text-foreground",
    input: "h-[52px] rounded-none bg-card",
    textarea: "min-h-[130px] resize-y rounded-none bg-card leading-relaxed",
    primary:
      "group inline-flex min-h-[54px] items-center gap-5 rounded-none bg-foreground px-6 text-[13px] font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90",
    back: "min-h-[54px] bg-transparent px-1 text-[13px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground",
    trust: "text-white/0",
    successBadge: "bg-foreground text-background",
    successTitle: "mb-4 text-4xl font-bold tracking-tight outline-none sm:text-5xl text-foreground",
    successBody: "mx-auto max-w-lg text-base leading-relaxed text-muted-foreground",
  },
  dark: {
    card: "rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-7",
    progressTrack: "bg-white/10",
    progressBar: "bg-gradient-to-r from-brand-400 to-brand-600",
    meta: "text-white/60",
    heading:
      "mb-3 max-w-2xl text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-white outline-none lg:text-3xl",
    body: "max-w-xl text-sm leading-relaxed text-white/65",
    optionIdle:
      "border-white/12 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:border-brand-500/70 hover:bg-white/[0.08]",
    optionSelected:
      "border-brand-500 bg-brand-500/15 text-white ring-1 ring-brand-500/40",
    optionArrowOn: "text-brand-400 opacity-100",
    optionArrowOff: "text-white/40 opacity-60",
    fieldLabel: "text-xs font-bold tracking-wide text-white",
    input:
      "h-[50px] rounded-xl border-white/12 bg-white/[0.06] text-white placeholder:text-white/35 focus-visible:border-brand-500",
    textarea:
      "min-h-[120px] resize-y rounded-xl border-white/12 bg-white/[0.06] leading-relaxed text-white placeholder:text-white/35 focus-visible:border-brand-500",
    primary:
      "group inline-flex min-h-[50px] items-center justify-center gap-3 rounded-xl bg-brand-500 px-6 text-[13px] font-bold text-ink-900 shadow-lg shadow-brand-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-brand-500/40",
    back: "min-h-[50px] bg-transparent px-1 text-[13px] font-semibold text-white/60 hover:bg-transparent hover:text-white",
    trust: "text-white/55",
    successBadge:
      "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30",
    successTitle: "mb-4 text-3xl font-bold tracking-tight text-white outline-none lg:text-4xl",
    successBody: "mx-auto max-w-lg text-sm leading-relaxed text-white/65",
  },
} as const;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  budget: string;
  goal: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  website: "",
  phone: "",
  budget: "",
  goal: "",
  message: "",
};

type FieldErrors = Partial<Record<"firstName" | "email", string>>;

export function GrowthPlanForm({
  source = "growth-plan",
  variant = "dialog",
  onSuccess,
}: {
  source?: string;
  variant?: "dialog" | "hero";
  onSuccess?: () => void;
}) {
  const t = variant === "hero" ? TONE.dark : TONE.light;

  const [step, setStep] = React.useState(0); // 0..2, then 3 = success
  const [direction, setDirection] = React.useState(1);
  const [services, setServices] = React.useState<string[]>([]);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [serviceError, setServiceError] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const isSuccess = step >= TOTAL_STEPS;
  const percent = Math.min(100, Math.round(((step + 1) / TOTAL_STEPS) * 100));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) =>
      prev[key as "firstName" | "email"] ? { ...prev, [key]: undefined } : prev
    );
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    // Move focus to the new heading so keyboard and screen-reader users are not
    // left on a control that has just been hidden.
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const toggleService = (value: string) => {
    setServices((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      if (next.length > 0) setServiceError(false);
      return next;
    });
  };

  const validateStep1 = () => {
    if (services.length === 0) {
      setServiceError(true);
      return false;
    }
    setServiceError(false);
    return true;
  };

  const validateStep2 = () => {
    const next: FieldErrors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.email.trim()) next.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step < TOTAL_STEPS - 1) goTo(step + 1);
  };

  const handleBack = () => {
    if (step > 0) goTo(step - 1);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    // Re-validate on submit: an invalid email must never reach the API.
    if (!validateStep2()) {
      goTo(1);
      return;
    }
    if (services.length === 0) {
      setServiceError(true);
      goTo(0);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const fullName = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");
    // The API stores a single `service` string, so the multi-select is folded
    // into a readable list. Budget has no dedicated column, so it goes into the
    // message rather than being dropped.
    const messageParts = [
      form.message.trim(),
      form.budget ? `Monthly marketing budget: ${form.budget}.` : "",
      `Services of interest: ${services.join(", ")}.`,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || null,
          email: form.email.trim(),
          company: form.company.trim() || null,
          website: form.website.trim() || null,
          phone: form.phone.trim() || null,
          service: services.join(", "),
          goal: form.goal || null,
          message: messageParts.join("\n\n") || null,
          source,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(
          (data && typeof data.error === "string" && data.error) ||
            "Something went wrong. Please try again."
        );
        return;
      }

      goTo(TOTAL_STEPS);
      onSuccess?.();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setForm(EMPTY_FORM);
    setServices([]);
    setErrors({});
    setServiceError(false);
    setSubmitError(null);
    setDirection(-1);
    setStep(0);
  }

  const slide = {
    initial: { opacity: 0, x: direction * 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction * -24 },
  };

  const inputProps = {
    variant: variant === "hero" ? ("default" as const) : ("default" as const),
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("w-full", variant === "hero" && t.card)}
    >
      {/* ── Hero header ── */}
      {variant === "hero" && !isSuccess && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
            <CalendarCheck className="size-5 text-white" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight text-white">
              Start your growth plan
            </h3>
            <p className="text-xs text-white/60">Free strategy · No obligation</p>
          </div>
        </div>
      )}

      {/* ── Progress ── */}
      {!isSuccess && (
        <div className={cn(variant === "hero" ? "mb-6" : "mb-10")}>
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.18em]",
                t.meta
              )}
            >
              Growth Strategy
            </span>
            <span className={cn("text-xs tabular-nums", t.meta)}>{percent}%</span>
          </div>
          <div
            className={cn("h-[3px] w-full overflow-hidden", t.progressTrack)}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form progress"
          >
            <motion.div
              className={cn("h-full", t.progressBar)}
              initial={false}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {/* ── Step 1: services ── */}
        {!isSuccess && step === 0 && (
          <motion.section
            key="step-0"
            {...slide}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <StepHeading
              t={t}
              headingRef={headingRef}
              step="01 / 03"
              title="What can we help you grow?"
              body="Select the services that best match your goals and we'll prepare a strategy around them."
            />

            <div className="mb-7 grid gap-2 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((option) => {
                const selected = services.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "group relative flex min-h-[62px] cursor-pointer items-center justify-between gap-3 border px-4 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 focus-within:ring-offset-transparent motion-reduce:transition-none",
                      selected ? t.optionSelected : t.optionIdle
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      onChange={() => toggleService(option.value)}
                    />
                    <span
                      className={cn(
                        "font-semibold",
                        variant === "hero" ? "text-[13px]" : "text-[15px]"
                      )}
                    >
                      {option.label}
                    </span>
                    <ArrowUpRight
                      className={cn(
                        "size-4 shrink-0 transition-all duration-200",
                        selected ? t.optionArrowOn : t.optionArrowOff
                      )}
                      aria-hidden
                    />
                  </label>
                );
              })}
            </div>

            {serviceError && (
              <p
                role="alert"
                className="-mt-3 mb-4 text-xs font-medium text-red-400"
              >
                Please select at least one service.
              </p>
            )}

            <div
              className={cn(
                "flex items-center justify-between gap-4",
                variant === "hero" ? "mt-6" : "mt-9"
              )}
            >
              {variant === "dialog" && <span />}
              <Button type="button" onClick={handleNext} className={t.primary}>
                Continue
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Button>
            </div>
          </motion.section>
        )}

        {/* ── Step 2: business details ── */}
        {!isSuccess && step === 1 && (
          <motion.section
            key="step-1"
            {...slide}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <StepHeading
              t={t}
              headingRef={headingRef}
              step="02 / 03"
              title="Tell us about your business."
              body="A little context helps us prepare a strategy that's actually useful to you."
            />

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field t={t} label="First Name" required error={errors.firstName}>
                  <Input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    className={t.input}
                    {...inputProps}
                  />
                </Field>
                <Field t={t} label="Last Name">
                  <Input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className={t.input}
                    {...inputProps}
                  />
                </Field>
              </div>

              <Field t={t} label="Work Email" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={t.input}
                  {...inputProps}
                />
              </Field>

              <Field t={t} label="Company Name">
                <Input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Your company name"
                  autoComplete="organization"
                  className={t.input}
                  {...inputProps}
                />
              </Field>

              <Field t={t} label="Website">
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                  autoComplete="url"
                  className={t.input}
                  {...inputProps}
                />
              </Field>

              <Field t={t} label="Phone / WhatsApp">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={t.input}
                  {...inputProps}
                />
              </Field>

              <Field t={t} label="Monthly Marketing Budget">
                <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                  <SelectTrigger
                    className={cn(
                      t.input,
                      variant === "hero" &&
                        "border-white/12 bg-white/[0.06] text-white data-[placeholder]:text-white/35"
                    )}
                    aria-label="Monthly marketing budget"
                  >
                    <SelectValue placeholder="Select your budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-4",
                variant === "hero" ? "mt-6" : "mt-9"
              )}
            >
              <Button type="button" onClick={handleBack} className={t.back}>
                ← Back
              </Button>
              <Button type="button" onClick={handleNext} className={t.primary}>
                Continue
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Button>
            </div>
          </motion.section>
        )}

        {/* ── Step 3: goals ── */}
        {!isSuccess && step === 2 && (
          <motion.section
            key="step-2"
            {...slide}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <StepHeading
              t={t}
              headingRef={headingRef}
              step="03 / 03"
              title="What's your biggest growth goal?"
              body="Tell us what you're trying to achieve so we can aim at the highest-impact work."
            />

            <div className="mb-5 grid gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map((option) => {
                const selected = form.goal === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "relative flex min-h-[58px] cursor-pointer items-center border px-4 py-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 focus-within:ring-offset-transparent motion-reduce:transition-none",
                      selected ? t.optionSelected : t.optionIdle
                    )}
                  >
                    <input
                      type="radio"
                      name="growth-plan-goal"
                      value={option.value}
                      checked={selected}
                      onChange={() => set("goal", option.value)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "font-semibold",
                        variant === "hero" ? "text-[13px]" : "text-sm"
                      )}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <Field t={t} label="Tell us more about your goals">
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="What are you currently struggling with?"
                className={t.textarea}
              />
            </Field>

            {submitError && (
              <p role="alert" className="mt-4 text-xs font-medium text-red-400">
                {submitError}
              </p>
            )}

            <div
              className={cn(
                "flex items-center justify-between gap-4",
                variant === "hero" ? "mt-6" : "mt-9"
              )}
            >
              <Button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className={t.back}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className={t.primary}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  <>
                    Start My Growth Plan
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </>
                )}
              </Button>
            </div>

            <ul
              className={cn(
                "mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]",
                t.trust
              )}
            >
              <li className="flex items-center gap-1.5">
                <Check className="size-3 text-brand-400" aria-hidden /> Free strategy consultation
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3 text-brand-400" aria-hidden /> No commitment
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3 text-brand-400" aria-hidden /> Confidential
              </li>
            </ul>
          </motion.section>
        )}

        {/* ── Success ── */}
        {isSuccess && (
          <motion.section
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="py-4 text-center"
          >
            <div
              className={cn(
                "mx-auto mb-5 flex size-16 items-center justify-center rounded-full",
                t.successBadge
              )}
            >
              <Check className="size-7" aria-hidden />
            </div>
            <h2 ref={headingRef} tabIndex={-1} className={t.successTitle}>
              You&apos;re on the list.
            </h2>
            <p className={t.successBody}>
              Thanks for reaching out. Our growth team will review your information
              and get back to you shortly.
            </p>
            <Button
              type="button"
              onClick={reset}
              className={cn(t.primary, "mt-6")}
            >
              Submit another request
            </Button>
          </motion.section>
        )}
      </AnimatePresence>
    </form>
  );
}

type Tone = (typeof TONE)[keyof typeof TONE];

function StepHeading({
  t,
  headingRef,
  step,
  title,
  body,
}: {
  t: Tone;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <header className="mb-6">
      <span
        className={cn(
          "mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.2em]",
          t.meta
        )}
      >
        {step}
      </span>
      <h2 ref={headingRef} tabIndex={-1} className={t.heading}>
        {title}
      </h2>
      <p className={t.body}>{body}</p>
    </header>
  );
}

function Field({
  t,
  label,
  required,
  error,
  children,
}: {
  t: Tone;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={t.fieldLabel}>
        {label}
        {required && (
          <span className="ml-1 text-brand-400" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-[11px] font-medium text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}