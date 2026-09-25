"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Linkedin, Twitter, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/components/site/site-content-context";
import { useServices } from "@/components/site/services-context";
import { INDUSTRIES } from "@/data/industries";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

const STATIC_COLUMNS: FooterColumn[] = [
  {
    title: "Industries",
    links: INDUSTRIES.map((i) => ({
      label: i.name,
      href: `/industries/${i.slug}`,
    })),
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Our Process", href: "/process" },
      { label: "Pricing", href: "/pricing" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "SEO Guides", href: "/seo-guides" },
      { label: "Free Tools", href: "/free-tools" },
      { label: "Free Growth Audit", href: "/free-growth-audit" },
      { label: "Strategy Call", href: "/strategy-call" },
      { label: "Locations", href: "/locations" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const { content } = useSiteContent();
  const services = useServices();

  const footerNav: FooterColumn[] = [
    {
      title: "Services",
      links: [
        ...services.slice(0, 6).map((s) => ({
          label: s.name,
          href: `/services/${s.slug}`,
        })),
        { label: "All Services", href: "/services" },
      ],
    },
    ...STATIC_COLUMNS,
  ];

  const SOCIAL = [
    { icon: Linkedin, href: content["social.linkedin"] || "#", label: "LinkedIn" },
    { icon: Twitter, href: content["social.twitter"] || "#", label: "Twitter / X" },
    { icon: Mail, href: `mailto:${content["contact.email"] || "hello@climbixmarketing.com"}`, label: "Email" },
  ];

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer className="bg-ink-900 text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        {/* Top: brand + newsletter */}
        <div className="grid lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 17l6-6 4 4 7-7" />
                  <path d="M14 8h6v6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Climb<span className="gradient-text">ix</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/60 max-w-sm leading-relaxed">
              Global SEO, AI Search Optimization, and Lead Generation agency.
              We turn digital visibility into qualified leads and revenue.
            </p>
            <p className="mt-4 text-xs text-brand-300 font-medium">
              Visibility. Leads. Growth.
            </p>

            {/* Contact info from DB */}
            <div className="mt-5 space-y-1.5 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-brand-300 shrink-0" />
                <a
                  href={`mailto:${content["contact.email"] || "hello@climbixmarketing.com"}`}
                  className="hover:text-white transition-colors"
                >
                  {content["contact.email"] || "hello@climbixmarketing.com"}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="size-3.5 text-brand-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {content["contact.address"] ||
                    "Remote-first · Serving clients in USA, UK, Canada, Australia, UAE & beyond"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6">
              <h3 className="text-base font-semibold">
                Get growth insights in your inbox
              </h3>
              <p className="mt-1.5 text-sm text-white/60">
                Weekly tactics on SEO, AI search, and lead generation. No fluff,
                no spam.
              </p>
              <form
                onSubmit={onSubscribe}
                className="mt-4 flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-500/60 focus-visible:ring-brand-500/30"
                />
                <Button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-400 text-ink-900 font-semibold shrink-0"
                >
                  {submitted ? "Subscribed!" : "Subscribe"}
                  {!submitted && <ArrowRight className="size-4" />}
                </Button>
              </form>
              {submitted && (
                <p className="mt-2 text-xs text-brand-300">
                  Thanks! Check your inbox to confirm.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Middle: footer nav */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {footerNav.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white/80">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/55 hover:text-brand-300 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: legal + social */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center sm:text-left">
            © {new Date().getFullYear()} Climbix Marketing. All rights reserved. ·{" "}
            <Link href="#" className="hover:text-white/60">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="#" className="hover:text-white/60">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="#" className="hover:text-white/60">
              Cookies
            </Link>{" "}
            ·{" "}
            <a href="#admin" className="hover:text-white/60">
              Admin
            </a>
          </p>
          <div className="flex items-center gap-1.5">
            {SOCIAL.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="size-9 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-brand-300 hover:border-brand-500/40 transition-colors"
              >
                <s.icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
