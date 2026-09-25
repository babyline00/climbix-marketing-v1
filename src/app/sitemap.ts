import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ARTICLES } from "@/data/blog";
import { getAllServices } from "@/lib/service-data";
import { INDUSTRIES } from "@/data/industries";
import { SITE_URL } from "@/data/seo-meta";
import { CASE_STUDIES } from "@/data/case-studies";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: `${SITE_URL}/`, changeFrequency: "weekly" as const, priority: 1 },
      { url: `${SITE_URL}/services`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${SITE_URL}/industries`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${SITE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${SITE_URL}/case-studies`, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${SITE_URL}/process`, changeFrequency: "monthly" as const, priority: 0.6 },
      { url: `${SITE_URL}/pricing`, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${SITE_URL}/testimonials`, changeFrequency: "monthly" as const, priority: 0.6 },
      { url: `${SITE_URL}/faq`, changeFrequency: "monthly" as const, priority: 0.6 },
      { url: `${SITE_URL}/contact`, changeFrequency: "yearly" as const, priority: 0.6 },
      { url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
      { url: `${SITE_URL}/seo-guides`, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${SITE_URL}/free-tools`, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${SITE_URL}/free-growth-audit`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${SITE_URL}/strategy-call`, changeFrequency: "monthly" as const, priority: 0.9 },
      { url: `${SITE_URL}/locations`, changeFrequency: "monthly" as const, priority: 0.6 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry }));

  // Services & industries
  let servicesRoutes: MetadataRoute.Sitemap = [];
  try {
    servicesRoutes = (await getAllServices()).map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));
  } catch {
    // DB unavailable — other routes still ship
  }

  const catalogRoutes: MetadataRoute.Sitemap = [
    ...servicesRoutes,
    ...INDUSTRIES.map((i) => ({
      url: `${SITE_URL}/industries/${i.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...CASE_STUDIES.map((c) => ({
      url: `${SITE_URL}/case-studies/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // Blog articles (static seeds)
  const blogRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // DB blog posts
  let dbBlogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
    dbBlogRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: p.updatedAt,
    }));
  } catch {
    // DB unavailable — static routes still ship
  }

  // Admin-created pages
  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await db.page.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
    pageRoutes = pages.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      lastModified: p.updatedAt,
    }));
  } catch {
    // ignore
  }

  const allRoutes = [...staticRoutes, ...catalogRoutes, ...dbBlogRoutes, ...blogRoutes, ...pageRoutes];
  const seen = new Set<string>();
  return allRoutes.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
