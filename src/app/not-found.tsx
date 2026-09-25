import Link from "next/link";
import { Search, Compass, PhoneCall } from "lucide-react";
import { getPageOverride, CmsPageBody } from "@/components/site/cms-page";

export default async function NotFound() {
  const override = await getPageOverride("404");
  if (override) {
    return <CmsPageBody page={override} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
      <div className="absolute inset-0 hero-radial" aria-hidden />
      <div className="relative text-center px-6">
        <div className="text-7xl lg:text-8xl font-bold tracking-tight gradient-text">
          404
        </div>
        <h1 className="mt-4 text-2xl lg:text-3xl font-bold tracking-tight">
          This page took a wrong turn.
        </h1>
        <p className="mt-3 text-white/60 max-w-md mx-auto text-pretty">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Let&apos;s get you back to something useful.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-500/30"
          >
            <Compass className="size-4" />
            Back to Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold"
          >
            <Search className="size-4" />
            Browse the Blog
          </Link>
          <Link
            href="/strategy-call"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 py-3 text-sm font-semibold"
          >
            <PhoneCall className="size-4" />
            Book a Call
          </Link>
        </div>
      </div>
    </div>
  );
}