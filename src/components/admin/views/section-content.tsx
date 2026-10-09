"use client";

import * as React from "react";
import {
  Loader2,
  Save,
  RotateCcw,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { sectionIcon } from "@/components/admin/views/section-icons";
import {
  IMAGE_HEIGHT_PRESETS,
  SECTION_CONTENT_DEFAULTS,
  SECTION_KEYS,
  type SectionItem,
  type SectionKey,
} from "@/lib/section-content";

// ─────────────────────────────────────────────────────────────
// Field schema — describes the editable shape of every section
// ─────────────────────────────────────────────────────────────

type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "items" | "stringlist" | "select";
  itemFields?: { name: string; label: string }[];
  /** Required for `select` — a fixed set of values, so no invalid input. */
  options?: { value: string; label: string }[];
  hint?: string;
};

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  "trust-badges": "Trust Badges",
  "client-logos": "Client Logos",
  offers: "Offers",
  problem: "Problem / Stats",
  services: "Services",
  "why-us": "Why Choose Us",
  "case-studies": "Case Studies",
  process: "Our Process",
  industries: "Industries",
  locations: "Locations",
  "free-audit": "Free Audit Form",
  testimonials: "Client Reviews",
  faq: "FAQ",
  "final-cta": "Final CTA",
};

const FIELD_SCHEMAS: Record<SectionKey, Field[]> = {
  hero: [
    { name: "badge", label: "Badge text", type: "text" },
    { name: "headline", label: "Headline (last word is highlighted)", type: "text" },
    { name: "subheadline", label: "Subheadline", type: "textarea" },
    { name: "ctaLabel", label: "Primary button label", type: "text" },
    { name: "secondaryLabel", label: "Secondary button label", type: "text" },
    { name: "secondaryHref", label: "Secondary button link", type: "text", hint: "e.g. /services" },
    {
      name: "proofs",
      label: "Proof points (under the form)",
      type: "items",
      itemFields: [{ name: "label", label: "Point" }],
    },
  ],
  "trust-badges": [
    {
      name: "imageHeight",
      label: "Badge image size",
      type: "select",
      options: IMAGE_HEIGHT_PRESETS.map((px) => ({
        value: String(px),
        label: `${px}px`,
      })),
      hint: "One size for every badge image and fallback icon, so marks of different proportions still line up.",
    },
    {
      name: "showText",
      label: "Show badge labels",
      type: "select",
      options: [
        { value: "true", label: "Icon + text" },
        { value: "false", label: "Icon only" },
      ],
      hint: "Turn off to show bare marks. Labels stay screen-reader-only, so each badge is still announced.",
    },
  ],
  "client-logos": [
    { name: "intro", label: "Intro line above logos", type: "text" },
    {
      name: "imageHeight",
      label: "Logo image size",
      type: "select",
      options: IMAGE_HEIGHT_PRESETS.map((px) => ({
        value: String(px),
        label: `${px}px`,
      })),
      hint: "Height of each logo in the marquee. Width follows the image, so logos of different proportions keep their shape.",
    },
    {
      name: "showText",
      label: "Show logo text",
      type: "select",
      options: [
        { value: "true", label: "Logo + name" },
        { value: "false", label: "Logo only" },
      ],
      hint: "A logo's name is its text fallback, so turning this off shows only entries that have an uploaded image — and falls back to showing names again if none do. Names stay as alt text either way.",
    },
  ],
  offers: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
  ],
  problem: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    {
      name: "points",
      label: "Problem cards",
      type: "items",
      itemFields: [
        { name: "title", label: "Card title" },
        { name: "desc", label: "Card description" },
      ],
    },
    { name: "footerNote", label: "Footer note", type: "text" },
    { name: "footerLinkLabel", label: "Footer link label", type: "text" },
  ],
  services: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "ctaLabel", label: "Button label", type: "text" },
    { name: "ctaHref", label: "Button link", type: "text", hint: "e.g. /services" },
  ],
  "why-us": [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    {
      name: "reasons",
      label: "Reason cards",
      type: "items",
      itemFields: [
        { name: "title", label: "Card title" },
        { name: "desc", label: "Card description" },
      ],
    },
    { name: "funnelTitle", label: "Growth model title", type: "text" },
    { name: "funnelIntro", label: "Growth model intro", type: "text" },
    {
      name: "funnel",
      label: "Funnel steps",
      type: "items",
      itemFields: [
        { name: "label", label: "Step label" },
        { name: "desc", label: "Step description" },
      ],
    },
  ],
  "case-studies": [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    {
      name: "cases",
      label: "Case study cards",
      type: "items",
      itemFields: [
        { name: "client", label: "Client" },
        { name: "challenge", label: "Challenge" },
        { name: "strategy", label: "Strategy" },
        { name: "metric1Label", label: "Metric 1 label" },
        { name: "metric1Value", label: "Metric 1 value" },
        { name: "metric2Label", label: "Metric 2 label" },
        { name: "metric2Value", label: "Metric 2 value" },
        { name: "metric3Label", label: "Metric 3 label" },
        { name: "metric3Value", label: "Metric 3 value" },
      ],
    },
    { name: "ctaLabel", label: "Button label", type: "text" },
    { name: "ctaHref", label: "Button link", type: "text" },
  ],
  process: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    {
      name: "steps",
      label: "Process steps",
      type: "items",
      itemFields: [
        { name: "title", label: "Step title" },
        { name: "desc", label: "Step description" },
      ],
    },
  ],
  industries: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "ctaLabel", label: "Button label", type: "text" },
    { name: "ctaHref", label: "Button link", type: "text" },
  ],
  locations: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "points", label: "Bullet points", type: "stringlist" },
    {
      name: "locations",
      label: "Location cards",
      type: "items",
      itemFields: [
        { name: "country", label: "Country" },
        { name: "city", label: "Cities" },
        { name: "flag", label: "Country code" },
      ],
    },
  ],
  "free-audit": [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "bullets", label: "Checklist bullets", type: "stringlist" },
  ],
  testimonials: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "ratingNote", label: "Rating note", type: "text" },
  ],
  faq: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "intro", label: "Intro", type: "text" },
    {
      name: "items",
      label: "FAQ items",
      type: "items",
      itemFields: [
        { name: "q", label: "Question" },
        { name: "a", label: "Answer" },
      ],
    },
  ],
  "final-cta": [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "headline", label: "Headline", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "ctaLabel", label: "Primary button label", type: "text" },
    { name: "secondaryLabel", label: "Secondary button label", type: "text" },
    { name: "secondaryHref", label: "Secondary button link", type: "text" },
    { name: "note", label: "Small note under buttons", type: "text" },
  ],
};

type EditableValue = string | SectionItem[] | string[];

function broadcastUpdate() {
  try {
    const channel = new BroadcastChannel("climbix-content");
    channel.postMessage({ type: "homepage-updated" });
    channel.close();
  } catch {
    // BroadcastChannel not supported
  }
}

export function SectionContentEditor() {
  const [selected, setSelected] = React.useState<SectionKey>("hero");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, EditableValue>>(
    {}
  );

  // Load overrides and merge with defaults for editing
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/section-content");
        const data = await res.json();
        const overrides = (data.content ?? {}) as Record<
          string,
          Record<string, unknown>
        >;
        const defaults =
          SECTION_CONTENT_DEFAULTS[selected] as unknown as Record<
            string,
            EditableValue
          >;
        const merged: Record<string, EditableValue> = { ...defaults };
        const override = overrides[selected] ?? {};
        for (const k of Object.keys(defaults)) {
          if (override[k] !== undefined && override[k] !== null) {
            merged[k] = override[k] as EditableValue;
          }
        }
        setValues(merged);
      } catch {
        setValues(
          SECTION_CONTENT_DEFAULTS[selected] as unknown as Record<
            string,
            EditableValue
          >
        );
      } finally {
        setLoading(false);
        setSaved(false);
      }
    })();
  }, [selected]);

  const fields = FIELD_SCHEMAS[selected];

  const setField = (name: string, value: EditableValue) => {
    setValues((v) => ({ ...v, [name]: value }));
    setSaved(false);
  };

  const setItemField = (
    listName: string,
    index: number,
    itemName: string,
    value: string
  ) => {
    setValues((v) => {
      const list = [...(v[listName] as SectionItem[])];
      list[index] = { ...list[index], [itemName]: value };
      return { ...v, [listName]: list };
    });
    setSaved(false);
  };

  const setStringItem = (listName: string, index: number, value: string) => {
    setValues((v) => {
      const list = [...(v[listName] as string[])];
      list[index] = value;
      return { ...v, [listName]: list };
    });
    setSaved(false);
  };

  const addItem = (listName: string, itemFields: { name: string; label: string }[]) => {
    setValues((v) => {
      const list = [...(v[listName] as SectionItem[])];
      const blank: SectionItem = {};
      for (const f of itemFields) blank[f.name] = "";
      list.push(blank);
      return { ...v, [listName]: list };
    });
    setSaved(false);
  };

  const addStringItem = (listName: string) => {
    setValues((v) => {
      const list = [...(v[listName] as string[])];
      list.push("");
      return { ...v, [listName]: list };
    });
    setSaved(false);
  };

  const removeItem = (listName: string, index: number) => {
    setValues((v) => {
      const list = [...(v[listName] as SectionItem[] | string[])];
      list.splice(index, 1);
      return { ...v, [listName]: list } as Record<string, EditableValue>;
    });
    setSaved(false);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/section-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selected, data: values }),
      });
      if (res.ok) {
        setSaved(true);
        broadcastUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/section-content?key=${encodeURIComponent(selected)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setValues(
          SECTION_CONTENT_DEFAULTS[selected] as unknown as Record<
            string,
            EditableValue
          >
        );
        setSaved(false);
        broadcastUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <Tabs
              value={selected}
              onValueChange={(v) => setSelected(v as SectionKey)}
              className="w-full"
            >
              <TabsList className="flex-wrap h-auto">
                {SECTION_KEYS.map((key) => {
                  const Icon = sectionIcon(key);
                  return (
                    <TabsTrigger key={key} value={key} className="gap-1.5">
                      <Icon className="size-3.5" />
                      {SECTION_LABELS[key]}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={saving || loading}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving || loading}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>

          {saved && (
            <p className="text-xs text-emerald-600 font-medium">
              Saved — the homepage reflects your changes immediately.
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : fields.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <FileText className="size-4 shrink-0" />
              This section&apos;s items (badges, logos, reviews, offers) are
              managed in their dedicated tabs — no extra text content here.
            </div>
          ) : (
            <div className="space-y-5">
              {fields.map((field) => {
                if (field.type === "text" || field.type === "textarea") {
                  const value = (values[field.name] as string) ?? "";
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <Label>{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          rows={3}
                          value={value}
                          onChange={(e) =>
                            setField(field.name, e.target.value)
                          }
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) =>
                            setField(field.name, e.target.value)
                          }
                        />
                      )}
                      {field.hint && (
                        <p className="text-xs text-muted-foreground">
                          {field.hint}
                        </p>
                      )}
                    </div>
                  );
                }

                if (field.type === "select") {
                  const value = (values[field.name] as string) ?? "";
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <Label>{field.label}</Label>
                      <Select
                        value={value}
                        onValueChange={(v) => setField(field.name, v)}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.hint && (
                        <p className="text-xs text-muted-foreground">
                          {field.hint}
                        </p>
                      )}
                    </div>
                  );
                }

                if (field.type === "stringlist") {
                  const list = (values[field.name] as string[]) ?? [];
                  return (
                    <div key={field.name} className="space-y-2">
                      <Label>{field.label}</Label>
                      {list.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={item}
                            onChange={(e) =>
                              setStringItem(field.name, i, e.target.value)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(field.name, i)}
                            aria-label="Remove"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addStringItem(field.name)}
                      >
                        <Plus className="size-3.5" />
                        Add item
                      </Button>
                    </div>
                  );
                }

                // items
                const list = (values[field.name] as SectionItem[]) ?? [];
                return (
                  <div key={field.name} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="space-y-3">
                      {list.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-border bg-muted/20 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Item {i + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(field.name, i)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                          {field.itemFields?.map((sub) => (
                            <div key={sub.name} className="space-y-1">
                              <span className="text-xs text-muted-foreground">
                                {sub.label}
                              </span>
                              {sub.name === "a" || sub.name === "desc" ? (
                                <Textarea
                                  rows={2}
                                  value={item[sub.name] ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      field.name,
                                      i,
                                      sub.name,
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <Input
                                  value={item[sub.name] ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      field.name,
                                      i,
                                      sub.name,
                                      e.target.value
                                    )
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(field.name, field.itemFields!)}
                    >
                      <Plus className="size-3.5" />
                      Add item
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
