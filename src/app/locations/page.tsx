import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, CheckCircle2, MapPin } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { Locations } from "@/components/site/locations";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, localBusinessJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.locations;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/locations" },
  openGraph: { title: meta.title, description: meta.description, url: "/locations", type: "website" },
};

const MARKETS = [
  {
    region: "North America",
    countries: ["United States", "Canada"],
    note: "New York, San Francisco, Toronto, Vancouver — our largest client concentration, with deep experience in competitive US/CA search markets.",
  },
  {
    region: "Europe",
    countries: ["United Kingdom", "Germany"],
    note: "London, Manchester, Berlin, Munich — including GDPR-aware analytics setups and localized keyword strategies per language and city.",
  },
  {
    region: "Middle East",
    countries: ["United Arab Emirates"],
    note: "Dubai, Abu Dhabi — multilingual campaigns (English/Arabic) and experience with high-competition real estate, hospitality, and finance verticals.",
  },
  {
    region: "Asia-Pacific",
    countries: ["Australia"],
    note: "Sydney, Melbourne — full coverage of AU search behavior, local link ecosystems, and NAP consistency for multi-location brands.",
  },
];

export default async function LocationsPage() {
  const override = await getPageOverride("locations");
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
          __html: JSON.stringify([
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Locations", url: "/locations" },
            ]),
            localBusinessJsonLd(),
          ]),
        }}
      />

      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200">
              <Globe2 className="size-3.5" />
              Global Reach, Local Expertise
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              Local strategies for{" "}
              <span className="gradient-text">every market we serve.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty">
              Search doesn&apos;t translate — it localizes. The keywords,
              competitors, review platforms, and even the way people phrase a
              purchase query differ by country and city. We build one growth
              system per market, not one PDF translated six times.
            </p>
          </div>
        </div>
      </section>

      <Locations />

      {/* Region breakdown */}
      <section className="py-16 lg:py-20 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl container-px">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Where our clients are
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            We&apos;re remote-first by design — your strategist knows your
            market, and the team behind them spans time zones so campaigns
            never sleep.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4 lg:gap-6">
            {MARKETS.map((m) => (
              <div
                key={m.region}
                className="rounded-2xl border border-border bg-card p-6 card-hover hover:border-brand-500/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <MapPin className="size-5 text-brand-600" />
                  </div>
                  <h3 className="font-semibold">{m.region}</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.countries.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground/75"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {m.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What localization includes */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-4xl container-px">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            What &quot;localized&quot; actually means here
          </h2>
          <div className="mt-8 space-y-4">
            {[
              {
                title: "Native-market keyword research",
                desc: "We research keywords in the language and phrasing your buyers use — including the colloquial terms tools like Ahrefs miss — then map them to the pages that should rank.",
              },
              {
                title: "Local competitor benchmarks",
                desc: "Your real competitors are the businesses ranking in your city and country, not the global case-study brands. We benchmark against who you're actually fighting.",
              },
              {
                title: "Country-appropriate proof and platforms",
                desc: "Reviews on Trustpilot mean little in markets where Google Reviews or Capterra dominate. We prioritize the platforms and proof your local buyers actually check.",
              },
              {
                title: "Compliance-aware execution",
                desc: "GDPR in Europe, patient-privacy rules in healthcare, financial-promotion rules in fintech — the strategy respects the regulatory reality of each market.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <CheckCircle2 className="size-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
              Not on the list? We probably still serve it.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              We&apos;ve delivered work in 18+ countries. Tell us your market
              and we&apos;ll be straight with you about whether we can help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/strategy-call"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
              >
                Book a Strategy Call
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/40 text-brand-700 hover:bg-brand-500/10 px-6 py-3 text-sm font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
