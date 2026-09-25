"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageView } from "./page-view-context";
import { useScheduler } from "./scheduler-context";
import { useSEO } from "./use-seo";
import {
  CheckCircle2,
  Lightbulb,
  Quote,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type PageSection =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title: string; text: string };

type DBPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string;
  updatedAt: string;
};

export function PageView({ slug }: { slug: string }) {
  const { closePage } = usePageView();
  const { openScheduler } = useScheduler();
  const [page, setPage] = React.useState<DBPage | null>(null);
  const [loading, setLoading] = React.useState(true);

  // SEO: update document title and meta tags
  useSEO(
    page
      ? {
          title: `${page.title} | Climbix Marketing`,
          description: page.title,
        }
      : null
  );

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pages");
        const data = await res.json();
        const found = (data.pages || []).find(
          (p: DBPage) => p.slug === slug && p.status === "published"
        );
        setPage(found || null);
      } catch (e) {
        console.error(e);
        setPage(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 text-white pt-28 lg:pt-36 pb-20">
        <div className="mx-auto max-w-4xl container-px space-y-4">
          <Skeleton className="h-12 w-3/4 bg-white/10" />
          <Skeleton className="h-6 w-1/2 bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-5/6 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="size-12 text-slate-300 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-4">
            The page you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={closePage}
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Parse content — support both WYSIWYG HTML and legacy JSON formats
  const isHTML = page.content.trim().startsWith("<");
  let htmlContent = "";
  let sections: PageSection[] = [];

  if (isHTML) {
    htmlContent = page.content;
  } else {
    try {
      sections = JSON.parse(page.content);
    } catch {
      sections = [{ type: "p", text: page.content }];
    }
  }

  return (
    <div>
      {/* ────────── HERO ────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-4xl container-px">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8 flex-wrap"
          >
            <button
              onClick={closePage}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Home
            </button>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">{page.title}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
          >
            <FileText className="size-3.5" />
            {page.template === "about"
              ? "About"
              : page.template === "contact"
                ? "Contact"
                : page.template === "landing"
                  ? "Landing"
                  : "Page"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.1]"
          >
            {page.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 flex items-center gap-3 text-sm text-white/50"
          >
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(page.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ────────── PAGE BODY ────────── */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-3xl container-px">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {isHTML ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h3:text-xl prose-p:text-foreground/80 prose-p:leading-relaxed prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-a:text-brand-600 prose-a:underline hover:prose-a:text-brand-700 prose-img:rounded-xl prose-img:max-w-full prose-hr:my-6 prose-hr:border-border"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              sections.map((section, i) => (
                <PageSectionBlock key={i} section={section} />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ────────── FINAL CTA ────────── */}
      <section className="py-16 lg:py-20 bg-ink-900 text-white overflow-hidden">
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
            Ready to grow?
          </motion.span>
          <h2 className="mt-6 text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Let's talk about your growth.
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
            Get a free strategy call and we'll show you how to grow your
            business with data-driven marketing.
          </p>
          <div className="mt-8">
            <Button
              onClick={() =>
                openScheduler({ source: `page-${page.slug}-cta` })
              }
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

function PageSectionBlock({ section }: { section: PageSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance mt-10 first:mt-0">
          {section.text}
        </h2>
      );
    case "p":
      return (
        <p className="text-base lg:text-lg text-foreground/80 leading-relaxed">
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul className="space-y-2.5 my-2">
          {section.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-base text-foreground/80 leading-relaxed"
            >
              <CheckCircle2 className="size-5 text-brand-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-6 rounded-2xl border-l-4 border-brand-500 bg-muted/30 p-5 lg:p-6">
          <Quote className="size-6 text-brand-500/40 mb-3" />
          <p className="text-base lg:text-lg font-medium leading-relaxed text-foreground">
            {section.text}
          </p>
          {section.author && (
            <footer className="mt-3 text-sm text-muted-foreground">
              — {section.author}
            </footer>
          )}
        </blockquote>
      );
    case "callout":
      return (
        <div className="my-6 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-5 lg:p-6">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
              <Lightbulb className="size-5 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-sm text-brand-700 mb-1">
                {section.title}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {section.text}
              </p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
