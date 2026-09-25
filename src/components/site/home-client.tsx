"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Problem } from "@/components/site/problem";
import { Services } from "@/components/site/services";
import { WhyUs } from "@/components/site/why-us";
import { CaseStudies } from "@/components/site/case-studies";
import { Process } from "@/components/site/process";
import { Industries } from "@/components/site/industries";
import { Locations } from "@/components/site/locations";
import { FreeAudit } from "@/components/site/free-audit";
import { Testimonials } from "@/components/site/testimonials";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { SiteFooter } from "@/components/site/footer";
import { TrustBadges } from "@/components/site/trust-badges";
import { ClientLogos } from "@/components/site/client-logos";
import { Offers } from "@/components/site/offers";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AnnouncementPopup } from "@/components/site/announcement-popup";
import { ServicesProvider } from "@/components/site/services-context";
import {
  DEFAULT_SECTIONS,
  type HomePageData,
  type TestimonialItem,
  type TrustBadgeItem,
  type ClientLogoItem,
  type OfferItem,
} from "@/lib/homepage";
import type { HeaderData } from "@/lib/header";
import type { SectionContentMap } from "@/lib/section-content";
import type { ServiceContent } from "@/data/services";

/**
 * Homepage sections rendered in admin-defined order with admin-editable
 * content. Inactive sections are already filtered out server-side.
 */
function SectionRenderer({
  data,
  content,
}: {
  data: HomePageData;
  content: SectionContentMap;
}) {
  const order =
    data.sections.length > 0
      ? data.sections.map((s) => s.key)
      : DEFAULT_SECTIONS.map((s) => s.key);

  const registry: Record<string, React.ReactNode> = {
    hero: <Hero content={content.hero} />,
    "trust-badges": (
      <TrustBadges items={data.trustBadges} content={content["trust-badges"]} />
    ),
    "client-logos": (
      <ClientLogos items={data.clientLogos} content={content["client-logos"]} />
    ),
    offers: <Offers items={data.offers} content={content.offers} />,
    problem: <Problem content={content.problem} />,
    services: <Services content={content.services} />,
    "why-us": <WhyUs content={content["why-us"]} />,
    "case-studies": <CaseStudies content={content["case-studies"]} />,
    process: <Process content={content.process} />,
    industries: <Industries content={content.industries} />,
    locations: <Locations content={content.locations} />,
    "free-audit": <FreeAudit content={content["free-audit"]} />,
    testimonials: (
      <Testimonials items={data.testimonials} content={content.testimonials} />
    ),
    faq: <Faq content={content.faq} />,
    "final-cta": <FinalCta content={content["final-cta"]} />,
  };

  return (
    <>
      {order.map((key) => (
        <React.Fragment key={key}>{registry[key] ?? null}</React.Fragment>
      ))}
    </>
  );
}

function HomePage({
  data,
  header,
}: {
  data: HomePageData;
  header: HeaderData | null;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader links={header?.links} />
      <main className="flex-1">
        <SectionRenderer data={data} content={data.content} />
      </main>
      <SiteFooter />
    </div>
  );
}

function AppContent({
  data,
  header,
}: {
  data: HomePageData;
  header: HeaderData | null;
}) {
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Listen for #admin hash
  React.useEffect(() => {
    const check = () => {
      setIsAdmin(window.location.hash === "#admin");
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <>
      {/* Admin-managed announcement popup — public views only */}
      <AnnouncementPopup popup={header?.popup ?? null} />
      <HomePage data={data} header={header} />
    </>
  );
}

export function HomePageClient({
  data,
  header,
  services,
}: {
  data: HomePageData;
  header: HeaderData | null;
  services: ServiceContent[];
}) {
  return (
    <ServicesProvider services={services}>
      <AppContent data={data} header={header} />
    </ServicesProvider>
  );
}
