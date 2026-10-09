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
  LayoutTemplate,
  ShieldCheck,
  Building2,
  Star,
  BadgePercent,
  Eye,
  EyeOff,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRUST_BADGE_ICONS } from "@/components/site/trust-badges";
import { SectionContentEditor } from "@/components/admin/views/section-content";
import { sectionIcon } from "@/components/admin/views/section-icons";
import { Type } from "lucide-react";
import { uploadMediaFile } from "@/lib/upload-client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Section = {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  position: number;
};

type TrustBadge = {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  position: number;
};

type ClientLogo = {
  id: string;
  name: string;
  imageUrl: string | null;
  website: string | null;
  isActive: boolean;
  position: number;
};

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  isActive: boolean;
  featured: boolean;
  position: number;
};

type Offer = {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  ctaLabel: string;
  ctaHref: string;
  expiresAt: string | null;
  isActive: boolean;
  position: number;
};

const ICON_KEYS = Object.keys(TRUST_BADGE_ICONS);

function broadcastHomepageUpdate() {
  try {
    const channel = new BroadcastChannel("climbix-content");
    channel.postMessage({ type: "homepage-updated" });
    channel.close();
  } catch {
    // BroadcastChannel not supported
  }
}

// ─────────────────────────────────────────────────────────────
// Sections tab — visibility toggle + position ordering
// ─────────────────────────────────────────────────────────────

function SectionsManager() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homepage/sections");
      const data = await res.json();
      setSections(data.sections || []);
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

  const persist = async (updates: { key: string; isActive?: boolean; position?: number }[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/homepage/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.sections) setSections(data.sections);
      setDirty(false);
      broadcastHomepageUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (section: Section) => {
    persist([{ key: section.key, isActive: !section.isActive }]);
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    // Swap positions of the two neighbours and reorder locally
    const a = next[index];
    const b = next[target];
    const tmp = a.position;
    next[index] = { ...a, position: b.position };
    next[target] = { ...b, position: tmp };
    next.sort((x, y) => x.position - y.position);
    setSections(next);
    setDirty(true);
  };

  const saveOrder = () => {
    persist(
      sections.map((s, i) => ({
        key: s.key,
        position: (i + 1) * 10,
        isActive: s.isActive,
      }))
    );
  };

  const activeCount = sections.filter((s) => s.isActive).length;

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
          {activeCount} of {sections.length} sections visible on the homepage.
          Use arrows to reorder, switch to activate/deactivate.
        </p>
        <Button
          onClick={saveOrder}
          disabled={!dirty || saving}
          size="sm"
          className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
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

      <Card>
        <CardContent className="p-2">
          <div className="space-y-1">
            {sections.map((s, i) => {
              const SecIcon = sectionIcon(s.key);
              return (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${
                  s.isActive ? "hover:bg-slate-50" : "bg-slate-50/60"
                }`}
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                    aria-label={`Move ${s.label} up`}
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    className="text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                    aria-label={`Move ${s.label} down`}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>

                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                  s.isActive ? "bg-brand-500/10" : "bg-slate-100"
                }`}>
                  <SecIcon
                    className={`size-4 ${
                      s.isActive ? "text-brand-600" : "text-slate-300"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        s.isActive ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-200"
                    >
                      {s.key}
                    </Badge>
                  </div>
                </div>

                <span className="text-xs text-slate-400 tabular-nums">
                  #{i + 1}
                </span>

                <div className="flex items-center gap-2">
                  {s.isActive ? (
                    <Eye className="size-4 text-brand-600" />
                  ) : (
                    <EyeOff className="size-4 text-slate-300" />
                  )}
                  <Switch
                    checked={s.isActive}
                    onCheckedChange={() => toggleActive(s)}
                    aria-label={`Toggle ${s.label}`}
                  />
                </div>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Generic item CRUD manager (badges / logos / reviews / offers)
// ─────────────────────────────────────────────────────────────

type ItemType = "trust-badges" | "client-logos" | "testimonials" | "offers";

type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "image";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
};

type EditorState = {
  open: boolean;
  item: Record<string, unknown> | null;
  values: Record<string, string>;
  saving: boolean;
};

const EMPTY_EDITOR: EditorState = {
  open: false,
  item: null,
  values: {},
  saving: false,
};

function ItemManager({
  type,
  title,
  singular,
  icon: Icon,
  fields,
  columns,
}: {
  type: ItemType;
  title: string;
  singular: string;
  icon: typeof ShieldCheck;
  fields: FieldDef[];
  columns: (item: Record<string, unknown>) => React.ReactNode;
}) {
  const [items, setItems] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editor, setEditor] = React.useState<EditorState>(EMPTY_EDITOR);
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);

  const uploadImage = async (field: string, file: File) => {
    setUploadingField(field);
    try {
      const uploaded = await uploadMediaFile(file, {
        altText: editor.values.name || editor.values.label || editor.values.title || "",
      });
      setEditor((state) => ({ ...state, values: { ...state.values, [field]: uploaded.url } }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingField(null);
    }
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/homepage/items?type=${type}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [type]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    const defaults: Record<string, string> = {};
    for (const f of fields) {
      defaults[f.name] =
        f.type === "select" ? (f.options?.[0]?.value ?? "") : "";
    }
    setEditor({ open: true, item: null, values: defaults, saving: false });
  };

  const openEdit = (item: Record<string, unknown>) => {
    const values: Record<string, string> = {};
    for (const f of fields) {
      const v = item[f.name];
      if (f.type === "date" && typeof v === "string" && v) {
        values[f.name] = v.slice(0, 10);
      } else {
        values[f.name] = v == null ? "" : String(v);
      }
    }
    setEditor({ open: true, item, values, saving: false });
  };

  const save = async () => {
    const missing = fields.find((f) => f.required && !editor.values[f.name]);
    if (missing) return;

    setEditor({ ...editor, saving: true });
    try {
      const payload: Record<string, unknown> = { type };
      for (const f of fields) {
        const raw = editor.values[f.name];
        if (f.type === "date") {
          payload[f.name] = raw ? new Date(raw).toISOString() : null;
        } else if (f.name === "rating") {
          payload[f.name] = parseInt(raw || "5", 10) || 5;
        } else {
          payload[f.name] = raw || null;
        }
      }

      if (editor.item) {
        await fetch(`/api/homepage/items/${(editor.item as { id: string }).id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/homepage/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await load();
      setEditor(EMPTY_EDITOR);
      broadcastHomepageUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setEditor((s) => ({ ...s, saving: false }));
    }
  };

  const toggleActive = async (item: Record<string, unknown>) => {
    try {
      await fetch(`/api/homepage/items/${(item as { id: string }).id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          isActive: !item.isActive,
        }),
      });
      await load();
      broadcastHomepageUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (item: Record<string, unknown>) => {
    if (!confirm(`Delete this ${singular.toLowerCase()}?`)) return;
    try {
      await fetch(
        `/api/homepage/items/${(item as { id: string }).id}?type=${type}`,
        { method: "DELETE" }
      );
      await load();
      broadcastHomepageUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} total · {activeCount} active on the homepage
        </p>
        <Button
          onClick={openNew}
          size="sm"
          className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
        >
          <Plus className="size-4" />
          Add {singular}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Icon className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No {title.toLowerCase()} yet. Add your first one to feature it on
              the homepage.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div
                  key={(item as { id: string }).id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group ${
                    item.isActive ? "hover:bg-slate-50" : "bg-slate-50/60"
                  }`}
                >
                  <span className="text-xs text-slate-300 font-medium w-5 text-center">
                    {idx + 1}
                  </span>
                  {columns(item)}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Switch
                      checked={Boolean(item.isActive)}
                      onCheckedChange={() => toggleActive(item)}
                      aria-label={`Toggle ${singular}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openEdit(item)}
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor dialog */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor(EMPTY_EDITOR)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>
              {editor.item ? `Edit ${singular}` : `Add ${singular}`}
            </DialogTitle>
            <DialogDescription>
              {editor.item
                ? `Update this ${singular.toLowerCase()}.`
                : `Create a new ${singular.toLowerCase()} for the homepage.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label className="text-xs">
                  {f.label}
                  {f.required && " *"}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={editor.values[f.name] || ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        values: { ...editor.values, [f.name]: e.target.value },
                      })
                    }
                    placeholder={f.placeholder}
                    className="text-sm min-h-[80px] resize-none"
                  />
                ) : f.type === "select" ? (
                  <Select
                    value={editor.values[f.name] || f.options?.[0]?.value}
                    onValueChange={(v) =>
                      setEditor({
                        ...editor,
                        values: { ...editor.values, [f.name]: v },
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "image" ? (
                  <div className="space-y-2">
                    <Input
                      value={editor.values[f.name] || ""}
                      onChange={(e) => setEditor({ ...editor, values: { ...editor.values, [f.name]: e.target.value } })}
                      placeholder={f.placeholder || "/uploads/image.png"}
                      className="text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="max-w-xs text-xs"
                        disabled={uploadingField === f.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(f.name, file);
                          e.currentTarget.value = "";
                        }}
                      />
                      {uploadingField === f.name && <Loader2 className="size-4 animate-spin text-brand-600" />}
                    </div>
                    {editor.values[f.name] && <img src={editor.values[f.name]} alt="Selected media" className="h-16 w-24 rounded-md border object-contain" />}
                  </div>
                ) : (
                  <Input
                    type={f.type === "date" ? "date" : "text"}
                    value={editor.values[f.name] || ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        values: { ...editor.values, [f.name]: e.target.value },
                      })
                    }
                    placeholder={f.placeholder}
                    className="text-sm"
                  />
                )}
                {f.hint && (
                  <p className="text-[11px] text-slate-400">{f.hint}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditor(EMPTY_EDITOR)}
              disabled={editor.saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={
                editor.saving ||
                fields.some((f) => f.required && !editor.values[f.name])
              }
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editor.saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editor.item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Item renderers per type (list columns)
// ─────────────────────────────────────────────────────────────

function BadgeColumns({ item }: { item: Record<string, unknown> }) {
  const Icon = TRUST_BADGE_ICONS[String(item.icon)] || ShieldCheck;
  return (
    <>
      <div className="size-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-brand-600" />
      </div>
      <span className="text-sm font-medium text-slate-900 truncate">
        {String(item.label || "")}
      </span>
    </>
  );
}

function LogoColumns({ item }: { item: Record<string, unknown> }) {
  return (
    <>
      <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={String(item.imageUrl)}
            alt={String(item.name)}
            className="size-full object-contain"
          />
        ) : (
          <Building2 className="size-4 text-slate-400" />
        )}
      </div>
      <span className="text-sm font-medium text-slate-900 truncate">
        {String(item.name || "")}
      </span>
      {item.website ? (
        <span className="text-xs text-slate-400 truncate hidden sm:inline">
          {String(item.website)}
        </span>
      ) : null}
    </>
  );
}

function TestimonialColumns({ item }: { item: Record<string, unknown> }) {
  return (
    <>
      <div className="min-w-0 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 truncate">
            {String(item.name || "")}
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star
                key={s}
                className={`size-3 ${
                  s < Number(item.rating || 5)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                }`}
              />
            ))}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">
          {[item.role, item.company].filter(Boolean).join(" · ")} —{" "}
          {String(item.quote || "").slice(0, 60)}
          {String(item.quote || "").length > 60 ? "…" : ""}
        </p>
      </div>
    </>
  );
}

function OfferColumns({ item }: { item: Record<string, unknown> }) {
  const expired =
    item.expiresAt && new Date(String(item.expiresAt)) < new Date();
  return (
    <>
      <div className="min-w-0 max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 truncate">
            {String(item.title || "")}
          </span>
          {item.badge ? (
            <Badge className="bg-brand-500 text-white text-[10px] px-1.5 py-0">
              {String(item.badge)}
            </Badge>
          ) : null}
          {expired ? (
            <Badge
              variant="outline"
              className="text-rose-500 border-rose-200 text-[10px] px-1.5 py-0"
            >
              Expired
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {String(item.description || "").slice(0, 80)}
        </p>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main view — tabbed homepage manager
// ─────────────────────────────────────────────────────────────

export function AdminHomepage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Homepage Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control everything on the public homepage — sections, order,
          visibility, text content, trust badges, client logos, reviews and
          offers.
        </p>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="sections" className="gap-1.5">
            <LayoutTemplate className="size-3.5" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5">
            <Type className="size-3.5" />
            Content
          </TabsTrigger>
          <TabsTrigger value="trust-badges" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Trust Badges
          </TabsTrigger>
          <TabsTrigger value="client-logos" className="gap-1.5">
            <Building2 className="size-3.5" />
            Client Logos
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-1.5">
            <Star className="size-3.5" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-1.5">
            <BadgePercent className="size-3.5" />
            Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-4">
          <SectionsManager />
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <SectionContentEditor />
        </TabsContent>

        <TabsContent value="trust-badges" className="mt-4">
          <ItemManager
            type="trust-badges"
            title="Trust Badges"
            singular="Trust Badge"
            icon={ShieldCheck}
            fields={[
              {
                name: "label",
                label: "Badge text",
                type: "text",
                required: true,
                placeholder: "Google Certified Partner",
              },
              {
                name: "icon",
                label: "Icon",
                type: "select",
                options: ICON_KEYS.map((k) => ({
                  value: k,
                  label: k
                    .split("-")
                    .map((w) => w[0].toUpperCase() + w.slice(1))
                    .join(" "),
                })),
              },
              {
                name: "imageUrl",
                label: "Badge image (optional)",
                type: "image",
                hint: "Upload a partner or certification mark. It replaces the icon on the site.",
              },
            ]}
            columns={(item) => <BadgeColumns item={item} />}
          />
        </TabsContent>

        <TabsContent value="client-logos" className="mt-4">
          <ItemManager
            type="client-logos"
            title="Client Logos"
            singular="Client Logo"
            icon={Building2}
            fields={[
              {
                name: "name",
                label: "Company name",
                type: "text",
                required: true,
                placeholder: "Acme Inc.",
              },
              {
                name: "imageUrl",
                label: "Logo image URL",
                type: "image",
                placeholder: "/uploads/logo.png",
                hint:
                  "Upload from internal storage or paste an image URL. Without an image, the company name is shown as styled text.",
              },
              {
                name: "website",
                label: "Website",
                type: "text",
                placeholder: "https://acme.com",
              },
            ]}
            columns={(item) => <LogoColumns item={item} />}
          />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-4">
          <ItemManager
            type="testimonials"
            title="Client Reviews"
            singular="Review"
            icon={Star}
            fields={[
              {
                name: "name",
                label: "Client name",
                type: "text",
                required: true,
                placeholder: "Jane Smith",
              },
              {
                name: "role",
                label: "Role",
                type: "text",
                placeholder: "VP Marketing",
              },
              {
                name: "company",
                label: "Company",
                type: "text",
                placeholder: "Acme Inc.",
              },
              {
                name: "quote",
                label: "Review",
                type: "textarea",
                required: true,
                placeholder:
                  "Share what the client said about working with you…",
              },
              {
                name: "rating",
                label: "Rating",
                type: "select",
                options: [5, 4, 3, 2, 1].map((n) => ({
                  value: String(n),
                  label: `${n} star${n > 1 ? "s" : ""}`,
                })),
              },
              {
                name: "avatarUrl",
                label: "Avatar URL",
                type: "text",
                placeholder: "/uploads/avatar.jpg",
                hint: "Optional — initials are shown instead.",
              },
            ]}
            columns={(item) => <TestimonialColumns item={item} />}
          />
        </TabsContent>

        <TabsContent value="offers" className="mt-4">
          <ItemManager
            type="offers"
            title="Offers"
            singular="Offer"
            icon={BadgePercent}
            fields={[
              {
                name: "title",
                label: "Offer title",
                type: "text",
                required: true,
                placeholder: "Free SEO Audit",
              },
              {
                name: "description",
                label: "Description",
                type: "textarea",
                required: true,
                placeholder:
                  "Get a comprehensive SEO audit of your website — worth $500 — completely free.",
              },
              {
                name: "badge",
                label: "Badge",
                type: "text",
                placeholder: "LIMITED TIME",
                hint: "Short label shown on the offer card (optional).",
              },
              {
                name: "imageUrl",
                label: "Offer image (optional)",
                type: "image",
                hint: "Upload offer artwork from internal storage.",
              },
              {
                name: "ctaLabel",
                label: "Button label",
                type: "text",
                placeholder: "Claim Offer",
              },
              {
                name: "ctaHref",
                label: "Button link",
                type: "text",
                placeholder: "#strategy-call",
              },
              {
                name: "expiresAt",
                label: "Expires on",
                type: "date",
                hint:
                  "Optional — the offer is hidden from the site automatically after this date.",
              },
            ]}
            columns={(item) => <OfferColumns item={item} />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
