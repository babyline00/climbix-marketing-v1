import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { ArticleView } from "@/components/site/article-view";
import { ARTICLES } from "@/data/blog";
import { getAllArticles, getArticleBySlug } from "@/lib/blog";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const staticSlugs = ARTICLES.map((a) => ({ slug: a.slug }));
  try {
    const all = await getAllArticles();
    const allSlugs = all.map((a) => a.slug);
    staticSlugs.push(
      ...allSlugs.filter((s) => !staticSlugs.some((x) => x.slug === s))
        .map((s) => ({ slug: s }))
    );
  } catch {
    // static-only at build time
  }
  return staticSlugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: article.title, url: `/blog/${slug}` },
    ]),
    articleJsonLd({
      title: article.title,
      description: article.excerpt,
      slug: article.slug,
      author: article.author.name,
      datePublished: article.date,
    }),
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleView article={article} />
    </PageShell>
  );
}
