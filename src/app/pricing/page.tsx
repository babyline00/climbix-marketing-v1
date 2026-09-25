import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { Pricing } from "@/components/site/pricing";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, faqItemsJsonLd } from "@/lib/seo";
import { SECTION_CONTENT_DEFAULTS } from "@/lib/section-content";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.pricing;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/pricing" },
  openGraph: { title: meta.title, description: meta.description, url: "/pricing", type: "website" },
};

export default async function PricingPage() {
  const override = await getPageOverride("pricing");
  if (override)
    return (
      <PageShell>
        <CmsPageBody page={override} />
      </PageShell>
    );
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Pricing", url: "/pricing" },
            ]),
            faqItemsJsonLd(SECTION_CONTENT_DEFAULTS.faq.items),
          ]),
        }}
      />
      <Pricing />
    </PageShell>
  );
}
