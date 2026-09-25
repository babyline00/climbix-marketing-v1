import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { FreeAudit } from "@/components/site/free-audit";
import { SECTION_CONTENT_DEFAULTS } from "@/lib/section-content";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, faqItemsJsonLd } from "@/lib/seo";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META["free-growth-audit"];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/free-growth-audit" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/free-growth-audit",
    type: "website",
  },
};

export default async function FreeGrowthAuditPage() {
  const override = await getPageOverride("free-growth-audit");
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
              { name: "Free Growth Audit", url: "/free-growth-audit" },
            ]),
            faqItemsJsonLd(SECTION_CONTENT_DEFAULTS.faq.items.slice(0, 4)),
          ]),
        }}
      />
      {/* Dark wrapper so the audit section reads as a full page */}
      <div className="bg-ink-900 pt-14 lg:pt-20">
        <FreeAudit />
      </div>
    </PageShell>
  );
}
