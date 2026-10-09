import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { findPage } from "@/lib/page-queries";
import { CmsPageBody } from "@/components/site/cms-page";

export const revalidate = 120;

type DBPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string;
};

async function getPublishedPage(slug: string): Promise<DBPage | null> {
  try {
    // Tolerant read: a whole-row select fails on a database that has not yet
    // received the renderMode column, which would 404 every custom page.
    const page = await findPage({ where: { slug, status: "published" } });
    return page ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.title,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: page.title, url: `/${slug}`, type: "website" },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <PageShell>
      <CmsPageBody page={page} />
    </PageShell>
  );
}