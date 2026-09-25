import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { BlogView } from "@/components/site/blog-view";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getAllArticles } from "@/lib/blog";

const meta = PAGE_META.blog;

export const revalidate = 120;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/blog" },
  openGraph: { title: meta.title, description: meta.description, url: "/blog", type: "website" },
};

export default async function BlogPage() {
  const articles = await getAllArticles();

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
            ])
          ),
        }}
      />
      <BlogView initialPosts={articles} />
    </PageShell>
  );
}
