"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Search,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ARTICLES, BLOG_CATEGORIES, type Article } from "@/data/blog";
import { useScheduler } from "./scheduler-context";

type DBPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | null;
  tags: string | null;
  author: string;
  heroImage: string | null;
  readTime: string;
  status: string;
  featured: boolean;
  publishedAt: string;
};

// Convert a DB blog post to the Article shape used by the UI
function dbPostToArticle(post: DBPost): Article & { _db?: boolean } {
  let parsedContent: Article["content"] = [];
  try {
    parsedContent = JSON.parse(post.content);
  } catch {
    parsedContent = [{ type: "p", text: post.excerpt }];
  }

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category || "Blog",
    readTime: post.readTime || "5 min read",
    date: post.publishedAt,
    author: { name: post.author, role: "Contributor" },
    heroImage: post.heroImage || "from-brand-500/20 to-brand-700/10",
    tags: post.tags ? post.tags.split(",").map((t) => t.trim()) : [],
    content: parsedContent,
    _db: true,
  };
}

export function BlogView({
  initialPosts,
}: {
  initialPosts?: Article[];
}) {
  const { openScheduler } = useScheduler();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [dbPosts, setDbPosts] = React.useState<DBPost[]>([]);

  // Fetch DB blog posts client-side (only when not server-seeded)
  React.useEffect(() => {
    if (initialPosts) return;
    (async () => {
      try {
        const res = await fetch("/api/blog-posts");
        const data = await res.json();
        const published = (data.posts || []).filter(
          (p: DBPost) => p.status === "published"
        );
        setDbPosts(published);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [initialPosts]);

  // Server already merges DB overrides with static articles; fall back to a
  // client-side merge only when no server data was passed.
  const allArticles = React.useMemo(() => {
    if (initialPosts && initialPosts.length) return initialPosts;
    const dbArticles = dbPosts.map(dbPostToArticle);
    return [...dbArticles, ...ARTICLES];
  }, [initialPosts, dbPosts]);

  // Build dynamic categories from DB + static
  const allCategories = React.useMemo(() => {
    const cats = new Set(BLOG_CATEGORIES.filter((c) => c !== "All"));
    allArticles.forEach((a) => cats.add(a.category));
    return ["All", ...Array.from(cats)];
  }, [allArticles]);

  const filtered = React.useMemo(() => {
    let result = allArticles;
    if (category !== "All") {
      result = result.filter((a) => a.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allArticles, search, category]);

  // Pagination
  const POSTS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Changing the filters resets the page in the same event rather than in an
  // effect. The effect version rendered once with the new filters but the old
  // page number, which can briefly page past the end of the result set.
  const applySearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const applyCategory = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const totalPages = Math.ceil(rest.length / POSTS_PER_PAGE);
  const paginatedRest = rest.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div>
      {/* ────────── HERO ────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-16 lg:pb-20">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />

        <div className="relative mx-auto max-w-7xl container-px">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to website
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">Blog</span>
          </motion.div>

          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-xs font-medium text-brand-200"
            >
              <FileText className="size-3.5" />
              Climbix Marketing Blog
            </motion.div>

            <motion.h1
              initial={{ opacity: 1, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
            >
              Insights on SEO, AI search,{" "}
              <span className="gradient-text">and growth.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 1, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-white/70 max-w-xl text-pretty"
            >
              Practical strategies, frameworks, and case studies on how to turn
              search visibility into qualified leads and revenue. No fluff —
              just what actually works.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ────────── FILTERS ────────── */}
      <section className="sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl container-px py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => applySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={applyCategory}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ────────── FEATURED ARTICLE ────────── */}
      {featured && (
        <section className="py-12 lg:py-16 bg-background">
          <div className="mx-auto max-w-7xl container-px">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-4">
              Featured Article
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-3xl border border-border bg-card overflow-hidden card-hover hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5"
            >
              <Link
                href={`/blog/${featured.slug}`}
                className="absolute inset-0 z-10"
                aria-label={featured.title}
              />
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Visual */}
                <div
                  className={`relative h-48 lg:h-auto bg-gradient-to-br ${featured.heroImage} flex items-center justify-center p-8`}
                >
                  <div className="absolute inset-0 hero-grid opacity-30" aria-hidden />
                  <div className="relative text-center">
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider mb-2">
                      {featured.category}
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold gradient-text">
                      {featured.title.charAt(0)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 font-semibold">
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {featured.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(featured.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 group-hover:gap-2.5 transition-all">
                    Read article
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ────────── ARTICLE GRID ────────── */}
      {rest.length > 0 && (
        <section className="pb-16 lg:pb-20 bg-background">
          <div className="mx-auto max-w-7xl container-px">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {filtered.length === 0 ? "No articles found" : `All articles (${filtered.length})`}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {paginatedRest.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group rounded-2xl border border-border bg-card overflow-hidden card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5"
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={article.title}
                  />
                  <div
                    className={`relative h-32 bg-gradient-to-br ${article.heroImage} flex items-center justify-center`}
                  >
                    <div className="absolute inset-0 hero-grid opacity-30" aria-hidden />
                    <span className="relative text-xs font-mono text-white/70 uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {article.readTime}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(article.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-9 text-sm font-medium rounded-lg border transition-colors ${
                      currentPage === page
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ────────── NEWSLETTER CTA ────────── */}
      <section className="py-16 lg:py-20 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-4xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Get growth insights in your inbox
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Weekly tactics on SEO, AI search, and lead generation. No fluff, no
            spam — just what actually works.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@company.com"
              className="flex-1"
            />
            <Button
              onClick={() => openScheduler({ source: "blog-newsletter-cta" })}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Subscribe
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Join 2,000+ marketers getting weekly growth tactics.
          </p>
        </div>
      </section>
    </div>
  );
}
