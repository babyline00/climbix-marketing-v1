"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Building2,
  Mail,
  Target,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent, getUtmFields } from "@/lib/track-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  SECTION_CONTENT_DEFAULTS,
  type FreeAuditContent,
} from "@/lib/section-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type AuditResult = {
  score: number;
  seo: number;
  technical: number;
  speed: number;
  content: number;
  backlinks: number;
  competitors: number;
  findings: { label: string; status: "good" | "warning" | "bad"; note: string }[];
};

const SAMPLE_RESULTS: AuditResult = {
  score: 72,
  seo: 78,
  technical: 65,
  speed: 58,
  content: 81,
  backlinks: 64,
  competitors: 70,
  findings: [
    {
      label: "Title & meta tags",
      status: "good",
      note: "Most pages have optimized titles — keep iterating on CTR.",
    },
    {
      label: "Core Web Vitals",
      status: "warning",
      note: "LCP above 2.5s on mobile — image optimization needed.",
    },
    {
      label: "Indexed pages",
      status: "good",
      note: "92% of submitted URLs are indexed in Google Search Console.",
    },
    {
      label: "Structured data",
      status: "bad",
      note: "Missing Organization and FAQ schema — limits AI citations.",
    },
    {
      label: "Backlink profile",
      status: "warning",
      note: "Domain authority 38 — competitors average 51. Build digital PR.",
    },
    {
      label: "Content gaps",
      status: "bad",
      note: "47 high-intent keywords unaddressed vs. top 3 competitors.",
    },
  ],
};

export function FreeAudit({ content }: { content?: Partial<FreeAuditContent> }) {
  const defaults = SECTION_CONTENT_DEFAULTS["free-audit"];
  const eyebrow = content?.eyebrow || defaults.eyebrow;
  const title = content?.title || defaults.title;
  const intro = content?.intro || defaults.intro;
  const bullets =
    content?.bullets && content.bullets.length > 0
      ? content.bullets
      : defaults.bullets;
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">(
    "idle"
  );
  const [form, setForm] = React.useState({
    website: "",
    business: "",
    email: "",
    goal: "",
  });
  const [result, setResult] = React.useState<AuditResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.website || !form.email) return;
    setStatus("loading");
    // Simulate audit computation
    await new Promise((r) => setTimeout(r, 1800));
    setResult(SAMPLE_RESULTS);
    setStatus("done");

    // Persist lead to database (fire and forget)
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.business || null,
          email: form.email,
          company: form.business || null,
          website: form.website,
          goal: form.goal || null,
          source: "free-audit",
          auditScore: SAMPLE_RESULTS.score,
          auditData: SAMPLE_RESULTS,
          ...getUtmFields(),
        }),
      });
      trackEvent("generate_lead", { source: "free-audit", website: form.website });
    } catch (err) {
      console.error("Failed to save audit lead:", err);
    }
  };

  return (
    <section
      id="free-audit"
      className="relative py-20 lg:py-28 bg-ink-900 text-white overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 hero-radial opacity-70" aria-hidden />
      <div className="absolute -top-20 right-10 size-72 rounded-full bg-brand-500/20 blur-3xl animate-float" aria-hidden />

      <div className="relative mx-auto max-w-7xl container-px">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: pitch */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200"
            >
              <Sparkles className="size-3.5" />
              {eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 text-3xl lg:text-5xl font-bold tracking-tight text-balance"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-lg text-white/70 text-pretty"
            >
              {intro}
            </motion.p>

            <div className="mt-8 space-y-3">
              {bullets.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="size-6 rounded-md bg-brand-500/15 ring-1 ring-inset ring-brand-500/30 flex items-center justify-center">
                    <CheckCircle2 className="size-3.5 text-brand-300" />
                  </div>
                  <span className="text-sm text-white/80">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-white/50">
              <div className="flex -space-x-2">
                {["A", "K", "M", "S"].map((n) => (
                  <div
                    key={n}
                    className="size-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-ink-900 flex items-center justify-center text-[10px] font-bold"
                  >
                    {n}
                  </div>
                ))}
              </div>
              <span>120+ businesses audited this month</span>
            </div>
          </div>

          {/* Right: form / results */}
          <div className="relative">
            <Card className="bg-white/[0.04] backdrop-blur-xl border-white/10 text-white shadow-2xl shadow-black/20 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="size-4 text-brand-300" />
                  Run my free growth audit
                </CardTitle>
                <CardDescription className="text-white/60">
                  Takes 60 seconds. No credit card required.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <AnimatePresence mode="wait">
                  {status === "done" && result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/5 border border-brand-500/20 p-5 mb-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">
                              Growth Score
                            </div>
                            <div className="text-4xl font-bold gradient-text">
                              {result.score}
                              <span className="text-base text-white/40">
                                /100
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-xs text-white/60">
                            <div>Audited: {form.website || "yourwebsite.com"}</div>
                            <div className="mt-1 text-brand-300 font-medium">
                              Ready for strategy call →
                            </div>
                          </div>
                        </div>

                        {/* Sub scores */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {[
                            { label: "SEO", v: result.seo },
                            { label: "Technical", v: result.technical },
                            { label: "Page Speed", v: result.speed },
                            { label: "Content", v: result.content },
                            { label: "Backlinks", v: result.backlinks },
                            { label: "Competitors", v: result.competitors },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl bg-white/5 border border-white/10 p-2.5"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-white/60">{s.label}</span>
                                <span className="font-bold">{s.v}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.v}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={`h-full rounded-full ${
                                    s.v >= 75
                                      ? "bg-brand-400"
                                      : s.v >= 60
                                        ? "bg-amber-400"
                                        : "bg-rose-400"
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Findings */}
                      <Accordion
                        type="multiple"
                        defaultValue={["findings"]}
                        className="w-full"
                      >
                        <AccordionItem
                          value="findings"
                          className="border-white/10"
                        >
                          <AccordionTrigger className="text-sm font-medium hover:no-underline">
                            Key findings ({result.findings.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              {result.findings.map((f) => (
                                <li
                                  key={f.label}
                                  className="flex items-start gap-2.5 text-xs"
                                >
                                  {f.status === "good" ? (
                                    <CheckCircle2 className="size-4 text-brand-400 mt-0.5 shrink-0" />
                                  ) : f.status === "warning" ? (
                                    <AlertCircle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                                  ) : (
                                    <AlertCircle className="size-4 text-rose-400 mt-0.5 shrink-0" />
                                  )}
                                  <div>
                                    <span className="font-semibold">
                                      {f.label}
                                    </span>
                                    <span className="text-white/60">
                                      {" "}— {f.note}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="mt-5 flex flex-col sm:flex-row gap-2">
                        <Button
                          className="flex-1 bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold"
                          asChild
                        >
                          <Link href="/contact">
                            Book free strategy call
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setStatus("idle");
                            setResult(null);
                            setForm({
                              website: "",
                              business: "",
                              email: "",
                              goal: "",
                            });
                          }}
                        >
                          Audit another
                        </Button>
                      </div>
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
                      <div className="space-y-1.5">
                        <Label htmlFor="website" className="text-white/80 text-xs">
                          Website URL
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://yourcompany.com"
                            value={form.website}
                            onChange={(e) =>
                              setForm({ ...form, website: e.target.value })
                            }
                            required
                            className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="business"
                          className="text-white/80 text-xs"
                        >
                          Business name
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                          <Input
                            id="business"
                            placeholder="Acme Inc."
                            value={form.business}
                            onChange={(e) =>
                              setForm({ ...form, business: e.target.value })
                            }
                            className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-white/80 text-xs">
                          Work email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                            required
                            className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-white/80 text-xs">
                          Monthly marketing goal
                        </Label>
                        <Select
                          value={form.goal}
                          onValueChange={(v) =>
                            setForm({ ...form, goal: v })
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/30">
                            <div className="flex items-center gap-2">
                              <Target className="size-4 text-white/40" />
                              <SelectValue placeholder="Select your primary goal" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="traffic">
                              Increase organic traffic
                            </SelectItem>
                            <SelectItem value="leads">
                              Generate more qualified leads
                            </SelectItem>
                            <SelectItem value="revenue">
                              Grow revenue / pipeline
                            </SelectItem>
                            <SelectItem value="ai">
                              Rank in AI search (ChatGPT, Gemini)
                            </SelectItem>
                            <SelectItem value="cro">
                              Improve conversion rate
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-lg shadow-brand-500/30"
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Analyzing your website…
                          </>
                        ) : (
                          <>
                            Get my free audit
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-[11px] text-white/40 text-center">
                        We respect your privacy. No spam, ever. Your audit
                        arrives in your inbox within 24 hours.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 lg:-right-5 rounded-full bg-brand-500 text-ink-900 text-xs font-bold px-3 py-1.5 shadow-lg">
              $0 — Free forever
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
