"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  Quote,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article, ArticleSection } from "@/data/blog";
import { ARTICLES } from "@/data/blog";
import { useScheduler } from "./scheduler-context";

export function ArticleView({ article }: { article: Article }) {
  const { openScheduler } = useScheduler();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [article.slug]);

  const related = ARTICLES.filter(
    (a) => a.slug !== article.slug && a.category === article.category
  ).slice(0, 3);

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
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80 truncate">{article.category}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
          >
            {article.category}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.1]"
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-white/70 text-pretty"
          >
            {article.excerpt}
          </motion.p>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 flex items-center gap-4 text-sm text-white/50"
          >
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <div className="text-white/80 font-medium text-sm">
                  {article.author.name}
                </div>
                <div className="text-xs">{article.author.role}</div>
              </div>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ────────── ARTICLE BODY ────────── */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-3xl container-px">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {article.content.map((section, i) => (
              <ArticleSectionBlock key={i} section={section} />
            ))}
          </motion.div>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author CTA */}
          <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-6 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                G
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
                  Written by
                </div>
                <div className="font-semibold">{article.author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {article.author.role} at Climbix Marketing
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We help ambitious businesses turn search visibility into
                  qualified leads and revenue through SEO, AI Search
                  Optimization, and data-driven growth strategies.
                </p>
                <Button
                  onClick={() =>
                    openScheduler({
                      source: `blog-article-${article.slug}-cta`,
                    })
                  }
                  size="sm"
                  className="mt-4 bg-brand-600 hover:bg-brand-700 text-white"
                >
                  Get a free strategy call
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── RELATED ARTICLES ────────── */}
      {related.length > 0 && (
        <section className="py-16 lg:py-20 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-7xl container-px">
            <h2 className="text-2xl font-bold tracking-tight mb-8">
              Related articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {related.map((relArticle, i) => (
                <motion.div
                  key={relArticle.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group relative rounded-2xl border border-border bg-card overflow-hidden card-hover hover:border-brand-500/40"
                >
                  <Link
                    href={`/blog/${relArticle.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={relArticle.title}
                  />
                  <div
                    className={`relative h-28 bg-gradient-to-br ${relArticle.heroImage} flex items-center justify-center`}
                  >
                    <div className="absolute inset-0 hero-grid opacity-30" aria-hidden />
                    <span className="relative text-xs font-mono text-white/70 uppercase tracking-wider">
                      {relArticle.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-muted-foreground mb-2">
                      {relArticle.readTime}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {relArticle.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
            Turn these insights into actual growth.
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
            Get a free strategy call and we'll show you how to apply these
            tactics to your business — with a custom growth plan.
          </p>
          <div className="mt-8">
            <Button
              onClick={() =>
                openScheduler({ source: `blog-article-${article.slug}-final-cta` })
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

function ArticleSectionBlock({ section }: { section: ArticleSection }) {
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
            <li key={i} className="flex items-start gap-2.5 text-base text-foreground/80 leading-relaxed">
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
    case "raw_html":
      return (
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h3:text-xl prose-p:text-foreground/80 prose-p:leading-relaxed prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-a:text-brand-600 prose-a:underline hover:prose-a:text-brand-700 prose-img:rounded-xl prose-img:max-w-full prose-hr:my-6 prose-hr:border-border prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-lg"
          dangerouslySetInnerHTML={{ __html: section.html }}
        />
      );
    default:
      return null;
  }
}
