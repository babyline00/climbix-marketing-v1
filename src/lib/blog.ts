import { db } from "@/lib/db";
import { ARTICLES, getArticle, type Article } from "@/data/blog";

/**
 * Server-side blog data layer.
 * Merges static seed articles with DB posts (admin-created), preferring DB.
 */

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
  publishedAt: Date;
};

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

function htmlToSections(html: string): Article["content"] {
  return [{ type: "raw_html" as const, html }];
}

export function dbPostToArticle(post: DBPost): Article {
  let parsedContent: Article["content"] = [];
  if (isHTMLContent(post.content)) {
    parsedContent = htmlToSections(post.content);
  } else {
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
    date: post.publishedAt.toISOString(),
    author: { name: post.author, role: "Contributor" },
    heroImage: post.heroImage || "from-brand-500/20 to-brand-700/10",
    tags: post.tags ? post.tags.split(",").map((t) => t.trim()) : [],
    content: parsedContent,
  };
}

/** All published articles — DB posts override static seed articles by slug, sorted newest first. */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
    const dbArticles = posts.map(dbPostToArticle);
    const dbSlugs = new Set(dbArticles.map((a) => a.slug));
    return [...dbArticles, ...ARTICLES.filter((a) => !dbSlugs.has(a.slug))].sort(
      (a, b) =>
        (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0)
    );
  } catch {
    return ARTICLES;
  }
}

/** One article by slug — DB override wins, then static seed article: null. */
export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  try {
    const post = await db.blogPost.findFirst({
      where: { slug, status: "published" },
    });
    if (post) return dbPostToArticle(post);
  } catch {
    // fall through to static
  }
  return getArticle(slug) ?? null;
}
