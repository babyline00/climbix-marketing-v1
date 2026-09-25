"use client";

import * as React from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define the editable content fields
const CONTENT_FIELDS: {
  key: string;
  label: string;
  description: string;
  type: "text" | "textarea";
  group: string;
  defaultValue: string;
}[] = [
  // Hero
  {
    key: "hero.headline",
    label: "Hero Headline",
    description: "Main headline on the homepage hero section",
    type: "text",
    group: "Homepage Hero",
    defaultValue: "Turn Search Visibility Into Revenue.",
  },
  {
    key: "hero.subheadline",
    label: "Hero Subheadline",
    description: "Supporting text below the main headline",
    type: "textarea",
    group: "Homepage Hero",
    defaultValue:
      "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
  },
  {
    key: "hero.cta",
    label: "Hero CTA Button Text",
    description: "Text on the primary call-to-action button in the hero",
    type: "text",
    group: "Homepage Hero",
    defaultValue: "Get Your Free Growth Strategy",
  },
  // Final CTA
  {
    key: "finalCta.headline",
    label: "Final CTA Headline",
    description: "Headline at the bottom of the homepage",
    type: "text",
    group: "Final CTA Section",
    defaultValue: "Ready to grow your business?",
  },
  {
    key: "finalCta.subheadline",
    label: "Final CTA Subheadline",
    description: "Supporting text below the final CTA headline",
    type: "textarea",
    group: "Final CTA Section",
    defaultValue:
      "Let's build a marketing strategy designed around your business goals — engineered for visibility, qualified leads, and revenue that compounds.",
  },
  // Contact
  {
    key: "contact.email",
    label: "Contact Email",
    description: "Primary contact email shown in the footer",
    type: "text",
    group: "Contact Information",
    defaultValue: "hello@climbixmarketing.com",
  },
  {
    key: "contact.phone",
    label: "Contact Phone",
    description: "Phone number for the agency",
    type: "text",
    group: "Contact Information",
    defaultValue: "+1 (555) 010-2026",
  },
  {
    key: "contact.address",
    label: "Business Address",
    description: "Physical address shown in the footer",
    type: "textarea",
    group: "Contact Information",
    defaultValue:
      "Remote-first · Serving clients in USA, UK, Canada, Australia, UAE & beyond",
  },
  // Social
  {
    key: "social.linkedin",
    label: "LinkedIn URL",
    description: "Link to your LinkedIn company page",
    type: "text",
    group: "Social Links",
    defaultValue: "https://linkedin.com/company/climbixmarketing",
  },
  {
    key: "social.twitter",
    label: "Twitter / X URL",
    description: "Link to your Twitter/X profile",
    type: "text",
    group: "Social Links",
    defaultValue: "https://twitter.com/climbixmarketing",
  },
  // Stats
  {
    key: "stats.clients",
    label: "Clients Served Stat",
    description: "Number shown in the trust bar (e.g., '120+')",
    type: "text",
    group: "Trust Bar Stats",
    defaultValue: "120+",
  },
  {
    key: "stats.countries",
    label: "Countries Stat",
    description: "Number of countries shown in the trust bar",
    type: "text",
    group: "Trust Bar Stats",
    defaultValue: "18+",
  },
  {
    key: "stats.retention",
    label: "Client Retention Stat",
    description: "Retention percentage shown in the trust bar",
    type: "text",
    group: "Trust Bar Stats",
    defaultValue: "94%",
  },
  {
    key: "stats.revenue",
    label: "Revenue Generated Stat",
    description: "Total revenue generated stat shown in the trust bar",
    type: "text",
    group: "Trust Bar Stats",
    defaultValue: "$24M+",
  },
  {
    key: "seo.defaultTitle",
    label: "Default SEO Title",
    description: "Default title tag for pages without custom SEO (shown in browser tab and Google results)",
    type: "text",
    group: "SEO Settings",
    defaultValue: "Climbix Marketing — SEO, AI Search & Lead Generation Agency",
  },
  {
    key: "seo.defaultDescription",
    label: "Default SEO Description",
    description: "Default meta description for pages without custom SEO (155 characters max recommended)",
    type: "textarea",
    group: "SEO Settings",
    defaultValue:
      "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
  },
];

const GROUPS = [...new Set(CONTENT_FIELDS.map((f) => f.group))];

export function AdminContent() {
  const [content, setContent] = React.useState<Record<string, string>>({});
  const [original, setOriginal] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchContent = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-content");
      const data = await res.json();
      const merged: Record<string, string> = {};
      for (const field of CONTENT_FIELDS) {
        merged[field.key] =
          data.content?.[field.key] ?? field.defaultValue;
      }
      setContent(merged);
      setOriginal(merged);
    } catch (e) {
      console.error(e);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const dirty = React.useMemo(() => {
    return Object.keys(content).some(
      (k) => content[k] !== original[k]
    );
  }, [content, original]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      // Only send changed fields
      const changed: Record<string, string> = {};
      for (const key of Object.keys(content)) {
        if (content[key] !== original[key]) {
          changed[key] = content[key];
        }
      }

      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: changed }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setOriginal({ ...content });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Broadcast content update to other tabs (real-time refresh)
      try {
        const channel = new BroadcastChannel("climbix-content");
        channel.postMessage({ type: "content-updated" });
        channel.close();
      } catch {
        // BroadcastChannel not supported
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to save content"
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setContent(original);
  };

  const update = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Content Editor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit your website's text content — changes save to the database
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={reset}
            disabled={!dirty || saving}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button
            onClick={save}
            disabled={!dirty || saving}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="size-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {dirty && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          <AlertCircle className="size-4 shrink-0" />
          You have unsaved changes. Click "Save Changes" to publish them.
        </div>
      )}

      {/* Content groups */}
      {GROUPS.map((group) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4 text-brand-600" />
              {group}
            </CardTitle>
            <CardDescription>
              {CONTENT_FIELDS.filter((f) => f.group === group).length}{" "}
              editable field(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTENT_FIELDS.filter((f) => f.group === group).map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={content[field.key] || ""}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="min-h-[80px]"
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={content[field.key] || ""}
                    onChange={(e) => update(field.key, e.target.value)}
                  />
                )}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono">{field.key}</span>
                  <span>{(content[field.key] || "").length} chars</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Sticky save bar */}
      {dirty && (
        <div className="sticky bottom-4 z-10">
          <Card className="border-brand-500/40 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold">Unsaved changes</span>
                <span className="text-muted-foreground ml-2">
                  Remember to save before leaving
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={saving}
                  className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
