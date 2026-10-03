import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { VoiceAgentWidget } from "@/components/site/voice-agent-widget";
import { SiteProviders } from "@/components/site/site-providers";
import { AnalyticsSnippets, type TagConfig } from "@/components/site/analytics-snippets";
import { ConsentBanner } from "@/components/site/consent-banner";
import { CustomCodeInjector } from "@/components/site/custom-code-injector";
import { ServiceWorkerRegistration } from "@/components/site/service-worker-registration";
import { getSettingsCached } from "@/lib/settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/data/seo-meta";

const geistSans = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Climbix Marketing — SEO, AI Search & Lead Generation Agency",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Climbix Marketing is a global SEO, AI Search Optimization, and Lead Generation agency. We help ambitious businesses turn search visibility into qualified leads and revenue.",
  keywords: [
    "SEO Agency",
    "AI Search Optimization",
    "Lead Generation Agency",
    "B2B SEO",
    "SaaS Marketing",
    "Digital Growth Agency",
    "Climbix Marketing",
  ],
  authors: [{ name: "Climbix Marketing" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Climbix Marketing — Turning Search Into Growth",
    description:
      "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies.",
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Climbix Marketing — Turning Search Into Growth",
    description:
      "SEO, AI Search & Lead Generation for ambitious businesses worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettingsCached();
  const tagConfig: TagConfig = {
    ga4Id: settings["integrations.ga4Id"] || undefined,
    gtmId: settings["integrations.gtmId"] || undefined,
    fbpPixelId: settings["integrations.fbpPixelId"] || undefined,
    clarityId: settings["integrations.clarityId"] || undefined,
    hotjarSiteId: settings["integrations.hotjarSiteId"] || undefined,
    tiktokPixelId: settings["integrations.tiktokPixelId"] || undefined,
    linkedinPartnerId: settings["integrations.linkedinPartnerId"] || undefined,
    pinterestTagId: settings["integrations.pinterestTagId"] || undefined,
    consentMode: settings["tracking.consentMode"] !== "false",
  };
  const consentEnabled = settings["tracking.consentEnabled"] !== "false";
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AnalyticsSnippets config={tagConfig} />
        <CustomCodeInjector head={settings["code.head"]} footer={settings["code.footer"]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
        <SiteProviders>{children}</SiteProviders>
        {consentEnabled && (
          <ConsentBanner
            message={settings["tracking.consentMessage"]}
            acceptLabel={settings["tracking.consentAcceptLabel"]}
            necessaryLabel={settings["tracking.consentNecessaryLabel"]}
          />
        )}
        <VoiceAgentWidget />
        <ServiceWorkerRegistration />
        <Toaster />
      </body>
    </html>
  );
}
