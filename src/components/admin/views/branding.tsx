"use client";

import * as React from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Upload,
  Trash2,
  Eye,
  Palette,
  Type,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BrandLockup } from "@/components/site/brand-mark";
import { DEFAULT_BRAND, resolveBrand, type BrandSettings } from "@/lib/brand";
import { uploadMediaFile } from "@/lib/upload-client";

type Media = { id: string; filename: string; url: string; type: string };

const BRAND_KEYS = [
  "branding.siteName",
  "branding.logoUrl",
  "branding.logoAlt",
  "branding.faviconUrl",
  "branding.showName",
  "general.appName",
] as const;

/**
 * Branding tab — logo upload, wordmark rename and favicon.
 *
 * Writes to the same `Setting` keys the public header reads, so a save here is
 * visible on every page. The preview uses the real `BrandLockup` component, so
 * what you see is exactly what ships.
 */
export function AdminBranding() {
  const [brand, setBrand] = React.useState<BrandSettings>(DEFAULT_BRAND);
  const [original, setOriginal] = React.useState<BrandSettings>(DEFAULT_BRAND);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [media, setMedia] = React.useState<Media[]>([]);
  const [showPicker, setShowPicker] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load branding");
        const data = await res.json();
        const resolved = resolveBrand(data.settings || {});
        setBrand(resolved);
        setOriginal(resolved);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load branding");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/media");
        if (!res.ok) return;
        const data = await res.json();
        setMedia((data.media || []).filter((m: Media) => m.type === "image"));
      } catch {
        // Media library is optional for branding — uploads still work.
      }
    })();
  }, []);

  const dirty = React.useMemo(
    () => BRAND_KEYS.some((k) => {
      const map: Record<string, [string, string]> = {
        "branding.siteName": [brand.siteName, original.siteName],
        "branding.logoUrl": [brand.logoUrl, original.logoUrl],
        "branding.logoAlt": [brand.logoAlt, original.logoAlt],
        "branding.faviconUrl": [brand.faviconUrl, original.faviconUrl],
        "branding.showName": [String(brand.showName), String(original.showName)],
        "general.appName": [brand.appName, original.appName],
      };
      return map[k][0] !== map[k][1];
    }),
    [brand, original]
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            "branding.siteName": brand.siteName.trim() || DEFAULT_BRAND.siteName,
            "branding.logoUrl": brand.logoUrl,
            "branding.logoAlt": brand.logoAlt,
            "branding.faviconUrl": brand.faviconUrl,
            "branding.showName": String(brand.showName),
            "general.appName": brand.appName.trim() || DEFAULT_BRAND.appName,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save branding");
      }
      setOriginal({ ...brand });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadMediaFile(file, {
        title: file.name,
        altText: brand.siteName,
      });
      setBrand((b) => ({ ...b, logoUrl: uploaded.url }));
      setMedia((m) => [uploaded, ...m]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => setBrand(original);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Branding
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your logo, website name and favicon — shown in the site header,
            mobile menu and browser tab
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} disabled={!dirty || saving}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button
            onClick={save}
            disabled={!dirty || saving}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700"
        >
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

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="size-4 text-brand-600" />
                Logo
              </CardTitle>
              <CardDescription>
                Upload your logo, or pick one from the media library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-ink-900">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt=""
                      className="max-h-12 max-w-[5.5rem] object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-white/50 text-center px-1 leading-tight">
                      Default
                      <br />
                      mark
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {brand.logoUrl ? "Custom logo" : "Built-in gradient mark"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {brand.logoUrl || "No logo uploaded yet"}
                  </p>
                </div>
                {brand.logoUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBrand({ ...brand, logoUrl: "" })}
                    aria-label="Remove logo and restore the default mark"
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.currentTarget.value = "";
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload Logo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPicker(!showPicker)}
                  className="flex-1"
                >
                  <ImageIcon className="size-4" />
                  Media Library
                </Button>
              </div>

              {showPicker && (
                <div className="rounded-xl border border-slate-200 p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {media.length === 0 ? (
                      <p className="col-span-4 text-xs text-slate-400 text-center py-4">
                        No images in media library
                      </p>
                    ) : (
                      media.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setBrand({ ...brand, logoUrl: m.url });
                            setShowPicker(false);
                          }}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <img
                            src={m.url}
                            alt={m.filename}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Square or wide images both work. Transparent PNG or SVG gives
                the cleanest result on the dark header.
              </p>
            </CardContent>
          </Card>

          {/* Names */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="size-4 text-brand-600" />
                Website Name
              </CardTitle>
              <CardDescription>
                Rename the brand shown beside your logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand-site-name" className="text-sm font-medium">
                  Header name
                </Label>
                <Input
                  id="brand-site-name"
                  value={brand.siteName}
                  maxLength={40}
                  onChange={(e) => setBrand({ ...brand, siteName: e.target.value })}
                  placeholder="Climbix"
                />
                <p className="text-[11px] text-slate-400">
                  The last two letters get the gradient highlight. Leave empty
                  to hide the text and show the logo alone.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <div className="min-w-0">
                  <Label
                    htmlFor="brand-show-name"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Show name beside the logo
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    Turn off for a logo-only header
                  </p>
                </div>
                <Switch
                  id="brand-show-name"
                  checked={brand.showName}
                  onCheckedChange={(v) => setBrand({ ...brand, showName: v })}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="brand-app-name"
                  className="text-sm font-medium"
                >
                  Full business name
                </Label>
                <Input
                  id="brand-app-name"
                  value={brand.appName}
                  maxLength={80}
                  onChange={(e) => setBrand({ ...brand, appName: e.target.value })}
                  placeholder="Climbix Marketing"
                />
                <p className="text-[11px] text-slate-400">
                  Used in the mobile menu, footer copyright and admin emails
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="brand-logo-alt"
                  className="text-sm font-medium"
                >
                  Logo alt text
                </Label>
                <Input
                  id="brand-logo-alt"
                  value={brand.logoAlt}
                  maxLength={120}
                  onChange={(e) => setBrand({ ...brand, logoAlt: e.target.value })}
                  placeholder={brand.siteName || "Climbix"}
                />
                <p className="text-[11px] text-slate-400">
                  Describes the logo for screen readers and search engines
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Favicon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="size-4 text-brand-600" />
                Favicon
              </CardTitle>
              <CardDescription>
                The small icon browsers show in the tab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={brand.faviconUrl}
                onChange={(e) =>
                  setBrand({ ...brand, faviconUrl: e.target.value })
                }
                placeholder="/logo.svg"
                aria-label="Favicon URL"
              />
              <p className="text-[11px] text-slate-400">
                Upload a 32×32 or 64×64 image in Media Library, then paste its
                path here. Falls back to your logo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="size-4 text-brand-600" />
                Header Preview
              </CardTitle>
              <CardDescription>
                Exactly how the site header will render
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <div className="bg-ink-900 px-4 py-4">
                  <div className="flex h-11 items-center justify-between gap-3">
                    <div className="group flex items-center gap-2 min-w-0">
                      <BrandLockup brand={brand} />
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[13px] text-white/60">Services</span>
                      <span className="text-[13px] text-white/60">Pricing</span>
                      <span className="rounded-lg bg-brand-600 px-2.5 py-1 text-[12px] font-semibold text-white">
                        Get Started
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-background px-4 py-6 flex flex-col items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Page content
                  </span>
                  <div className="h-1.5 w-24 rounded-full bg-muted" />
                  <div className="h-1.5 w-16 rounded-full bg-muted" />
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Summary</p>
                <p>
                  <span className="text-slate-400">Logo:</span>{" "}
                  {brand.logoUrl ? "custom upload" : "built-in gradient mark"}
                </p>
                <p>
                  <span className="text-slate-400">Header name:</span>{" "}
                  {brand.showName && brand.siteName.trim()
                    ? brand.siteName
                    : "hidden"}
                </p>
                <p>
                  <span className="text-slate-400">Full name:</span>{" "}
                  {brand.appName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-10">
          <Card className="border-brand-500/40 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold">Unsaved changes</span>
                <span className="text-slate-500 ml-2">
                  Save before leaving
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
