import { CheckCircle2 } from "lucide-react";

/**
 * Shared dark hero band for standalone pages — eyebrow, H1, intro.
 * Server-renderable (no hooks), used inside PageShell.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  intro,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
      <div className="absolute inset-0 hero-radial" aria-hidden />
      <div className="relative mx-auto max-w-7xl container-px">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200">
            <CheckCircle2 className="size-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="gradient-text">{highlight}</span>
              </>
            )}
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl text-pretty">
            {intro}
          </p>
        </div>
      </div>
    </section>
  );
}
