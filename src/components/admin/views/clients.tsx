"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  country: string | null;
  city: string | null;
  status: string;
  notes: string | null;
  projectCount: number;
  leadCount: number;
}

const EMPTY_FORM = {
  name: "", company: "", email: "", phone: "", website: "",
  industry: "", country: "", city: "", status: "active", notes: "",
};

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  inactive: "bg-slate-500/10 text-slate-500 border-slate-500/30",
  archived: "bg-amber-500/10 text-amber-700 border-amber-500/30",
};

export function AdminClients({ user }: { user: SessionUser }) {
  const [items, setItems] = React.useState<Client[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canManage = can(user.permissions, "leads.manage");

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20", status: statusFilter });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/clients?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
        setError(null);
      } else setError(data.error || "Failed to load clients");
    } catch {
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, query]);

  React.useEffect(() => {
    const t = window.setTimeout(load, query ? 350 : 0);
    return () => window.clearTimeout(t);
  }, [load, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setEditorOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({
      name: c.name ?? "", company: c.company ?? "", email: c.email ?? "",
      phone: c.phone ?? "", website: c.website ?? "", industry: c.industry ?? "",
      country: c.country ?? "", city: c.city ?? "", status: c.status, notes: c.notes ?? "",
    });
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/clients/${editing.id}` : "/api/clients", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save client");
        return;
      }
      setEditorOpen(false);
      await load();
    } catch {
      setError("Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete client");
      }
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-5 text-brand-600" />
            Clients
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{total} client{total === 1 ? "" : "s"}</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
            <Plus className="size-4" />
            Add Client
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search clients…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Client</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Projects</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center"><Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No clients found.{" "}
                    {canManage && (
                      <button onClick={openCreate} className="text-brand-700 font-semibold hover:underline">
                        Create the first client
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {c.company || c.industry || "—"}
                            {c.city ? ` · ${c.city}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {c.email || "—"}
                      {c.phone ? <span className="block">{c.phone}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">
                      <span className="font-semibold text-slate-700">{c.projectCount}</span> projects
                      <span className="text-muted-foreground"> · {c.leadCount} leads</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`capitalize font-semibold ${STATUS_TONE[c.status] ?? ""}`}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <>
                            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="size-8 p-0 text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget(c)} aria-label={`Delete ${c.name}`}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Client" : "Add Client"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update ${editing.name}'s details.` : "Add a new client company."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name.trim()} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleteTarget?.name}</span>. Their projects
              and leads will be kept but unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
