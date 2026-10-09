"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Eye,
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
import { uploadMediaFile } from "@/lib/upload-client";
import { toast } from "sonner";

type Media = {
  id: string;
  filename: string;
  url: string;
  type: string;
};

const DEFAULT_HERO = {
  headline: "Turn Search Visibility Into Revenue.",
  subheadline:
    "We help ambitious businesses grow through SEO, AI Search Optimization, and data-driven lead generation strategies — built for predictable, scalable revenue.",
  cta: "Get Your Free Growth Strategy",
  bgGradient: "from-brand-500/20 to-brand-700/10",
  heroImage: "",
};

export function AdminAppearance() {
  const [content, setContent] = React.useState(DEFAULT_HERO);
  const [original, setOriginal] = React.useState(DEFAULT_HERO);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [media, setMedia] = React.useState<Media[]>([]);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch existing content
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-content");
        const data = await res.json();
        const merged = {
          headline:
            data.content?.["hero.headline"] || DEFAULT_HERO.headline,
          subheadline:
            data.content?.["hero.subheadline"] || DEFAULT_HERO.subheadline,
          cta: data.content?.["hero.cta"] || DEFAULT_HERO.cta,
          bgGradient:
            data.content?.["hero.bgGradient"] || DEFAULT_HERO.bgGradient,
          heroImage:
            data.content?.["hero.heroImage"] || DEFAULT_HERO.heroImage,
        };
        setContent(merged);
        setOriginal(merged);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Fetch media for picker
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        setMedia((data.media || []).filter((m: Media) => m.type === "image"));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const dirty = React.useMemo(
    () => Object.keys(content).some((k) => content[k as keyof typeof content] !== original[k as keyof typeof original]),
    [content, original]
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const changed: Record<string, string> = {};
      if (content.headline !== original.headline)
        changed["hero.headline"] = content.headline;
      if (content.subheadline !== original.subheadline)
        changed["hero.subheadline"] = content.subheadline;
      if (content.cta !== original.cta) changed["hero.cta"] = content.cta;
      if (content.bgGradient !== original.bgGradient)
        changed["hero.bgGradient"] = content.bgGradient;
      if (content.heroImage !== original.heroImage)
        changed["hero.heroImage"] = content.heroImage;

      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: changed }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setOriginal({ ...content });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setContent(original);

  const uploadImage = async (file: File) => {
    try {
      const uploaded = await uploadMediaFile(file, { title: file.name });
      setContent({ ...content, heroImage: uploaded.url });
      setMedia([...media, uploaded]);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Image upload failed");
    }
  };

  const GRADIENT_OPTIONS = [
    { value: "from-brand-500/20 to-brand-700/10", label: "Emerald", color: "bg-gradient-to-br from-brand-500 to-brand-700" },
    { value: "from-violet-500/20 to-violet-700/10", label: "Violet", color: "bg-gradient-to-br from-violet-500 to-violet-700" },
    { value: "from-sky-500/20 to-sky-700/10", label: "Sky", color: "bg-gradient-to-br from-sky-500 to-sky-700" },
    { value: "from-rose-500/20 to-rose-700/10", label: "Rose", color: "bg-gradient-to-br from-rose-500 to-rose-700" },
    { value: "from-amber-500/20 to-amber-700/10", label: "Amber", color: "bg-gradient-to-br from-amber-500 to-amber-700" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Appearance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your hero section, background, and visual style
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Editor */}
        <div className="space-y-4">
          {/* Hero Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="size-4 text-brand-600" />
                Hero Section Text
              </CardTitle>
              <CardDescription>
                Main headline and subheadline shown on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="hero-headline" className="text-sm font-medium">
                  Headline
                </Label>
                <Textarea
                  id="hero-headline"
                  value={content.headline}
                  onChange={(e) =>
                    setContent({ ...content, headline: e.target.value })
                  }
                  className="min-h-[60px]"
                />
                <p className="text-[10px] text-slate-400">
                  The last word will be highlighted with gradient
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hero-subheadline" className="text-sm font-medium">
                  Subheadline
                </Label>
                <Textarea
                  id="hero-subheadline"
                  value={content.subheadline}
                  onChange={(e) =>
                    setContent({ ...content, subheadline: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hero-cta" className="text-sm font-medium">
                  CTA Button Text
                </Label>
                <Input
                  id="hero-cta"
                  value={content.cta}
                  onChange={(e) =>
                    setContent({ ...content, cta: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="size-4 text-brand-600" />
                Hero Background Image
              </CardTitle>
              <CardDescription>
                Upload an image or choose from media library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.heroImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  <img
                    src={content.heroImage}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setContent({ ...content, heroImage: "" })}
                    className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="size-4" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                  className="flex-1"
                >
                  <ImageIcon className="size-4" />
                  Media Library
                </Button>
              </div>

              {showMediaPicker && (
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
                            setContent({ ...content, heroImage: m.url });
                            setShowMediaPicker(false);
                          }}
                          className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-brand-400"
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
            </CardContent>
          </Card>

          {/* Background Gradient */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Background Gradient</CardTitle>
              <CardDescription>
                Used when no hero image is set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {GRADIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setContent({ ...content, bgGradient: opt.value })
                    }
                    className={`aspect-square rounded-lg bg-gradient-to-br ${opt.color} ${
                      content.bgGradient === opt.value
                        ? "ring-2 ring-brand-500 ring-offset-2"
                        : ""
                    }`}
                    title={opt.label}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="size-4 text-brand-600" />
                Live Preview
              </CardTitle>
              <CardDescription>
                How your hero section will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-2xl overflow-hidden bg-ink-900 text-white aspect-[4/3]">
                {/* Background */}
                {content.heroImage ? (
                  <img
                    src={content.heroImage}
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${content.bgGradient}`}
                  />
                )}
                <div className="absolute inset-0 hero-grid opacity-40" />

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium text-brand-200 w-fit mb-3">
                    <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
                    Global SEO Agency
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold leading-tight">
                    {content.headline.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="gradient-text">
                      {content.headline.split(" ").slice(-1)}
                    </span>
                  </h2>
                  <p className="mt-2 text-xs text-white/60 line-clamp-3">
                    {content.subheadline}
                  </p>
                  <button className="mt-3 inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-fit">
                    {content.cta}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
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
