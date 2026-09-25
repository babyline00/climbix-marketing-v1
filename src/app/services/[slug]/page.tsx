import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/page-shell";
import { ServiceDetail } from "@/components/site/service-detail";
import { getServiceData, getAllServices } from "@/lib/service-data";
import { SERVICE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, serviceJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceData(slug);
  if (!service) return {};

  const meta = SERVICE_META[slug];
  const title = meta?.title ?? `${service.name} | Climbix Marketing`;
  const description =
    meta?.description ?? service.hero.subheading;

  return {
    title,
    description,
    keywords: meta?.keywords,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title,
      description,
      url: `/services/${slug}`,
      type: "website",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceData(slug);
  if (!service) notFound();

  const meta = SERVICE_META[slug];
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: service.name, url: `/services/${slug}` },
    ]),
    serviceJsonLd({
      name: service.name,
      description: meta?.description ?? service.hero.subheading,
      slug,
    }),
    ...(service.faq.length > 0 ? [faqJsonLd(service.faq)] : []),
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetail service={service} />
    </PageShell>
  );
}
