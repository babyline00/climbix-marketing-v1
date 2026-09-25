import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { IndustryDetail } from "@/components/site/industry-detail";
import { INDUSTRIES, getIndustry } from "@/data/industries";
import { INDUSTRY_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";

export const revalidate = 300;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};

  const meta = INDUSTRY_META[slug];
  const title = meta?.title ?? `${industry.name} | Climbix Marketing`;
  const description = meta?.description ?? industry.hero.subheading;

  return {
    title,
    description,
    keywords: meta?.keywords,
    alternates: { canonical: `/industries/${slug}` },
    openGraph: {
      title,
      description,
      url: `/industries/${slug}`,
      type: "website",
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const meta = INDUSTRY_META[slug];
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Industries", url: "/industries" },
      { name: industry.name, url: `/industries/${slug}` },
    ]),
    serviceJsonLd({
      name: `${industry.name} — SEO & Growth Marketing`,
      description: meta?.description ?? industry.hero.subheading,
      url: `/industries/${slug}`,
    }),
    ...(industry.faq.length > 0 ? [faqJsonLd(industry.faq)] : []),
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IndustryDetail slug={slug} />
    </PageShell>
  );
}
