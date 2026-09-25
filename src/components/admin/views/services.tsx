"use client";

import * as React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  FileText,
  Sparkles,
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
import {
  SERVICE_ICON_KEYS,
  getServiceIcon,
} from "@/data/services";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Pair = { title: string; desc: string };
type NameDesc = { name: string; desc: string };
type Step = { no: string; title: string; desc: string };
type Metric = { value: string; label: string };
type Faq = { q: string; a: string };

type ServiceData = {
  hero: {
    eyebrow: string;
    headline: string;
    highlight: string;
    subheading: string;
    cta: string;
  };
  problem: { title: string; intro: string; points: Pair[] };
  framework: { title: string; intro: string; pillars: NameDesc[] };
  subServices: { title: string; items: NameDesc[] };
  process: { title: string; steps: Step[] };
  results: {
    title: string;
    intro: string;
    metrics: Metric[];
    blurb: string;
  };
  faq: Faq[];
  finalCta: { headline: string; subheading: string };
};

type Row = {
  rowId: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  accent: string;
  border: string;
  cardDesc: string;
  cardPoints: string[];
  data: ServiceData;
  isActive: boolean;
  position: number;
};

type Form = Omit<Row, "rowId"> & { rowId: string | null };

export const BLANK_SERVICE_DATA: ServiceData = {
  hero: {
    eyebrow: "",
    headline: "",
    highlight: "growth.",
    subheading: "",
    cta: "Get Started",
  },
  problem: { title: "", intro: "", points: [] },
  framework: { title: "", intro: "", pillars: [] },
  subServices: { title: "What's included", items: [] },
  process: { title: "How we work with you", steps: [] },
  results: { title: "What this delivers", intro: "", metrics: [], blurb: "" },
  faq: [],
  finalCta: { headline: "", subheading: "" },
};

const BLANK_FORM: Form = {
  rowId: null,
  slug: "",
  name: "",
  shortName: "",
  tagline: "",
  icon: "sparkles",
  accent: "from-brand-500/20 to-brand-700/10",
  border: "border-brand-500/30",
  cardDesc: "",
  cardPoints: [],
  data: BLANK_SERVICE_DATA,
  isActive: true,
  position: 0,
};

const ACCENTS = [
  "from-brand-500/20 to-brand-700/10",
  "from-violet-500/20 to-violet-700/10",
  "from-amber-500/20 to-amber-700/10",
  "from-rose-500/20 to-rose-700/10",
  "from-sky-500/20 to-sky-700/10",
  "from-orange-500/20 to-orange-700/10",
  "from-emerald-500/20 to-emerald-700/10",
  "from-indigo-500/20 to-indigo-700/10",
];

const BORDERS = [
  "border-brand-500/30",
  "border-violet-500/30",
  "border-amber-500/30",
  "border-rose-500/30",
  "border-sky-500/30",
  "border-orange-500/30",
  "border-emerald-500/30",
  "border-indigo-500/30",
];

function rowFrom(raw: Record<string, unknown>): Row {
  const data: ServiceData = BLANK_SERVICE_DATA;
  return {
    rowId: String(raw.rowId ?? ""),
    slug: String(raw.slug ?? ""),
    name: String(raw.name ?? ""),
    shortName: String(raw.shortName ?? ""),
    tagline: String(raw.tagline ?? ""),
    icon: String(raw.icon || "sparkles"),
    accent: String(raw.accent || ACCENTS[0]),
    border: String(raw.border || BORDERS[0]),
    cardDesc: String(raw.cardDesc ?? ""),
    cardPoints: Array.isArray(raw.cardPoints) ? raw.cardPoints.map(String) : [],
    data: {
      hero: {
        ...data.hero,
        ...(raw.hero ? (raw.hero as Partial<ServiceData["hero"]>) : {}),
      },
      problem: {
        ...data.problem,
        ...(raw.problem ? (raw.problem as Partial<ServiceData["problem"]>) : {}),
      },
      framework: {
        ...data.framework,
        ...(raw.framework
          ? (raw.framework as Partial<ServiceData["framework"]>)
          : {}),
      },
      subServices: {
        ...data.subServices,
        ...(raw.subServices
          ? (raw.subServices as Partial<ServiceData["subServices"]>)
          : {}),
      },
      process: {
        ...data.process,
        ...(raw.process ? (raw.process as Partial<ServiceData["process"]>) : {}),
      },
      results: {
        ...data.results,
        ...(raw.results ? (raw.results as Partial<ServiceData["results"]>) : {}),
      },
      faq: Array.isArray(raw.faq) ? (raw.faq as Faq[]) : [],
      finalCta: {
        ...data.finalCta,
        ...(raw.finalCta
          ? (raw.finalCta as Partial<ServiceData["finalCta"]>)
          : {}),
      },
    },
    isActive: Boolean(raw.isActive),
    position: Number(raw.position ?? 0),
  };
}

function formFrom(row: Row): Form {
  const { rowId, ...rest } = row;
  return { ...rest, rowId };
}

const TABS = [
  { value: "basics", label: "Basics" },
  { value: "card", label: "Card" },
  { value: "hero", label: "Hero" },
  { value: "problem", label: "Problem" },
  { value: "framework", label: "Framework" },
  { value: "subservices", label: "Sub-services" },
  { value: "process", label: "Process" },
  { value: "results", label: "Results" },
  { value: "faq", label: "FAQ" },
  { value: "finalcta", label: "Final CTA" },
];

// ─────────────────────────────────────────────────────────────
// Small reusable editors
// ─────────────────────────────────────────────────────────────

function ItemRowEditor<T extends Record<string, string>>({
  value,
  fields,
  onChange,
  onRemove,
}: {
  value: T;
  fields: { key: string; label: string; textarea?: boolean }[];
  onChange: (next: T) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Item
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      {fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <span className="text-xs text-muted-foreground">{f.label}</span>
          {f.textarea ? (
            <Textarea
              rows={2}
              value={value[f.key] ?? ""}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              className="text-sm min-h-[60px] resize-none"
            />
          ) : (
            <Input
              value={value[f.key] ?? ""}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              className="text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ItemsEditor<T extends Record<string, string>>({
  items,
  fields,
  onChange,
  blank,
  addLabel = "Add item",
  factory,
}: {
  items: T[];
  fields: { key: string; label: string; textarea?: boolean }[];
  onChange: (next: T[]) => void;
  blank: T;
  addLabel?: string;
  factory?: (i: number) => T;
}) {
  const add = () => {
    onChange([...items, factory ? factory(items.length) : { ...blank }]);
  };
  return (
    <div className="space-y-2">
      <div className="space-y-3">
        {items.map((item, i) => (
          <ItemRowEditor
            key={i}
            value={item}
            fields={fields}
            onChange={(next) => {
              const copy = [...items];
              copy[i] = next;
              onChange(copy);
            }}
            onRemove={() => onChange(items.filter((_, idx) => idx !== i))}
          />
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {textarea ? (
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm min-h-[80px] resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Editor dialog
// ─────────────────────────────────────────────────────────────

function ServiceDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  saving: boolean;
  onSave: () => void;
}) {
  const setData = (patch: Partial<ServiceData>) =>
    setForm((f) => ({ ...f, data: { ...f.data, ...patch } as ServiceData }));

  const setText = (key: keyof Omit<Form, "data" | "rowId">, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setHero = (patch: Partial<ServiceData["hero"]>) =>
    setData({ hero: { ...form.data.hero, ...patch } });
  const setProblem = (patch: Partial<ServiceData["problem"]>) =>
    setData({ problem: { ...form.data.problem, ...patch } });
  const setFramework = (patch: Partial<ServiceData["framework"]>) =>
    setData({ framework: { ...form.data.framework, ...patch } });
  const setSubServices = (patch: Partial<ServiceData["subServices"]>) =>
    setData({ subServices: { ...form.data.subServices, ...patch } });
  const setProcess = (patch: Partial<ServiceData["process"]>) =>
    setData({ process: { ...form.data.process, ...patch } });
  const setResults = (patch: Partial<ServiceData["results"]>) =>
    setData({ results: { ...form.data.results, ...patch } });
  const setFinalCta = (patch: Partial<ServiceData["finalCta"]>) =>
    setData({ finalCta: { ...form.data.finalCta, ...patch } });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle>
            {form.rowId ? `Edit service — ${form.name || form.slug}` : "Add service"}
          </DialogTitle>
          <DialogDescription>
            Changes go live on the homepage, /services and the service page.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basics" className="flex flex-col flex-1 min-h-0">
          <TabsList className="flex-wrap h-auto px-6 py-2 border-b border-border rounded-none bg-transparent justify-start shrink-0">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
            <TabsContent value="basics" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(v) => setText("name", v)}
                  placeholder="SEO Services"
                />
                <TextField
                  label="Short name"
                  value={form.shortName}
                  onChange={(v) => setText("shortName", v)}
                  placeholder="SEO"
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug (URL: /services/slug)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setText("slug", e.target.value)}
                    placeholder="seo"
                    className="text-sm font-mono"
                  />
                </div>
                <TextField
                  label="Tagline"
                  value={form.tagline}
                  onChange={(v) => setText("tagline", v)}
                  placeholder="Organic visibility that compounds into revenue"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Icon</Label>
                  <Select value={form.icon} onValueChange={(v) => setText("icon", v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_ICON_KEYS.map((k) => {
                        const Icon = getServiceIcon(k);
                        return (
                          <SelectItem key={k} value={k}>
                            <span className="flex items-center gap-2">
                              <Icon className="size-3.5" />
                              {k}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Card accent gradient</Label>
                  <Select value={form.accent} onValueChange={(v) => setText("accent", v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENTS.map((a) => (
                        <SelectItem key={a} value={a}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`size-3 rounded-full bg-gradient-to-br ${a}`}
                            />
                            {a}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Card hover border</Label>
                  <Select value={form.border} onValueChange={(v) => setText("border", v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDERS.map((b) => (
                        <SelectItem key={b} value={b}>
                          <span className="flex items-center gap-2">
                            <span className={`size-3 rounded-full border ${b}`} />
                            {b}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Display order</Label>
                  <Input
                    type="number"
                    value={form.position}
                    onChange={(e) =>
                      setText("position", parseInt(e.target.value || "0", 10) || 0)
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setText("isActive", v)}
                  aria-label="Active"
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "Visible on the site" : "Hidden from the site"}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <TextField
                label="Grid card description"
                value={form.cardDesc}
                onChange={(v) => setText("cardDesc", v)}
                textarea
                placeholder="Build sustainable organic growth with technical SEO…"
              />
              <div className="space-y-2">
                <Label className="text-xs">Grid card bullets</Label>
                {form.cardPoints.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={p}
                      onChange={(e) =>
                        setForm((f) => {
                          const copy = [...f.cardPoints];
                          copy[i] = e.target.value;
                          return { ...f, cardPoints: copy };
                        })
                      }
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          cardPoints: f.cardPoints.filter((_, idx) => idx !== i),
                        }))
                      }
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({ ...f, cardPoints: [...f.cardPoints, ""] }))
                  }
                >
                  <Plus className="size-3.5" />
                  Add bullet
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="hero" className="space-y-4">
              <TextField label="Eyebrow" value={form.data.hero.eyebrow} onChange={(v) => setHero({ eyebrow: v })} />
              <TextField label="Headline" value={form.data.hero.headline} onChange={(v) => setHero({ headline: v })} />
              <TextField label="Highlight (gradient word)" value={form.data.hero.highlight} onChange={(v) => setHero({ highlight: v })} />
              <TextField label="Subheading" value={form.data.hero.subheading} onChange={(v) => setHero({ subheading: v })} textarea />
              <TextField label="CTA label" value={form.data.hero.cta} onChange={(v) => setHero({ cta: v })} />
            </TabsContent>

            <TabsContent value="problem" className="space-y-4">
              <TextField label="Title" value={form.data.problem.title} onChange={(v) => setProblem({ title: v })} />
              <TextField label="Intro" value={form.data.problem.intro} onChange={(v) => setProblem({ intro: v })} textarea />
              <ItemsEditor
                items={form.data.problem.points}
                fields={[
                  { key: "title", label: "Point title" },
                  { key: "desc", label: "Description", textarea: true },
                ]}
                blank={{ title: "", desc: "" }}
                addLabel="Add problem point"
                onChange={(points) => setProblem({ points })}
              />
            </TabsContent>

            <TabsContent value="framework" className="space-y-4">
              <TextField label="Title" value={form.data.framework.title} onChange={(v) => setFramework({ title: v })} />
              <TextField label="Intro" value={form.data.framework.intro} onChange={(v) => setFramework({ intro: v })} textarea />
              <ItemsEditor
                items={form.data.framework.pillars}
                fields={[
                  { key: "name", label: "Pillar name" },
                  { key: "desc", label: "Description", textarea: true },
                ]}
                blank={{ name: "", desc: "" }}
                addLabel="Add pillar"
                onChange={(pillars) => setFramework({ pillars })}
              />
            </TabsContent>

            <TabsContent value="subservices" className="space-y-4">
              <TextField label="Title" value={form.data.subServices.title} onChange={(v) => setSubServices({ title: v })} />
              <ItemsEditor
                items={form.data.subServices.items}
                fields={[
                  { key: "name", label: "Item name" },
                  { key: "desc", label: "Description", textarea: true },
                ]}
                blank={{ name: "", desc: "" }}
                addLabel="Add included item"
                onChange={(items) => setSubServices({ items })}
              />
            </TabsContent>

            <TabsContent value="process" className="space-y-4">
              <TextField label="Title" value={form.data.process.title} onChange={(v) => setProcess({ title: v })} />
              <ItemsEditor
                items={form.data.process.steps}
                fields={[
                  { key: "no", label: "Number" },
                  { key: "title", label: "Step title" },
                  { key: "desc", label: "Description", textarea: true },
                ]}
                blank={{ no: "", title: "", desc: "" }}
                factory={(i) => ({
                  no: String(i + 1).padStart(2, "0"),
                  title: "",
                  desc: "",
                })}
                addLabel="Add step"
                onChange={(steps) => setProcess({ steps })}
              />
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <TextField label="Title" value={form.data.results.title} onChange={(v) => setResults({ title: v })} />
              <TextField label="Intro" value={form.data.results.intro} onChange={(v) => setResults({ intro: v })} textarea />
              <TextField label="Case study blurb" value={form.data.results.blurb} onChange={(v) => setResults({ blurb: v })} textarea />
              <ItemsEditor
                items={form.data.results.metrics}
                fields={[
                  { key: "value", label: "Metric value" },
                  { key: "label", label: "Metric label" },
                ]}
                blank={{ value: "", label: "" }}
                addLabel="Add metric"
                onChange={(metrics) => setResults({ metrics })}
              />
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <ItemsEditor
                items={form.data.faq}
                fields={[
                  { key: "q", label: "Question", textarea: true },
                  { key: "a", label: "Answer", textarea: true },
                ]}
                blank={{ q: "", a: "" }}
                addLabel="Add FAQ"
                onChange={(faq) => setData({ faq })}
              />
            </TabsContent>

            <TabsContent value="finalcta" className="space-y-4">
              <TextField label="Headline" value={form.data.finalCta.headline} onChange={(v) => setFinalCta({ headline: v })} />
              <TextField label="Subheading" value={form.data.finalCta.subheading} onChange={(v) => setFinalCta({ subheading: v })} textarea />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.name || !form.slug}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {form.rowId ? "Update service" : "Create service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────

export function AdminServices() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<Form>(BLANK_FORM);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setRows((data.services ?? []).map((r: Record<string, unknown>) => rowFrom(r)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(BLANK_FORM);
    setOpen(true);
  };

  const openEdit = (row: Row) => {
    setForm(formFrom(row));
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        shortName: form.shortName,
        tagline: form.tagline,
        icon: form.icon,
        accent: form.accent,
        border: form.border,
        cardDesc: form.cardDesc,
        cardPoints: form.cardPoints,
        data: form.data,
        isActive: form.isActive,
        position: form.position,
      };
      const url = form.rowId ? `/api/services/${encodeURIComponent(form.rowId)}` : "/api/services";
      const res = await fetch(url, {
        method: form.rowId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to save service");
        return;
      }
      setOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: Row) => {
    await fetch(`/api/services/${encodeURIComponent(row.rowId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    }).catch(console.error);
    await load();
  };

  const onDelete = async (row: Row) => {
    const isStaticFallback = row.rowId.startsWith("static:");
    const ok = confirm(
      isStaticFallback
        ? `"${row.name}" is currently using its default content. Delete it? (It will revert back to defaults — the service stays on the site.)`
        : `Delete service "${row.name}"? This removes it from the site.`
    );
    if (!ok) return;
    await fetch(`/api/services/${encodeURIComponent(row.rowId)}`, {
      method: "DELETE",
    }).catch(console.error);
    await load();
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const a = next[index];
    const b = next[target];
    next[index] = { ...a, position: b.position };
    next[target] = { ...b, position: a.position };
    setRows(next);
    await Promise.all(
      next.map((r) =>
        fetch(`/api/services/${encodeURIComponent(r.rowId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: r.position }),
        }).catch(() => null)
      )
    );
    await load();
  };

  const activeCount = rows.filter((r) => r.isActive).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Services
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the full service catalog — the homepage grid, the /services
            overview and every service page update automatically.
          </p>
        </div>
        <Button
          onClick={openNew}
          size="sm"
          className="bg-brand-600 hover:bg-brand-700 text-white shrink-0"
        >
          <Plus className="size-4" />
          Add Service
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        {rows.length} services · {activeCount} visible on the site · idle
        rows fall back to their default content until edited.
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No services yet. Add your first one to feature it on the site.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-2">
            <div className="space-y-1">
              {rows.map((row, i) => {
                const Icon = getServiceIcon(row.icon);
                const isFallback = row.rowId.startsWith("static:");
                return (
                  <div
                    key={row.rowId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group ${
                      row.isActive ? "hover:bg-slate-50" : "bg-slate-50/60"
                    }`}
                  >
                    <div className="flex flex-col">
                      <button
                        onClick={() => reorder(i, -1)}
                        disabled={i === 0}
                        className="text-slate-400 hover:text-brand-600 disabled:opacity-30"
                        aria-label={`Move ${row.name} up`}
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => reorder(i, 1)}
                        disabled={i === rows.length - 1}
                        className="text-slate-400 hover:text-brand-600 disabled:opacity-30"
                        aria-label={`Move ${row.name} down`}
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>

                    <div
                      className={`size-10 rounded-xl bg-gradient-to-br ${row.accent} flex items-center justify-center ring-1 ring-inset ring-black/5 shrink-0`}
                    >
                      <Icon className="size-5 text-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate ${
                            row.isActive ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {row.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-200 font-mono"
                        >
                          /services/{row.slug}
                        </Badge>
                        {isFallback && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
                            Defaults
                          </Badge>
                        )}
                        {!row.isActive && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-rose-500 border-rose-200"
                          >
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {row.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                      {row.isActive ? (
                        <Eye className="size-4 text-brand-600" />
                      ) : (
                        <EyeOff className="size-4 text-slate-300" />
                      )}
                      <Switch
                        checked={row.isActive}
                        onCheckedChange={() => toggleActive(row)}
                        aria-label={`Toggle ${row.name}`}
                      />
                      <a
                        href={`/services/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-slate-400 hover:text-brand-600"
                        aria-label={`Open ${row.name}`}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(row)}
                        aria-label={`Edit ${row.name}`}
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => onDelete(row)}
                        aria-label={`Delete ${row.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <ServiceDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) setOpen(false);
          else setOpen(true);
        }}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={save}
      />
    </div>
  );
}