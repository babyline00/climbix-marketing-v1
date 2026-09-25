import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/data/seo-meta";

/**
 * JSON-LD structured data builders.
 * Rendered via <script type="application/ld+json"> in server components.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description:
      "Global SEO, AI Search Optimization, and Lead Generation agency helping ambitious businesses turn digital visibility into qualified leads and revenue.",
    email: "hello@climbixmarketing.com",
    sameAs: [
      "https://linkedin.com/company/climbixmarketing",
      "https://twitter.com/climbixmarketing",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@climbixmarketing.com",
      availableLanguage: ["English"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  slug?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url ?? `${SITE_URL}/services/${opts.slug}`,
    serviceType: opts.name,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "Worldwide",
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** faqJsonLd for admin-editable section items (Record<string,string>) */
export function faqItemsJsonLd(items: Record<string, string>[]) {
  return faqJsonLd(
    items
      .filter((f) => typeof f.q === "string" && typeof f.a === "string")
      .map((f) => ({ q: f.q, a: f.a }))
  );
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  author: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/blog/${opts.slug}`,
    author: { "@type": "Person", name: opts.author },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/locations`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    priceRange: "$$",
    areaServed: [
      "United States",
      "United Kingdom",
      "Canada",
      "Australia",
      "United Arab Emirates",
      "Germany",
    ],
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}
