"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Search,
  Loader2,
  ChevronRight,
  Eye,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  buildDocument,
  expandShortcodes,
  MAX_PAGE_CONTENT_CHARS,
  SHORTCODE_REFERENCE,
} from "@/lib/shortcodes";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string;
  renderMode?: string | null;
  schemaJson?: string | null;
  parentId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
};

/** Starter document for a page authored as a complete HTML file. */
const DOCUMENT_STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page title</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; color: #172033; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 48px 24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Welcome to My Website</h1>
    <p>This is a paragraph of text explaining what this page is about.</p>
    [cta label="Get started" href="/contact"]
    [lead_form title="Get in touch"]
  </div>
</body>
</html>`;

type EditorState = {
  open: boolean;
  page: Page | null;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string;
  renderMode: "inline" | "document";
  schemaJson: string;
  saving: boolean;
  error: string;
};

const DEFAULT_STATE: EditorState = {
  open: false,
  page: null,
  title: "",
  slug: "",
  content: "<h2>Page heading goes here</h2><p>Start writing your page content...</p>",
  status: "published",
  template: "standard",
  renderMode: "inline",
  schemaJson: "",
  saving: false,
  error: "",
};

const SYSTEM_PAGES: Page[] = [
  ["home", "Home", ""], ["about", "About", "about"],
  ["services", "Services", "services"], ["industries", "Industries", "industries"],
  ["case-studies", "Case Studies", "case-studies"], ["pricing", "Pricing", "pricing"],
  ["process", "Our Process", "process"], ["testimonials", "Testimonials", "testimonials"],
  ["faq", "FAQ", "faq"], ["contact", "Contact", "contact"],
  ["locations", "Locations", "locations"], ["free-growth-audit", "Free Growth Audit", "free-growth-audit"],
  ["free-tools", "Free Tools", "free-tools"], ["seo-guides", "SEO Guides", "seo-guides"],
  ["strategy-call", "Strategy Call", "strategy-call"],
].map(([id, title, slug]) => ({ id: `system-${id}`, title, slug, content: "", status: "published", template: "system", renderMode: "inline", parentId: null, order: 0, createdAt: "", updatedAt: "", isSystem: true }));

// Built-in pages have bespoke templates, so their editor starts from generic
// copy instead of an empty box.
function defaultPageContent(title: string): string {
  return `<h2>${title}</h2><p>Start writing your page content... Built-in templates are managed by code; saving here creates a custom content version of this page.</p><h2>Next section</h2><p>Add headings, paragraphs, lists, links, and images with the toolbar above.</p>`;
}

export function AdminPages() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [editor, setEditor] = React.useState<EditorState>(DEFAULT_STATE);

  /**
   * Preview runs through the same shortcode expander and document builder as
   * the public renderer, so what an author sees here is what visitors get.
   * Media lookups are skipped (no server access from the browser) — asset
   * shortcodes fall back to their visible "[not found]" placeholder, which is
   * a useful signal rather than a broken image.
   */
  const documentPreview = React.useMemo(() => {
    if (editor.renderMode !== "document") return null;
    const expanded = expandShortcodes(
      editor.content,
      {
        slug: editor.slug || "preview",
        pageTitle: editor.title,
        siteName: editor.title || "Your site",
        agentEnabled: false,
      },
      {}
    );
    return buildDocument({
      html: expanded,
      title: editor.title || "Page preview",
      token: "preview",
    });
  }, [editor.content, editor.renderMode, editor.title, editor.slug]);

  const livePreview = React.useMemo(() => {
    const title = editor.title.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Arial,sans-serif;color:#172033;background:#fff}.hero{padding:40px 28px;background:#101b2d;color:#fff}.hero p{color:#b9c3d2;margin:0 0 12px;font-size:14px}.hero h1{margin:0;font-size:32px;line-height:1.12}.content{max-width:720px;margin:0 auto;padding:36px 28px;line-height:1.7}.content h2{line-height:1.25}.content img{max-width:100%;height:auto;border-radius:12px}.content a{color:#0b7d5d}</style></head><body><header class="hero"><p>Live editor preview</p><h1>${title || "Page title"}</h1></header><main class="content">${editor.content || "<p>Start writing to see your page here.</p>"}</main></body></html>`;
  }, [editor.content, editor.title]);

  const fetchPages = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openNew = () => {
    setEditor({
      ...DEFAULT_STATE,
      open: true,
      title: "",
      slug: "",
    });
  };

  const openEdit = (page: Page) => {
    const renderMode = page.renderMode === "document" ? "document" : "inline";
    setEditor({
      open: true,
      page,
      title: page.title,
      slug: page.slug,
      content:
        page.content ||
        (renderMode === "document"
          ? DOCUMENT_STARTER
          : defaultPageContent(page.title)),
      status: page.status,
      template: page.template,
      renderMode,
      schemaJson: page.schemaJson || "",
      saving: false,
      error: "",
    });
  };

  const save = async () => {
    if (!editor.title || !editor.slug) return;
    setEditor({ ...editor, saving: true, error: "" });

    try {
      const body = {
        title: editor.title,
        slug: editor.slug,
        content: editor.content,
        status: editor.status,
        template: editor.template,
        renderMode: editor.renderMode,
        schemaJson: editor.schemaJson.trim() || null,
      };

      const res = editor.page
        ? await fetch(`/api/pages/${editor.page.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      // The previous version ignored res.ok, so a 400 slug clash or a 413
      // size rejection closed the dialog and looked like it had saved.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditor((s) => ({
          ...s,
          saving: false,
          error: data?.error || `Save failed (${res.status})`,
        }));
        return;
      }

      await fetchPages();
      setEditor(DEFAULT_STATE);
    } catch (e) {
      console.error(e);
      setEditor((s) => ({ ...s, saving: false, error: "Network error while saving" }));
    }
  };

  const onDelete = async (page: Page) => {
    const resetting = page.isSystem;
    if (!confirm(resetting ? "Reset this built-in page to its template? Any custom content will be removed." : "Delete this page permanently?")) return;
    try {
      await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      await fetchPages();
    } catch (e) {
      console.error(e);
    }
  };

  const allPages = React.useMemo(() => {
    const customSlugs = new Set(pages.map((page) => page.slug));
    return [...SYSTEM_PAGES.filter((page) => !customSlugs.has(page.slug)), ...pages];
  }, [pages]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return allPages;
    const q = search.toLowerCase();
    return allPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allPages, search]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pages.length} total · {pages.filter((p) => p.status === "published").length} published
          </p>
        </div>
        <Button onClick={openNew} className="bg-brand-600 hover:bg-brand-700 text-white">
          <Plus className="size-4" />
          Add New Page
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Search pages by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {pages.length === 0
                ? "No pages yet. Create your first page."
                : "No pages match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Title
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Slug
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Template
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Status
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3 hidden md:table-cell">
                      Updated
                    </th>
                    <th className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((page) => (
                    <tr
                      key={page.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          {page.title}
                          {page.isSystem && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Built-in</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 capitalize">
                          {page.template}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            page.status === "published"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-500">
                          {page.isSystem ? "Code-managed" : new Date(page.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {page.status === "published" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => window.open(page.slug === "home" ? "/" : `/${page.slug}`, "_blank", "noopener,noreferrer")}
                              aria-label={`Preview ${page.title}`}
                            >
                              <Eye className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(page)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => onDelete(page)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor dialog */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor(DEFAULT_STATE)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editor.page ? "Edit Page" : "Create New Page"}
            </DialogTitle>
            <DialogDescription>
              {editor.page
                ? editor.page.isSystem
                  ? "Save to create a custom content version of this built-in page"
                  : "Update page content and settings"
                : "Create a new page for your website"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.8fr)]">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                value={editor.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditor({
                    ...editor,
                    title,
                    slug:
                      editor.page && editor.slug
                        ? editor.slug
                        : title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-"),
                  });
                }}
                placeholder="About Us"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="text-xs">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">/</span>
                <Input
                  value={editor.slug}
                  onChange={(e) =>
                    setEditor({ ...editor, slug: e.target.value })
                  }
                  placeholder="about-us"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Status + Template */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={editor.status}
                  onValueChange={(v) => setEditor({ ...editor, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Template</Label>
                <Select
                  value={editor.template}
                  onValueChange={(v) => setEditor({ ...editor, template: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="about">About Page</SelectItem>
                    <SelectItem value="contact">Contact Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Render mode */}
            <div className="space-y-1.5">
              <Label className="text-xs">Render mode</Label>
              <Select
                value={editor.renderMode}
                onValueChange={(v) => {
                  const next = v as "inline" | "document";
                  setEditor({
                    ...editor,
                    renderMode: next,
                    content:
                      next === "document" &&
                      editor.renderMode !== "document" &&
                      !editor.content.trim().startsWith("<!DOCTYPE")
                        ? DOCUMENT_STARTER
                        : editor.content,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Rich text / inline HTML</SelectItem>
                  <SelectItem value="document">Complete HTML page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500">
                {editor.renderMode === "document"
                  ? "Paste a full HTML file. Your <style> and <script> run as-is, and shortcodes become working forms, buttons and attachments."
                  : "Use the toolbar to format text, add headings, lists, links, and images."}
              </p>
            </div>

            {/* Content */}
            {editor.renderMode === "document" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">HTML</Label>
                <Textarea
                  value={editor.content}
                  onChange={(e) => {
                    const next = e.target.value;
                    // Preserve the caret across the controlled re-render.
                    const el = e.target;
                    requestAnimationFrame(() => {
                      if (el === document.activeElement) {
                        el.selectionStart = el.selectionStart;
                      }
                    });
                    setEditor({ ...editor, content: next });
                  }}
                  rows={20}
                  spellCheck={false}
                  className="font-mono text-xs leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {editor.content.length.toLocaleString()} /{" "}
                    {MAX_PAGE_CONTENT_CHARS.toLocaleString()} characters
                  </span>
                  {editor.content.length > MAX_PAGE_CONTENT_CHARS && (
                    <span className="font-semibold text-rose-600">
                      Over the limit — shorten before saving
                    </span>
                  )}
                </div>

                {/* Shortcode reference */}
                <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Shortcodes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SHORTCODE_REFERENCE.map((entry) => (
                      <Button
                        key={entry.tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 font-mono text-[10px]"
                        title={`${entry.summary}\n\n${entry.example}`}
                        onClick={() => {
                          const snippet = entry.example;
                          setEditor({
                            ...editor,
                            content: editor.content + "\n" + snippet,
                          });
                        }}
                      >
                        [{entry.tag}]
                      </Button>
                    ))}
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {SHORTCODE_REFERENCE.map((entry) => (
                      <li key={entry.tag}>
                        <code className="font-mono text-slate-800">
                          [{entry.tag}]
                        </code>{" "}
                        — {entry.summary}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500">
                    Type <code className="font-mono">[[lead_form]]</code> to
                    print a shortcode literally.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">Content</Label>
                <RichTextEditor
                  value={editor.content}
                  onChange={(html) =>
                    setEditor({ ...editor, content: html })
                  }
                  placeholder="Start writing your page content..."
                />
                <p className="text-[11px] text-slate-500">
                  Use the toolbar to format text, add headings, lists, links, and images.
                </p>
              </div>
            )}

            {editor.error && (
              <p
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
              >
                {editor.error}
              </p>
            )}

            {/* Schema.org JSON-LD */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Schema.org structured data (JSON-LD)
              </Label>
              <Textarea
                value={editor.schemaJson}
                onChange={(e) =>
                  setEditor({ ...editor, schemaJson: e.target.value })
                }
                rows={6}
                spellCheck={false}
                placeholder={`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}`}
                className="font-mono text-xs leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                Optional. Valid JSON-LD rendered in a &lt;script&gt; tag on this page for
                richer search results. Leave empty to remove.
              </p>
            </div>
          </div>
          <aside className="space-y-2 lg:sticky lg:top-0 lg:self-start">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Live preview</Label>
              {editor.page?.status === "published" && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => window.open(`/${editor.slug}`, "_blank", "noopener,noreferrer")}>
                  <Eye className="size-3.5" /> Open page
                </Button>
              )}
            </div>
            {editor.renderMode === "document" ? (
              <iframe
                title="Live page preview"
                srcDoc={documentPreview ?? ""}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                className="h-[32rem] w-full rounded-xl border bg-white"
              />
            ) : (
              <iframe
                title="Live page preview"
                srcDoc={livePreview}
                sandbox=""
                className="h-[32rem] w-full rounded-xl border bg-white"
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              {editor.renderMode === "document"
                ? "Same renderer as the live page. Image and attachment shortcodes show [not found] here because the browser cannot read the media library — use Open page to see them resolved."
                : "Updates as you type. Save to publish the changes to the live page."}
            </p>
          </aside>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditor(DEFAULT_STATE)}
              disabled={editor.saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={
                editor.saving ||
                !editor.title ||
                !editor.slug ||
                editor.content.length > MAX_PAGE_CONTENT_CHARS
              }
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editor.saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editor.page ? "Update Page" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
