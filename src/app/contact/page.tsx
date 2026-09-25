import type { Metadata } from "next";
import { Mail, Globe2, MessageSquare, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.contact;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/contact" },
  openGraph: { title: meta.title, description: meta.description, url: "/contact", type: "website" },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    desc: "hello@climbixmarketing.com",
    href: "mailto:hello@climbixmarketing.com",
    note: "Replies within one business day",
  },
  {
    icon: CalendarCheck,
    title: "Book a strategy call",
    desc: "Free 30-minute consult",
    href: "/strategy-call",
    note: "Pick a time that suits you",
  },
  {
    icon: MessageSquare,
    title: "Ask the AI assistant",
    desc: "Bottom-right chat bubble",
    href: null,
    note: "Instant answers, 24/7",
  },
];

export default async function ContactPage() {
  const override = await getPageOverride("contact");
  if (override)
    return (
      <PageShell>
        <CmsPageBody page={override} />
      </PageShell>
    );
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Contact", url: "/contact" },
            ])
          ),
        }}
      />
      <PageHero
        eyebrow="Contact"
        title="Tell us where you want to grow."
        highlight="We'll tell you how."
        intro="Whether you have a fully-formed brief or just a nagging feeling that your marketing should be performing better — send it over. You'll get a thoughtful reply from a strategist within one business day, not an automated drip sequence."
      />

      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl container-px grid lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-sm">
              <h2 className="text-xl font-bold">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The more context you share, the more useful our first reply
                will be.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="lg:col-span-2 space-y-4">
            {CHANNELS.map((c) => {
              const inner = (
                <>
                  <div className="size-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 ring-1 ring-inset ring-brand-500/20 flex items-center justify-center">
                    <c.icon className="size-5 text-brand-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-foreground/80">{c.desc}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.note}
                    </p>
                  </div>
                </>
              );
              return c.href ? (
                <Link
                  key={c.title}
                  href={c.href}
                  className="block rounded-2xl border border-border bg-card p-5 card-hover hover:border-brand-500/40"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  {inner}
                </div>
              );
            })}

            <div className="rounded-2xl border border-border bg-muted/30 p-5">
              <div className="flex items-start gap-3">
                <Globe2 className="size-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Where we work</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Remote-first, serving clients across the USA, UK, Canada,
                    Australia, UAE, Germany, and 12+ more countries.{" "}
                    <Link
                      href="/locations"
                      className="text-brand-700 font-medium hover:underline"
                    >
                      See all locations
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
