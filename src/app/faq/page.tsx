import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { Faq } from "@/components/site/faq";
import { PAGE_META } from "@/data/seo-meta";
import { breadcrumbJsonLd, faqItemsJsonLd } from "@/lib/seo";
import { SECTION_CONTENT_DEFAULTS } from "@/lib/section-content";
import { CmsPageBody, getPageOverride } from "@/components/site/cms-page";

const meta = PAGE_META.faq;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: "/faq" },
  openGraph: { title: meta.title, description: meta.description, url: "/faq", type: "website" },
};

export default async function FaqPage() {
  const override = await getPageOverride("faq");
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
              { name: "FAQ", url: "/faq" },
            ]),
            faqItemsJsonLd(SECTION_CONTENT_DEFAULTS.faq.items),
          ]),
        }}
      />

      <section className="relative pt-28 lg:pt-36 pb-2 bg-background">
        <div className="mx-auto max-w-7xl container-px">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground text-pretty">
            Straight answers about SEO timelines, pricing, industries served,
            and how engagements actually work. If your question isn&apos;t
            here, the contact form below reaches a strategist — not a ticket
            queue.
          </p>
        </div>
      </section>

      <Faq content={{ items: SECTION_CONTENT_DEFAULTS.faq.items }} />

      <section className="py-16 lg:py-20 bg-background">
        <div className="mx-auto max-w-3xl container-px text-center">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance">
            Still have questions?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Ask us directly. We&apos;ll give you an honest answer — even if
            that answer is &quot;you don&apos;t need an agency for that.&quot;
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-600/25"
            >
              Contact Us
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/strategy-call"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-500/40 text-brand-700 hover:bg-brand-500/10 px-6 py-3 text-sm font-semibold"
            >
              Book a Free Strategy Call
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
