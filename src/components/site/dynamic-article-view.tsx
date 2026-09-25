"use client";

import * as React from "react";
import { ArticleView } from "./article-view";
import { getArticle, type Article } from "@/data/blog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "./use-seo";

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

// Check if content is HTML (from WYSIWYG editor) or JSON (legacy format)
function isHTMLContent(content: string): boolean {
  const trimmed = content.trim();
  return (
    trimmed.startsWith("<") &&
    (trimmed.includes("<p") ||
      trimmed.includes("<h") ||
      trimmed.includes("<ul") ||
      trimmed.includes("<ol") ||
      trimmed.includes("<div") ||
      trimmed.includes("<blockquote"))
  );
}

// Convert HTML content to a single raw HTML section for rendering
function htmlToSections(html: string): Article["content"] {
  return [{ type: "raw_html" as const, html }];
}

function dbPostToArticle(post: DBPost): Article {
  let parsedContent: Article["content"] = [];

  if (isHTMLContent(post.content)) {
    // New WYSIWYG HTML content
    parsedContent = htmlToSections(post.content);
  } else {
    // Legacy JSON content
    try {
      parsedContent = JSON.parse(post.content);
    } catch {
      parsedContent = [{ type: "p", text: post.excerpt }];
    }
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
  };
}

export function DynamicArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);

  // SEO: update document title and meta tags based on article
  useSEO(
    article
      ? {
          title: `${article.title} | Climbix Marketing Blog`,
          description: article.excerpt,
          ogImage: article.heroImage,
        }
      : null
  );

  React.useEffect(() => {
    (async () => {
      setLoading(true);

      // First check static articles
      const staticArticle = getArticle(slug);
      if (staticArticle) {
        setArticle(staticArticle);
        setLoading(false);
        return;
      }

      // Then check DB
      try {
        const res = await fetch("/api/blog-posts");
        const data = await res.json();
        const dbPost = (data.posts || []).find((p: DBPost) => p.slug === slug);
        if (dbPost && dbPost.status === "published") {
          setArticle(dbPostToArticle(dbPost));
        } else {
          setArticle(null);
        }
      } catch (e) {
        console.error(e);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    })();
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

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-4">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="#blog"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:underline"
          >
            ← Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return <ArticleView article={article} />;
}
