"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Building2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScheduler } from "./scheduler-context";

type Plan = {
  name: string;
  icon: typeof Zap;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  accent: string;
  border: string;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    icon: Zap,
    price: "$2,500",
    period: "/month",
    description:
      "Perfect for early-stage companies looking to establish a strong SEO foundation and start generating organic growth.",
    features: [
      "1 service focus (SEO, AI Search, or Lead Gen)",
      "Technical SEO audit & fixes",
      "Up to 4 blog articles per month",
      "Keyword research & strategy",
      "Basic performance reporting",
      "Monthly strategy call",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
    accent: "from-sky-500/10 to-sky-700/5",
    border: "border-sky-500/30",
  },
  {
    name: "Growth",
    icon: TrendingUp,
    price: "$5,000",
    period: "/month",
    description:
      "Our most popular plan for growing businesses that need a complete growth system across multiple channels.",
    features: [
      "Up to 3 services (mix & match)",
      "Full SEO + Content + Lead Gen system",
      "Up to 8 blog articles per month",
      "AI Search Optimization (GEO/AEO)",
      "Landing page optimization",
      "Bi-weekly strategy calls",
      "Custom dashboard & reporting",
      "Priority support",
    ],
    cta: "Start Growing",
    popular: true,
    accent: "from-brand-500/15 to-brand-700/10",
    border: "border-brand-500/40",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "",
    description:
      "For established companies that need a dedicated team and custom growth strategy across all channels.",
    features: [
      "All services included",
      "Dedicated growth team (3-5 specialists)",
      "Unlimited content production",
      "Multi-channel campaign management",
      "Custom integrations & automation",
      "Weekly strategy calls",
      "Custom reporting & attribution",
      "24/7 priority support",
      "Quarterly business reviews",
    ],
    cta: "Contact Sales",
    popular: false,
    accent: "from-violet-500/10 to-violet-700/5",
    border: "border-violet-500/30",
  },
];

const FAQS = [
  {
    q: "What's included in the free strategy call?",
    a: "A 30-minute call where we review your current marketing, discuss your growth goals, and provide a custom strategy recommendation. No obligation — just real value and honest advice about whether we're a good fit.",
  },
  {
    q: "Can I switch plans or cancel anytime?",
    a: "Yes. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel anytime with 30 days notice. We earn your business every month.",
  },
  {
    q: "How long until I see results?",
    a: "Most clients see meaningful results between months 3 and 6. Quick-win optimizations can deliver lifts in 30-60 days. Long-term compounding growth typically starts showing from month 4 onward.",
  },
  {
    q: "Do you work with my industry?",
    a: "We specialize in SaaS, B2B, Technology, Ecommerce, Healthcare, Real Estate, Finance, and Education. If your industry isn't listed, reach out — we'll be honest about whether we're the right fit.",
  },
  {
    q: "What if I need something not listed in the plans?",
    a: "Enterprise plans are fully customizable. For Growth and Starter plans, we can add à la carte services. Book a strategy call and we'll tailor a proposal to your specific needs.",
  },
  {
    q: "Do you offer performance guarantees?",
    a: "No ethical agency can guarantee specific rankings or revenue. What we guarantee: transparent process, weekly visibility, data-driven decisions, and relentless focus on business outcomes. If a strategy isn't working, we pivot fast.",
  },
];

export function Pricing() {
  const { openScheduler } = useScheduler();

  return (
    <div>
      {/* ────────── HERO ────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:py-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
          >
            <Sparkles className="size-3.5" />
            Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty"
          >
            Choose the plan that fits your growth stage. No hidden fees, no
            long-term contracts — just clear pricing for measurable results.
            Cancel or upgrade anytime.
          </motion.p>
        </div>
      </section>

      {/* ────────── PRICING CARDS ────────── */}
      <section className="relative py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-3xl border-2 bg-card p-6 lg:p-8 flex flex-col ${
                    plan.popular
                      ? `${plan.border} shadow-2xl shadow-brand-500/10 lg:scale-105`
                      : plan.border
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        <Sparkles className="size-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className={`rounded-2xl bg-gradient-to-br ${plan.accent} p-4 -mt-2 -mx-2 mb-6`}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-xl bg-background/80 flex items-center justify-center">
                        <Icon className="size-5 text-foreground" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-lg text-muted-foreground mb-1.5">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() =>
                      openScheduler({
                        source: `pricing-${plan.name.toLowerCase()}`,
                        service: `${plan.name} Plan Inquiry`,
                      })
                    }
                    className={`w-full mb-6 ${
                      plan.popular
                        ? "bg-brand-600 hover:bg-brand-700 text-white"
                        : "bg-background border border-input hover:bg-muted text-foreground"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" />
                  </Button>

                  {/* Features */}
                  <div className="space-y-3 mt-auto">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      What's included
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <div
                            className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              plan.popular
                                ? "bg-brand-500/15"
                                : "bg-muted"
                            }`}
                          >
                            <Check
                              className={`size-3 ${
                                plan.popular
                                  ? "text-brand-600"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Money-back guarantee banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-5 lg:p-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="size-12 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6 text-brand-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold">30-day satisfaction guarantee</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If you're not happy with our work in the first 30 days, we'll
                refund your money — no questions asked. We're confident you'll
                love the results.
              </p>
            </div>
            <Button
              onClick={() => openScheduler({ source: "pricing-guarantee" })}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Book a Free Call
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ────────── FAQ ────────── */}
      <section className="py-16 lg:py-24 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl container-px">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700">
              <HelpCircle className="size-3.5" />
              Pricing FAQ
            </div>
            <h2 className="mt-5 text-3xl lg:text-4xl font-bold tracking-tight text-balance">
              Questions about pricing
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-card px-5 data-[state=open]:border-brand-500/40 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ────────── FINAL CTA ────────── */}
      <section className="py-16 lg:py-24 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-50" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-5xl container-px text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-200"
          >
            <Sparkles className="size-3.5" />
            Still not sure?
          </motion.span>
          <h2 className="mt-6 text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Book a free strategy call to find the right plan.
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
            We'll discuss your goals, audit your current marketing, and
            recommend the best plan for your growth stage — no pressure, no
            obligation.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => openScheduler({ source: "pricing-final-cta" })}
              size="lg"
              className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shadow-xl shadow-brand-500/30 px-7"
            >
              Get Your Free Strategy
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

