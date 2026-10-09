"use client";

import * as React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  ChevronUp,
  ChevronDown,
  PanelTop,
  Eye,
  EyeOff,
  Megaphone,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadMediaFile } from "@/lib/upload-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────────────────────

type HeaderLink = {
  id: string;
  label: string;
  href: string;
  kind: string;
  isSystem: boolean;
  isActive: boolean;
  position: number;
};

type Popup = {
  id: string;
  title: string;
  message: string;
  badge: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  customHtml: string | null;
  isActive: boolean;
  delaySeconds: number;
  showEveryDays: number;
};

const KIND_OPTIONS = [
  { value: "link", label: "Custom Link" },
  { value: "services", label: "Services Menu (dropdown)" },
  { value: "industries", label: "Industries Menu (dropdown)" },
  { value: "company", label: "Company Menu (dropdown)" },
  { value: "resources", label: "Resources Menu (dropdown)" },
];

const KIND_BADGE: Record<string, { label: string; className: string }> = {
  services: {
    label: "menu",
    className: "text-brand-700 border-brand-500/30 bg-brand-500/10",
  },
  industries: {
    label: "menu",
    className: "text-brand-700 border-brand-500/30 bg-brand-500/10",
  },
  company: {
    label: "menu",
    className: "text-brand-700 border-brand-500/30 bg-brand-500/10",
  },
  resources: {
    label: "menu",
    className: "text-brand-700 border-brand-500/30 bg-brand-500/10",
  },
};

function broadcastHeaderUpdate() {
  try {
    const channel = new BroadcastChannel("climbix-content");
    channel.postMessage({ type: "homepage-updated" });
    channel.close();
  } catch {
    // BroadcastChannel not supported
  }
}

// ─────────────────────────────────────────────────────────────
// Navigation links tab — reorder + on/off + custom links
// ─────────────────────────────────────────────────────────────

function LinksManager() {
  const [links, setLinks] = React.useState<HeaderLink[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [editor, setEditor] = React.useState<{
    open: boolean;
    link: HeaderLink | null;
    label: string;
    href: string;
    kind: string;
    saving: boolean;
  }>({ open: false, link: null, label: "", href: "", kind: "link", saving: false });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/header/links");
      const data = await res.json();
      setLinks(data.links || []);
      setDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const persist = async (
    updates: {
      id: string;
      label?: string;
      href?: string;
      isActive?: boolean;
      position?: number;
    }[]
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/header/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.links) setLinks(data.links);
      setDirty(false);
      broadcastHeaderUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (link: HeaderLink) => {
    persist([{ id: link.id, isActive: !link.isActive }]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...links];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index];
    const b = next[target];
    const tmp = a.position;
    next[index] = { ...a, position: b.position };
    next[target] = { ...b, position: tmp };
    next.sort((x, y) => x.position - y.position);
    setLinks(next);
    setDirty(true);
  };

  const saveOrder = () => {
    persist(
      links.map((l, i) => ({
        id: l.id,
        position: (i + 1) * 10,
        isActive: l.isActive,
      }))
    );
  };

  const openNew = () =>
    setEditor({ open: true, link: null, label: "", href: "", kind: "link", saving: false });

  const openEdit = (link: HeaderLink) =>
    setEditor({
      open: true,
      link,
      label: link.label,
      href: link.href,
      kind: link.kind,
      saving: false,
    });

  const saveEditor = async () => {
    if (!editor.label.trim() || (editor.kind === "link" && !editor.href.trim())) return;
    setEditor((s) => ({ ...s, saving: true }));
    try {
      if (editor.link) {
        await fetch(`/api/header/links/${editor.link.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: editor.label,
            href: editor.href || "#",
            kind: editor.kind,
          }),
        });
      } else {
        await fetch("/api/header/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: editor.label,
            href: editor.href,
            kind: editor.kind,
          }),
        });
      }
      await load();
      broadcastHeaderUpdate();
      setEditor((s) => ({ ...s, open: false }));
    } catch (e) {
      console.error(e);
    } finally {
      setEditor((s) => ({ ...s, saving: false }));
    }
  };

  const onDelete = async (link: HeaderLink) => {
    if (!confirm(`Remove "${link.label}" from the header navigation?`)) return;
    try {
      await fetch(`/api/header/links/${link.id}`, { method: "DELETE" });
      await load();
      broadcastHeaderUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = links.filter((l) => l.isActive).length;

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {activeCount} of {links.length} links visible in the header. Use
          arrows to reorder, switch to show/hide.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={openNew} size="sm" variant="outline">
            <Plus className="size-4" />
            Add Custom Link
          </Button>
          <Button
            onClick={saveOrder}
            disabled={!dirty || saving}
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Order
            {dirty && (
              <span className="ml-1 size-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="space-y-1">
            {links.map((l, i) => (
              <div
                key={l.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  l.isActive ? "hover:bg-slate-50" : "bg-slate-50/60"
                }`}
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                    aria-label={`Move ${l.label} up`}
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === links.length - 1}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                    aria-label={`Move ${l.label} down`}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium ${
                        l.isActive ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {l.label}
                    </span>
                    {l.isSystem ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-200 gap-1"
                      >
                        <Lock className="size-2.5" />
                        system
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-brand-700 border-brand-500/30 bg-brand-500/10"
                      >
                        custom
                      </Badge>
                    )}
                    {KIND_BADGE[l.kind] && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${KIND_BADGE[l.kind].className}`}
                      >
                        {KIND_BADGE[l.kind].label}
                      </Badge>
                    )}
                    <span className="text-[11px] text-slate-400 truncate max-w-40">
                      {l.href}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-slate-400 tabular-nums">
                  #{i + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  {l.isActive ? (
                    <Eye className="size-4 text-brand-600" />
                  ) : (
                    <EyeOff className="size-4 text-slate-300" />
                  )}
                  <Switch
                    checked={l.isActive}
                    onCheckedChange={() => toggleActive(l)}
                    aria-label={`Toggle ${l.label}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openEdit(l)}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                  {!l.isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => onDelete(l)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Link editor dialog */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor((s) => ({ ...s, open: false }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editor.link ? "Edit Header Link" : "Add Custom Header Link"}
            </DialogTitle>
            <DialogDescription>
              {editor.link
                ? "Update the label, target or behaviour of this navigation item."
                : "Create a new navigation item. It is appended at the end — reorder it after saving."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs">Label *</Label>
              <Input
                value={editor.label}
                onChange={(e) => setEditor((s) => ({ ...s, label: e.target.value }))}
                placeholder="e.g. Case Studies"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Behaviour</Label>
              <Select
                value={editor.kind}
                onValueChange={(v) => setEditor((s) => ({ ...s, kind: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editor.kind === "link" && (
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Link target {editor.kind === "link" && "*"}
                </Label>
                <Input
                  value={editor.href}
                  onChange={(e) => setEditor((s) => ({ ...s, href: e.target.value }))}
                  placeholder="#case-studies or https://example.com"
                />
                <p className="text-[11px] text-muted-foreground">
                  Use an anchor like <code>#free-audit</code> to scroll to a
                  section, or a full URL to open a new tab.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditor((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditor}
              disabled={
                editor.saving ||
                !editor.label.trim() ||
                (editor.kind === "link" && !editor.href.trim())
              }
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editor.saving && <Loader2 className="size-4 animate-spin" />}
              {editor.link ? "Save Changes" : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Announcement popup tab — editor + live preview
// ─────────────────────────────────────────────────────────────

function PopupManager() {
  const [popup, setPopup] = React.useState<Popup | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const [form, setForm] = React.useState({
    isActive: false,
    badge: "",
    title: "",
    message: "",
    ctaLabel: "",
    ctaHref: "",
    imageUrl: "",
    customHtml: "",
    delaySeconds: 5,
    showEveryDays: 1,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/popup");
      const data = await res.json();
      const p: Popup = data.popup;
      setPopup(p);
      setForm({
        isActive: p.isActive,
        badge: p.badge ?? "",
        title: p.title,
        message: p.message,
        ctaLabel: p.ctaLabel ?? "",
        ctaHref: p.ctaHref ?? "",
        imageUrl: p.imageUrl ?? "",
        customHtml: p.customHtml ?? "",
        delaySeconds: p.delaySeconds,
        showEveryDays: p.showEveryDays,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const uploadPopupImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const uploaded = await uploadMediaFile(file, {
        altText: form.title || "Announcement image",
      });
      setForm((state) => ({ ...state, imageUrl: uploaded.url }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          delaySeconds: Number(form.delaySeconds) || 0,
          showEveryDays: Number(form.showEveryDays) || 0,
        }),
      });
      const data = await res.json();
      if (data.popup) setPopup(data.popup);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      broadcastHeaderUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !popup) {
    return (
      <div className="space-y-3 max-w-3xl">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: v }))}
            aria-label="Toggle popup"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              {form.isActive ? "Popup is live" : "Popup is hidden"}
            </div>
            <div className="text-xs text-muted-foreground">
              When active, visitors see it {form.delaySeconds}s after the page
              loads (remembered for {form.showEveryDays} day
              {form.showEveryDays === 1 ? "" : "s"} after dismissing).
            </div>
          </div>
          {form.isActive ? (
            <Badge className="bg-brand-500/10 text-brand-700 border border-brand-500/25 ml-1">
              Live on site
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-slate-400 border-slate-200 ml-1"
            >
              Off
            </Badge>
          )}
        </div>
        <Button
          onClick={save}
          disabled={saving}
          size="sm"
          className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saved ? "Saved ✓" : "Save Popup"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <Card>
          <CardContent className="p-5 space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs">Badge (optional)</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
                placeholder="LIMITED TIME"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="Get a Free SEO Audit"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) =>
                  setForm((s) => ({ ...s, message: e.target.value }))
                }
                placeholder="Tell visitors what they get…"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Button label</Label>
                <Input
                  value={form.ctaLabel}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, ctaLabel: e.target.value }))
                  }
                  placeholder="Claim My Free Audit"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Button link</Label>
                <Input
                  value={form.ctaHref}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, ctaHref: e.target.value }))
                  }
                  placeholder="/free-growth-audit"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, imageUrl: e.target.value }))
                }
                placeholder="/uploads/banner.jpg"
              />
              <Input
                type="file"
                accept="image/*"
                className="text-xs"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPopupImage(file);
                  e.currentTarget.value = "";
                }}
              />
              {uploadingImage && <p className="text-[11px] text-brand-600">Uploading to internal media storage…</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Custom HTML (optional)</Label>
              <Textarea
                value={form.customHtml}
                onChange={(e) => setForm((s) => ({ ...s, customHtml: e.target.value }))}
                placeholder={'<div style="padding: 16px">Your embedded promotion</div>'}
                rows={5}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400">Rendered inside a sandboxed frame; scripts and access to the parent page are blocked.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Show after (seconds)</Label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={form.delaySeconds}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      delaySeconds: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Re-show after (days)</Label>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={form.showEveryDays}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      showEveryDays: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Megaphone className="size-3.5" />
              Visitor preview
            </div>
            <div className="rounded-2xl border bg-background shadow-xl overflow-hidden">
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Popup preview"
                  className="w-full h-32 object-cover"
                />
              )}
              {form.customHtml && (
                <iframe title="Custom popup preview" srcDoc={form.customHtml} sandbox="" className="h-28 w-full border-0 bg-white" />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <PanelTop className="size-4 text-white" />
                  </div>
                  {form.badge && (
                    <span className="inline-flex items-center rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {form.badge}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold leading-snug text-slate-900">
                  {form.title || "Your popup title"}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {form.message || "Your popup message will appear here."}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {form.ctaLabel && (
                    <span className="inline-flex items-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
                      {form.ctaLabel}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Maybe later
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Exported view
// ─────────────────────────────────────────────────────────────

export function AdminHeaderManager() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Header & Popup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control the website header navigation — reorder links, show or hide
          them, add custom entries — and manage the announcement popup. Changes
          appear on the site instantly.
        </p>
      </div>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">
            <PanelTop className="size-4 mr-1.5" />
            Navigation Links
          </TabsTrigger>
          <TabsTrigger value="popup">
            <Megaphone className="size-4 mr-1.5" />
            Announcement Popup
          </TabsTrigger>
        </TabsList>
        <TabsContent value="links" className="mt-4">
          <LinksManager />
        </TabsContent>
        <TabsContent value="popup" className="mt-4">
          <PopupManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
