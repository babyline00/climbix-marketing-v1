import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AnnouncementPopup } from "@/components/site/announcement-popup";
import { ServicesProvider } from "@/components/site/services-context";
import { getHeaderData } from "@/lib/header";
import { getAllServices } from "@/lib/service-data";

/**
 * Shared server shell for every public subpage:
 * admin-managed header + announcement popup + footer.
 * Services are fetched here (merged with defaults) so the header/footer
 * dropdowns and any client service consumers reflect admin edits.
 */
export async function PageShell({ children }: { children: React.ReactNode }) {
  const [header, services] = await Promise.all([
    getHeaderData(),
    getAllServices(),
  ]);

  return (
    <ServicesProvider services={services}>
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader links={header.links} />
        <AnnouncementPopup popup={header.popup} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ServicesProvider>
  );
}
