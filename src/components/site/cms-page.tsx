import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { findPage } from "@/lib/page-queries";
import { DocumentPage } from "@/components/site/document-page";
import { expandShortcodes } from "@/lib/shortcodes";
import { loadShortcodeAssets, loadShortcodeContext } from "@/lib/page-assets";

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string;
  renderMode?: string | null;
  schemaJson?: string | null;
};

type PageSection =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title: string; text: string };

/** Published DB page for a slug, or null (used by built-in page templates). */
export async function getPageOverride(
  slug: string
): Promise<CmsPage | null> {
  try {
    // Routed through the tolerant helper: this read selects the whole row, so
    // on a database without the renderMode column it has to fall back rather
    // than fail. Failing here is safe but silent — every built-in page would
    // quietly revert to its code template with no error anywhere.
    const page = await findPage({
      where: { slug, status: "published" },
    });
    return page ?? null;
  } catch {
    return null;
  }
}

function SectionRenderer({ sections }: { sections: PageSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((s, i) => {
        switch (s.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl font-bold tracking-tight pt-4">
                {s.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {s.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="mt-2 size-1.5 rounded-full bg-brand-500 shrink-0" />
                    <span className="text-foreground/85 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="rounded-2xl border border-border bg-muted/30 p-5"
              >
                <p className="italic text-foreground/85 leading-relaxed">
                  &ldquo;{s.text}&rdquo;
                </p>
                {s.author && (
                  <footer className="mt-2 text-sm font-semibold">
                    — {s.author}
                  </footer>
                )}
              </blockquote>
            );
          case "callout":
            return (
              <div
                key={i}
                className="rounded-2xl border border-brand-500/30 bg-brand-500/[0.05] p-5"
              >
                <div className="font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                  {s.text}
                </p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * Expand the shortcodes in a complete-HTML page and hand the result to the
 * inline document renderer. Asset and site-fact lookups are best-effort, so a
 * failure degrades to the "[not found]" placeholder rather than an error page.
 */
async function ExpandedDocument({
  page,
}: {
  page: CmsPage;
}) {
  const [assets, context] = await Promise.all([
    loadShortcodeAssets().catch(() => undefined),
    loadShortcodeContext({ slug: page.slug, pageTitle: page.title }).catch(
      () => undefined
    ),
  ]);

  if (!context) return null;

  return (
    <DocumentPage
      content={expandShortcodes(page.content, context, {
        media: assets?.media,
        documents: assets?.documents,
        allDocuments: assets?.allDocuments,
      })}
      title={page.title}
    />
  );
}

/** Renderer for a DB-backed page — used by the catch-all and built-in templates. */
export async function CmsPageBody({ page }: { page: CmsPage }) {
  const isDocument = page.renderMode === "document";

  const isHTML = page.content.trim().startsWith("<");
  let sections: PageSection[] = [];
  if (!isHTML && !isDocument) {
    try {
      sections = JSON.parse(page.content) as PageSection[];
    } catch {
      sections = [{ type: "p", text: page.content }];
    }
  }

  return (
    <>
      {page.schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: page.schemaJson }}
        />
      )}
      {isDocument ? (
        // A complete HTML file owns its own head, layout and styling, so it
        // renders full-bleed with no site hero and no prose wrapper — the
        // page shell (header/footer) still frames it.
        <ExpandedDocument page={page} />
      ) : (
      <>
      <section className="relative isolate overflow-hidden bg-ink-900 text-white pt-28 lg:pt-36 pb-14">
        <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />
        <div className="absolute inset-0 hero-radial" aria-hidden />
        <div className="relative mx-auto max-w-4xl container-px">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-balance leading-[1.05]">
            {page.title}
          </h1>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-background">
        <div className="mx-auto max-w-4xl container-px">
          {isHTML ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <SectionRenderer sections={sections} />
          )}
        </div>
      </section>
      </>
      )}
    </>
  );
}