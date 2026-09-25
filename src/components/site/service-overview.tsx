import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getServiceIcon, type ServiceContent } from "@/data/services";
import { getAllServices } from "@/lib/service-data";

/**
 * Server-rendered overview of all services — the full admin-managed catalog
 * (DB rows merged over static defaults) with SEO intro copy.
 */
export async function ServiceOverview() {
  const services = await getAllServices();
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200">
              <CheckCircle2 className="size-3.5" />
              Our Services
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              Growth services that{" "}
              <span className="gradient-text">work as one system.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty">
              SEO, AI search optimization, lead generation, content, paid
              media, and CRO — most agencies sell these as separate
              subscriptions. We deploy them as one connected growth system,
              because that&apos;s how your customers actually experience you.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="relative py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {services.map((s: ServiceContent) => {
              const Icon = getServiceIcon(s.icon);
              const points = s.cardPoints ?? [];
              return (
                <div
                  key={s.slug}
                  className={`group relative rounded-2xl border border-border bg-card p-6 card-hover hover:shadow-xl hover:shadow-black/[0.04] ${s.border}`}
                >
                  <Link
                    href={`/services/${s.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={s.name}
                  />
                  <div
                    className={`size-12 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-5 ring-1 ring-inset ring-black/5`}
                  >
                    <Icon className="size-6 text-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                  <p className="text-xs text-brand-700 font-medium mt-0.5">
                    {s.tagline}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {s.cardDesc}
                  </p>
                  <ul className="mt-4 grid grid-cols-2 gap-1.5">
                    {points.map((p) => (
                      <li
                        key={p}
                        className="inline-flex items-center gap-1.5 text-xs text-foreground/80"
                      >
                        <CheckCircle2 className="size-3.5 text-brand-500 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 opacity-0 group-hover:opacity-100 transition-all">
                    Learn more
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
