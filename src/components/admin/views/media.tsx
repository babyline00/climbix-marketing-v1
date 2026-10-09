"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Copy,
  Search,
  Loader2,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

type Media = {
  id: string;
  filename: string;
  storedName: string;
  url: string;
  mimeType: string;
  size: number;
  altText: string | null;
  title: string | null;
  type: string;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMedia() {
  const [media, setMedia] = React.useState<Media[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Media | null>(null);
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchMedia = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        await uploadMediaFile(file, { title: file.name.replace(/\.[^.]+$/, "") });
      }
      await fetchMedia();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this media file permanently?")) return;
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      await fetchMedia();
      setSelected(null);
    } catch (e) {
      console.error(e);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = React.useMemo(() => {
    let result = media;
    if (typeFilter !== "all") {
      result = result.filter((m) => m.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          (m.title || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [media, search, typeFilter]);

  const stats = {
    total: media.length,
    images: media.filter((m) => m.type === "image").length,
    videos: media.filter((m) => m.type === "video").length,
    documents: media.filter((m) => m.type === "document").length,
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Media Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} files · {stats.images} images · {stats.videos} videos ·{" "}
            {stats.documents} documents
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => onUpload(e.target.files)}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload Media
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-brand-500", "bg-brand-500/5");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-brand-500", "bg-brand-500/5");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-brand-500", "bg-brand-500/5");
          onUpload(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Images, videos, and documents · Max 50MB per file
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by filename or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {["all", "image", "video", "document"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "all" ? "All" : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {media.length === 0
                ? "No media uploaded yet. Upload your first image or video."
                : "No media matches your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (i % 5) * 0.04 }}
              onClick={() => setSelected(m)}
              className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer hover:border-brand-400 hover:shadow-lg transition-all"
            >
              {/* Preview */}
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {m.type === "image" ? (
                  <img
                    src={m.url}
                    alt={m.altText || m.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : m.type === "video" ? (
                  <div className="flex flex-col items-center text-slate-400">
                    <Video className="size-8" />
                    <span className="text-[10px] mt-1">Video</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <FileText className="size-8" />
                    <span className="text-[10px] mt-1">Document</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <div className="text-xs font-medium truncate">{m.filename}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {formatSize(m.size)}
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-white uppercase">
                  {m.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.filename}</DialogTitle>
            <DialogDescription>
              Media details and actions
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Preview */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center min-h-[200px]">
                {selected.type === "image" ? (
                  <img
                    src={selected.url}
                    alt={selected.altText || selected.filename}
                    className="w-full h-full object-contain"
                  />
                ) : selected.type === "video" ? (
                  <Video className="size-12 text-slate-400" />
                ) : (
                  <FileText className="size-12 text-slate-400" />
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-slate-500">File URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                      {selected.url}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8 shrink-0"
                      onClick={() => copyUrl(selected.url)}
                    >
                      {copied ? (
                        <CheckCircle2 className="size-4 text-orange-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">Type</Label>
                    <div className="text-sm font-medium capitalize mt-0.5">
                      {selected.type}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Size</Label>
                    <div className="text-sm font-medium mt-0.5">
                      {formatSize(selected.size)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">MIME Type</Label>
                  <div className="text-sm font-mono mt-0.5">
                    {selected.mimeType}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-500">Uploaded</Label>
                  <div className="text-sm mt-0.5">
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <a
              href={selected?.url}
              download
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Download className="size-4" />
              Download
            </a>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => selected && onDelete(selected.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
