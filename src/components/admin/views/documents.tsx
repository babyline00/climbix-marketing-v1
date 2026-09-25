"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  File,
  Download,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  CloudUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, type SessionUser } from "@/lib/rbac";

interface Doc {
  id: string;
  name: string;
  storedName: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  uploadedBy: string;
  relatedType: string | null;
  relatedId: string | null;
  relatedName: string | null;
  notes: string | null;
  createdAt: string;
}

const CATEGORIES = ["general", "contract", "proposal", "invoice", "report", "design", "other"] as const;
const RELATED_TYPES = [
  { value: "none", label: "Not linked" },
  { value: "project", label: "Project" },
  { value: "client", label: "Client" },
  { value: "lead", label: "Lead" },
  { value: "staff", label: "Staff" },
];

const CATEGORY_TONE: Record<string, string> = {
  contract: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  proposal: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  invoice: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  report: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  design: "bg-pink-500/10 text-pink-700 border-pink-500/30",
  general: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  other: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function docIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime.includes("zip") || mime.includes("compressed")) return FileArchive;
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return FileSpreadsheet;
  if (mime.includes("pdf") || mime.startsWith("text/")) return FileText;
  return File;
}

export function AdminDocuments({ user }: { user: SessionUser }) {
  const [items, setItems] = React.useState<Doc[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [relatedFilter, setRelatedFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState(false);

  const canManage = can(user.permissions, "documents.manage");

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [form, setForm] = React.useState({
    name: "", category: "general", relatedType: "none",
    relatedId: "", notes: "",
  });
  const [options, setOptions] = React.useState<{ id: string; name: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Doc | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Doc | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Debounced search
  const [debouncedQ, setDebouncedQ] = React.useState("");
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(query), 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
        category: categoryFilter,
        relatedType: relatedFilter,
      });
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      const res = await fetch(`/api/documents?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
      } else {
        setError(data.error ?? "Failed to load documents");
        setLoadError(true);
      }
    } catch {
      setError("Unable to load documents. Please retry.");
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, relatedFilter, debouncedQ]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [categoryFilter, relatedFilter, debouncedQ]);

  // Load related-entity options when type changes (upload dialog)
  React.useEffect(() => {
    if (!uploadOpen || form.relatedType === "none") {
      setOptions([]);
      return;
    }
    let cancelled = false;
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const endpoint =
          form.relatedType === "project" ? "/api/projects"
          : form.relatedType === "client" ? "/api/clients"
          : form.relatedType === "lead" ? "/api/leads"
          : "/api/staff";
        const res = await fetch(`${endpoint}?pageSize=100`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setOptions(
            (data.items ?? []).map((it: { id: string; name?: string; title?: string }) => ({
              id: it.id,
              name: it.name ?? it.title ?? it.id,
            }))
          );
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [uploadOpen, form.relatedType]);

  const openUpload = () => {
    setForm({ name: "", category: "general", relatedType: "none", relatedId: "", notes: "" });
    setFile(null);
    setUploadError(null);
    setUploadOpen(true);
  };

  const submitUpload = async () => {
    if (!file) {
      setUploadError("Please choose a file");
      return;
    }
    if (!form.name.trim()) {
      setUploadError("Document name is required");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("name", form.name.trim());
      fd.set("category", form.category);
      fd.set("notes", form.notes);
      if (form.relatedType !== "none") {
        fd.set("relatedType", form.relatedType);
        fd.set("relatedId", form.relatedId);
      }
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setUploadOpen(false);
        load();
      } else {
        setUploadError(data.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Upload failed. Please retry.");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (doc: Doc) => {
    setEditing(doc);
    setForm({
      name: doc.name,
      category: doc.category,
      relatedType: doc.relatedType ?? "none",
      relatedId: doc.relatedId ?? "",
      notes: doc.notes ?? "",
    });
    setUploadError(null);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setUploadError(null);
    try {
      const res = await fetch(`/api/documents/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          relatedType: form.relatedType,
          relatedId: form.relatedId,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditOpen(false);
        load();
      } else {
        setUploadError(data.error ?? "Update failed");
      }
    } catch {
      setUploadError("Update failed. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        load();
      } else {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
      }
    } catch {
      setError("Delete failed. Please retry.");
    } finally {
      setDeleting(false);
    }
  };

  const relSelect = (type: string) => (
    <Select
      value={form.relatedId || undefined}
      onValueChange={(v) => setForm((f) => ({ ...f, relatedId: v }))}
      disabled={type === "none"}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={optionsLoading ? "Loading…" : "Select…"} />
      </SelectTrigger>
      <SelectContent className="z-[200] max-h-60">
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const formFields = (isEdit: boolean) => (
    <>
      <div className="space-y-1.5">
        <Label>Document name *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. SEO Proposal — Acme Corp"
          maxLength={200}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Linked to</Label>
          <Select
            value={form.relatedType}
            onValueChange={(v) => setForm((f) => ({ ...f, relatedType: v, relatedId: "" }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              {RELATED_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.relatedType !== "none" && (
        <div className="space-y-1.5">
          <Label className="capitalize">{form.relatedType}</Label>
          {relSelect(form.relatedType)}
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Optional description…"
          rows={2}
        />
      </div>
      {!isEdit && (
        <div className="space-y-1.5">
          <Label>File *</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.ppt,.pptx"
          />
          {file && (
            <p className="text-xs text-slate-500">
              {file.name} · {fmtSize(file.size)}
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={relatedFilter} onValueChange={setRelatedFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="all">All links</SelectItem>
              {RELATED_TYPES.filter((t) => t.value !== "none").map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={openUpload} className="bg-brand-600 hover:bg-brand-700 text-white shrink-0">
            <Plus className="size-4 mr-1.5" /> Upload Document
          </Button>
        )}
      </div>

      {/* Error banner */}
      {error && !loadError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">×</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <FolderOpen className="size-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-4">{error ?? "Unable to load documents."}</p>
          <Button variant="outline" onClick={load}>Retry</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <CloudUpload className="size-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700">No documents found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {query || categoryFilter !== "all" || relatedFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Upload contracts, proposals, invoices and other files, and link them to projects, clients or leads."}
          </p>
          {canManage && (
            <Button onClick={openUpload} className="bg-brand-600 hover:bg-brand-700 text-white">
              <Plus className="size-4 mr-1.5" /> Upload Document
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Document</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Linked to</th>
                  <th className="text-left px-4 py-3 font-medium">Size</th>
                  <th className="text-left px-4 py-3 font-medium">Uploaded by</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((doc) => {
                  const Icon = docIcon(doc.mimeType);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Icon className="size-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-800 hover:text-brand-600 truncate block max-w-56"
                            >
                              {doc.name}
                            </a>
                            {doc.notes && (
                              <p className="text-xs text-slate-400 truncate max-w-56">{doc.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={CATEGORY_TONE[doc.category] ?? CATEGORY_TONE.other}>
                          {doc.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {doc.relatedType ? (
                          <span>
                            <span className="text-xs uppercase text-slate-400 mr-1.5">{doc.relatedType}</span>
                            {doc.relatedName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{fmtSize(doc.size)}</td>
                      <td className="px-4 py-3 text-slate-600">{doc.uploadedBy}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(doc.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                            title="Download"
                          >
                            <Download className="size-4" />
                          </a>
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEdit(doc)}
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                                title="Edit"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(doc)}
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((doc) => {
              const Icon = docIcon(doc.mimeType);
              return (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="size-5 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 truncate block">
                        {doc.name}
                      </a>
                      <p className="text-xs text-slate-400">
                        {fmtSize(doc.size)} · {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={CATEGORY_TONE[doc.category] ?? CATEGORY_TONE.other}>
                      {doc.category}
                    </Badge>
                  </div>
                  {doc.relatedType && (
                    <p className="text-xs text-slate-500">
                      Linked: <span className="uppercase text-slate-400">{doc.relatedType}</span> {doc.relatedName}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={doc.url} download={doc.name}>
                        <Download className="size-4 mr-1" /> Download
                      </a>
                    </Button>
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => openEdit(doc)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => setDeleteTarget(doc)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Page {page} of {pages} · {total} document{total !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              PDF, Office, images or ZIP up to 25MB. Executable files are rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">{formFields(false)}</div>
          {uploadError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {uploadError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={submitUpload} disabled={uploading} className="bg-brand-600 hover:bg-brand-700 text-white">
              {uploading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update the name, category, link or notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">{formFields(true)}</div>
          {uploadError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {uploadError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be permanently removed, including the stored file. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
