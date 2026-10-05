"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Loader2 } from "lucide-react";
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
 * Styling follows this project's tokens rather than hardcoded hex, so the form
 * matches the site in both light and dark. The structural cues from the design
 * reference are kept: square inputs, uppercase micro-labels, a hairline
 * progress bar, and an inverted fill on the selected option.
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
  onSuccess,
}: {
  source?: string;
  onSuccess?: () => void;
}) {
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
    // Clear a field's error as soon as the visitor edits it.
    setErrors((prev) => (prev[key as "firstName" | "email"] ? { ...prev, [key]: undefined } : prev));
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
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
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

    // Re-validate on submit: the visitor can reach step 3 by editing fields in
    // another way, and an invalid email must not reach the API.
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

    const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ");
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

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      {/* ── Progress ── */}
      {!isSuccess && (
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Growth Strategy
            </span>
            <span className="text-xs text-muted-foreground">{percent}%</span>
          </div>
          <div className="h-[3px] w-full overflow-hidden bg-border" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Form progress">
            <motion.div
              className="h-full bg-primary"
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
          <motion.section key="step-0" {...slide} transition={{ duration: 0.28, ease: "easeOut" }}>
            <StepHeading
              headingRef={headingRef}
              step="01 / 03"
              title="What can we help you grow?"
              body="Select the services that best match your current growth goals. We'll use this to prepare a strategy for your business."
            />

            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((option) => {
                const selected = services.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "group relative flex min-h-[78px] cursor-pointer items-center justify-between gap-4 border px-5 py-5 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 motion-reduce:transition-none",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      onChange={() => toggleService(option.value)}
                    />
                    <span className="text-[15px] font-semibold">{option.label}</span>
                    <ArrowUpRight
                      className={cn(
                        "size-4 shrink-0 transition-opacity duration-200",
                        selected ? "opacity-100" : "opacity-35"
                      )}
                      aria-hidden
                    />
                  </label>
                );
              })}
            </div>

            {serviceError && (
              <p role="alert" className="-mt-4 mb-5 text-xs font-medium text-destructive">
                Please select at least one service.
              </p>
            )}

            <div className="mt-9 flex items-center justify-between gap-4">
              <span />
              <Button
                type="button"
                onClick={handleNext}
                className="group inline-flex min-h-[54px] items-center gap-5 rounded-none bg-foreground px-6 text-[13px] font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90"
              >
                Continue
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Button>
            </div>
          </motion.section>
        )}

        {/* ── Step 2: business details ── */}
        {!isSuccess && step === 1 && (
          <motion.section key="step-1" {...slide} transition={{ duration: 0.28, ease: "easeOut" }}>
            <StepHeading
              headingRef={headingRef}
              step="02 / 03"
              title="Tell us about your business."
              body="A little context helps us understand your business and prepare a more useful growth strategy."
            />

            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First Name" required error={errors.firstName}>
                  <Input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    className="h-[52px] rounded-none bg-card"
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className="h-[52px] rounded-none bg-card"
                  />
                </Field>
              </div>

              <Field label="Work Email" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className="h-[52px] rounded-none bg-card"
                />
              </Field>

              <Field label="Company Name">
                <Input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Your company name"
                  autoComplete="organization"
                  className="h-[52px] rounded-none bg-card"
                />
              </Field>

              <Field label="Website">
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                  autoComplete="url"
                  className="h-[52px] rounded-none bg-card"
                />
              </Field>

              <Field label="Phone / WhatsApp">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className="h-[52px] rounded-none bg-card"
                />
              </Field>

              <Field label="Monthly Marketing Budget">
                <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                  <SelectTrigger className="h-[52px] rounded-none bg-card" aria-label="Monthly marketing budget">
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

            <div className="mt-9 flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleBack}
                className="min-h-[54px] bg-transparent px-1 text-[13px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="group inline-flex min-h-[54px] items-center gap-5 rounded-none bg-foreground px-6 text-[13px] font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90"
              >
                Continue
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Button>
            </div>
          </motion.section>
        )}

        {/* ── Step 3: goals ── */}
        {!isSuccess && step === 2 && (
          <motion.section key="step-2" {...slide} transition={{ duration: 0.28, ease: "easeOut" }}>
            <StepHeading
              headingRef={headingRef}
              step="03 / 03"
              title="What's your biggest growth goal?"
              body="Tell us what you're trying to achieve. This helps us understand where we can create the biggest impact."
            />

            <div className="mb-7 grid gap-3 sm:grid-cols-2">
              {GOAL_OPTIONS.map((option) => {
                const selected = form.goal === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "relative flex min-h-[70px] cursor-pointer items-center border px-5 py-4 transition-colors duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 motion-reduce:transition-none",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:border-foreground"
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
                    <span className="text-sm font-semibold">{option.label}</span>
                  </label>
                );
              })}
            </div>

            <Field label="Tell us more about your goals">
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="What are you currently struggling with? What would you like to achieve?"
                className="min-h-[130px] resize-y rounded-none bg-card leading-relaxed"
              />
            </Field>

            {submitError && (
              <p role="alert" className="mt-5 text-xs font-medium text-destructive">
                {submitError}
              </p>
            )}

            <div className="mt-9 flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="min-h-[54px] bg-transparent px-1 text-[13px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="group inline-flex min-h-[54px] items-center gap-5 rounded-none bg-foreground px-6 text-[13px] font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/90 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  <>
                    Start My Growth Plan
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                  </>
                )}
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check className="size-3" aria-hidden /> Free strategy consultation
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3" aria-hidden /> No commitment
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3" aria-hidden /> Confidential information
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
            className="py-6 text-center"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="size-7" aria-hidden />
            </div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mb-4 text-4xl font-bold tracking-tight outline-none sm:text-5xl"
            >
              You&apos;re on the list.
            </h2>
            <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
              Thanks for reaching out. Our growth team will review your information and get back to you shortly.
            </p>
            <Button
              type="button"
              onClick={reset}
              className="mt-8 min-h-[52px] rounded-none bg-foreground px-6 text-[13px] font-bold text-background hover:bg-foreground/90"
            >
              Submit another request
            </Button>
          </motion.section>
        )}
      </AnimatePresence>
    </form>
  );
}

function StepHeading({
  headingRef,
  step,
  title,
  body,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <header className="mb-8">
      <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {step}
      </span>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] outline-none sm:text-5xl"
      >
        {title}
      </h2>
      <p className="max-w-xl leading-relaxed text-muted-foreground">{body}</p>
    </header>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold tracking-wide">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-[11px] font-medium text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}