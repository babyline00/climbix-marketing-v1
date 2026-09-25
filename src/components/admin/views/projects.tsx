"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface ProjectRow {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  clientId: string | null;
  client: { id: string; name: string; company: string | null } | null;
  managerName: string | null;
  status: string;
  priority: string;
  progress: number;
  budget: number | null;
  actualCost: number | null;
  revenue: number | null;
  startDate: string | null;
  deadline: string | null;
  taskCount: number;
}

interface ClientOption {
  id: string;
  name: string;
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeName: string | null;
  dueDate: string | null;
}

export const PROJECT_STATUSES = ["planning", "pending", "active", "on_hold", "completed", "cancelled", "archived"];
const TASK_STATUSES = ["todo", "in_progress", "review", "completed", "cancelled"];

const STATUS_TONE: Record<string, string> = {
  planning: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  active: "bg-brand-500/10 text-brand-700 border-brand-500/30",
  on_hold: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  archived: "bg-slate-500/10 text-slate-500 border-slate-500/30",
};

const PRIORITY_TONE: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-600 border-slate-400/30",
  medium: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  high: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  critical: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function AdminProjects({ user }: { user: SessionUser }) {
  const [items, setItems] = React.useState<ProjectRow[]>([]);
  const [clients, setClients] = React.useState<ClientOption[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canManage = can(user.permissions, "projects.manage");

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjectRow | null>(null);
  const [form, setForm] = React.useState<Record<string, string>>({
    name: "", code: "", description: "", clientId: "none", managerName: "",
    status: "planning", priority: "medium", progress: "0",
    budget: "", actualCost: "", revenue: "", startDate: "", deadline: "",
  });

  const [detail, setDetail] = React.useState<ProjectRow | null>(null);
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [newTask, setNewTask] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectRow | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20", status: statusFilter });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/projects?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
        setError(null);
      } else setError(data.error || "Failed to load projects");
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, query]);

  React.useEffect(() => {
    const t = window.setTimeout(load, query ? 350 : 0);
    return () => window.clearTimeout(t);
  }, [load, query]);

  // Load client options once
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clients?pageSize=100", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setClients((data.items ?? []).map((c: ClientOption) => ({ id: c.id, name: c.name })));
      } catch { /* ignore */ }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", code: "", description: "", clientId: "none", managerName: "",
      status: "planning", priority: "medium", progress: "0",
      budget: "", actualCost: "", revenue: "", startDate: "", deadline: "",
    });
    setEditorOpen(true);
  };

  const openEdit = (p: ProjectRow) => {
    setEditing(p);
    setForm({
      name: p.name ?? "", code: p.code ?? "", description: p.description ?? "",
      clientId: p.clientId ?? "none", managerName: p.managerName ?? "",
      status: p.status, priority: p.priority, progress: String(p.progress ?? 0),
      budget: p.budget != null ? String(p.budget) : "",
      actualCost: p.actualCost != null ? String(p.actualCost) : "",
      revenue: p.revenue != null ? String(p.revenue) : "",
      startDate: toLocalInput(p.startDate), deadline: toLocalInput(p.deadline),
    });
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId: form.clientId === "none" ? null : form.clientId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save project");
        return;
      }
      setEditorOpen(false);
      await load();
    } catch {
      setError("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  // ── Task management inside detail dialog ──
  const openDetail = async (p: ProjectRow) => {
    setDetail(p);
    setTasks([]);
    const res = await fetch(`/api/tasks?projectId=${p.id}&pageSize=100`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setTasks(data.items ?? []);
  };

  const addTask = async () => {
    if (!detail || !newTask.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim(), projectId: detail.id }),
    });
    if (res.ok) {
      setNewTask("");
      openDetail(detail);
      load();
    }
  };

  const moveTask = async (task: TaskRow, status: string) => {
    if (!detail) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Recompute project progress from completed tasks
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, status } : t));
    const active = updated.filter((t) => t.status !== "cancelled");
    if (active.length > 0) {
      const progress = Math.round((active.filter((t) => t.status === "completed").length / active.length) * 100);
      await fetch(`/api/projects/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
    }
  };

  const deleteTask = async (task: TaskRow) => {
    if (!detail) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    openDetail(detail);
  };

  const money = (v: number | null) =>
    v != null ? `$${v.toLocaleString()}` : "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="size-5 text-brand-600" />
            Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{total} project{total === 1 ? "" : "s"}</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
            <Plus className="size-4" />
            Add Project
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search projects…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Project</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Client</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Progress</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Budget</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No projects found.{" "}
                    {canManage && (
                      <button onClick={openCreate} className="text-brand-700 font-semibold hover:underline">
                        Create the first project
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(p)} className="text-left min-w-0">
                        <div className="font-medium truncate hover:text-brand-700">{p.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {p.code && <span className="font-mono">{p.code}</span>}
                          <Badge variant="outline" className={`text-[9px] px-1 py-0 capitalize ${PRIORITY_TONE[p.priority] ?? ""}`}>
                            {p.priority}
                          </Badge>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {p.client?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`capitalize font-semibold ${STATUS_TONE[p.status] ?? ""}`}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2 w-28">
                        <Progress value={p.progress} className="h-2" />
                        <span className="text-[11px] text-muted-foreground w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">
                      <span className="font-semibold">{money(p.budget)}</span>
                      {p.actualCost != null && (
                        <span className="text-muted-foreground"> · spent {money(p.actualCost)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => openDetail(p)} aria-label={`Tasks for ${p.name}`}>
                          <ListTodo className="size-3.5" />
                        </Button>
                        {canManage && (
                          <>
                            <Button variant="ghost" size="sm" className="size-8 p-0" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="size-8 p-0 text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`}>
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

      {/* Project editor */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update ${editing.name}.` : "Create a new client project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Project name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Website Redesign" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PRJ-001" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Manager</Label>
              <Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="Staff name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[200]">
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Progress %</Label>
              <Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deadline</Label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Start date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Budget ($)</Label>
              <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Actual cost ($)</Label>
              <Input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expected revenue ($)</Label>
              <Input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name.trim()} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project detail + tasks */}
      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>
              {detail?.client ? `Client: ${detail.client.name}` : "No client linked"}
              {detail?.deadline ? ` · deadline ${new Date(detail.deadline).toLocaleDateString()}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task…"
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                disabled={!canManage}
              />
              <Button onClick={addTask} disabled={!canManage || !newTask.trim()} size="sm" className="bg-brand-600 hover:bg-brand-700 text-white shrink-0">
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tasks yet — add the first one above.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      {t.assigneeName && (
                        <p className="text-[11px] text-muted-foreground">{t.assigneeName}</p>
                      )}
                    </div>
                    <Select value={t.status} onValueChange={(v) => moveTask(t, v)} disabled={!canManage}>
                      <SelectTrigger className="h-7 w-36 text-[11px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {TASK_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {canManage && (
                      <button
                        onClick={() => deleteTask(t)}
                        className="text-rose-500 hover:text-rose-700 shrink-0"
                        aria-label={`Delete task ${t.title}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleteTarget?.name}</span> and all its
              tasks.
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
