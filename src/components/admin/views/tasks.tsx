"use client";

import * as React from "react";
import {
  Loader2,
  RefreshCw,
  ListTodo,
  Plus,
  Columns3,
  Table2,
  CalendarDays,
  Trash2,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, type SessionUser } from "@/lib/rbac";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeName: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  project: { id: string; name: string } | null;
}

interface ProjectOpt {
  id: string;
  name: string;
}

const TASK_STATUSES = ["todo", "in_progress", "review", "completed", "cancelled"];
const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
};
const STATUS_TONE: Record<string, string> = {
  todo: "bg-slate-500/10 text-slate-600 border-slate-400/30",
  in_progress: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  review: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/30",
};
const PRIORITY_TONE: Record<string, string> = {
  low: "border-slate-300 text-slate-500",
  medium: "border-sky-400/50 text-sky-700",
  high: "border-amber-400/50 text-amber-700",
  critical: "border-rose-400/50 text-rose-700",
};

const isOverdue = (t: TaskRow) =>
  t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString()) && t.status !== "completed" && t.status !== "cancelled";

export function AdminTasks({ user }: { user: SessionUser }) {
  const [items, setItems] = React.useState<TaskRow[]>([]);
  const [projects, setProjects] = React.useState<ProjectOpt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<"kanban" | "table" | "calendar">("kanban");
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null);

  // Calendar state
  const [calMonth, setCalMonth] = React.useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  // Create dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    projectId: "none",
    assigneeName: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    estimatedHours: "",
  });

  const canManage = can(user.permissions, "projects.manage");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: "100", status: statusFilter });
      if (projectFilter !== "all") params.set("projectId", projectFilter);
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/tasks?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
      } else {
        setError(data.error ?? "Failed to load tasks");
      }
    } catch {
      setError("Unable to load tasks. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, projectFilter, query]);

  React.useEffect(() => {
    const t = window.setTimeout(load, query ? 350 : 0);
    return () => window.clearTimeout(t);
  }, [load, query]);

  React.useEffect(() => {
    fetch("/api/projects?pageSize=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProjects(d.items ?? []))
      .catch(() => {});
  }, []);

  const move = async (task: TaskRow, status: string) => {
    if (!canManage || task.status === status) return;
    setItems((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) load();
  };

  const removeTask = async (task: TaskRow) => {
    if (!canManage || !window.confirm(`Delete task "${task.title}"?`)) return;
    setItems((prev) => prev.filter((t) => t.id !== task.id));
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (!res.ok) load();
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          projectId: form.projectId === "none" ? null : form.projectId,
          assigneeName: form.assigneeName.trim() || null,
          priority: form.priority,
          status: form.status,
          dueDate: form.dueDate || null,
          estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        setForm({ title: "", description: "", projectId: "none", assigneeName: "", priority: "medium", status: "todo", dueDate: "", estimatedHours: "" });
        load();
      } else {
        window.alert(data.error ?? "Failed to create task");
      }
    } finally {
      setCreating(false);
    }
  };

  // Calendar helpers
  const monthDays = React.useMemo(() => {
    const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const startDow = first.getDay();
    const days: { date: Date | null; key: string }[] = [];
    for (let i = 0; i < startDow; i++) days.push({ date: null, key: `pad-${i}` });
    const last = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push({ date: new Date(calMonth.getFullYear(), calMonth.getMonth(), d), key: `d-${d}` });
    }
    return days;
  }, [calMonth]);

  const tasksOnDay = (d: Date) => {
    const key = d.toDateString();
    return items.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === key);
  };

  const overdueCount = items.filter(isOverdue).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="size-5 text-brand-600" />
            Tasks
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} task{items.length === 1 ? "" : "s"}
            {overdueCount > 0 ? ` · ${overdueCount} overdue` : ""} — kanban, table & calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {canManage && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white">
              <Plus className="size-4" />
              New Task
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={(v) => setProjectFilter(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 self-start">
          {([
            { v: "kanban", icon: Columns3, label: "Kanban" },
            { v: "table", icon: Table2, label: "Table" },
            { v: "calendar", icon: CalendarDays, label: "Calendar" },
          ] as const).map((b) => (
            <button
              key={b.v}
              onClick={() => setView(b.v)}
              aria-pressed={view === b.v}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors ${
                view === b.v ? "bg-brand-500/10 text-brand-700" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <b.icon className="size-3.5" />
              <span className="hidden lg:inline">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(null); load(); }} className="text-rose-500 hover:text-rose-700 underline text-xs">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <ListTodo className="size-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-muted-foreground">No tasks found.</p>
          {canManage && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5 mr-1" /> Create the first task
            </Button>
          )}
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard
          items={items}
          canManage={canManage}
          dragId={dragId}
          dragOverCol={dragOverCol}
          onDragStart={(id) => setDragId(id)}
          onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
          onDragOverCol={setDragOverCol}
          onDrop={(status) => {
            const task = items.find((t) => t.id === dragId);
            if (task) move(task, status);
            setDragId(null);
            setDragOverCol(null);
          }}
          onDelete={removeTask}
        />
      ) : view === "table" ? (
        <TaskTable items={items} canManage={canManage} onStatus={move} onDelete={removeTask} />
      ) : (
        <TaskCalendar
          month={calMonth}
          setMonth={setCalMonth}
          monthDays={monthDays}
          tasksOnDay={tasksOnDay}
        />
      )}

      {/* Create task dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a work item to any project, assign an owner and set a due date.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createTask} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Design homepage hero mockup"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Input
                  id="task-assignee"
                  value={form.assigneeName}
                  onChange={(e) => setForm({ ...form, assigneeName: e.target.value })}
                  placeholder="Staff name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {["low", "medium", "high", "critical"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-hours">Est. hours</Label>
                <Input
                  id="task-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                  placeholder="e.g. 8"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !form.title.trim()} className="bg-brand-600 hover:bg-brand-700 text-white">
                {creating && <Loader2 className="size-4 mr-1 animate-spin" />}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────── Kanban ────────────────────────────

function KanbanBoard({
  items,
  canManage,
  dragId,
  dragOverCol,
  onDragStart,
  onDragEnd,
  onDragOverCol,
  onDrop,
  onDelete,
}: {
  items: TaskRow[];
  canManage: boolean;
  dragId: string | null;
  dragOverCol: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverCol: (col: string | null) => void;
  onDrop: (status: string) => void;
  onDelete: (t: TaskRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {TASK_STATUSES.map((status) => {
        const col = items.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!canManage) return;
              e.preventDefault();
              onDragOverCol(status);
            }}
            onDragLeave={() => onDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(status);
            }}
            className={`rounded-xl border p-2.5 min-h-40 transition-colors ${
              dragOverCol === status
                ? "border-brand-500 bg-brand-500/5"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-white border border-slate-200 rounded-full px-1.5">
                {col.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.map((t) => (
                <div
                  key={t.id}
                  draggable={canManage}
                  onDragStart={() => onDragStart(t.id)}
                  onDragEnd={onDragEnd}
                  className={`rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm ${
                    canManage ? "cursor-grab active:cursor-grabbing" : ""
                  } ${dragId === t.id ? "opacity-50" : ""}`}
                >
                  <p className={`text-xs font-semibold leading-snug ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {t.title}
                  </p>
                  {t.project && (
                    <p className="text-[10px] text-brand-700 mt-1 truncate">{t.project.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <Badge variant="outline" className={`text-[8px] capitalize px-1 py-0 ${PRIORITY_TONE[t.priority] ?? ""}`}>
                      {t.priority}
                    </Badge>
                    {t.assigneeName && (
                      <span className="text-[9px] text-muted-foreground truncate max-w-20">{t.assigneeName}</span>
                    )}
                    {t.dueDate && (
                      <span className={`text-[9px] ${isOverdue(t) ? "text-rose-600 font-bold" : "text-muted-foreground"}`}>
                        {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {canManage && (
                      <button
                        onClick={() => onDelete(t)}
                        className="ml-auto text-slate-300 hover:text-rose-600 transition-colors"
                        aria-label={`Delete task ${t.title}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {col.length === 0 && (
                <p className="text-[10px] text-slate-400 text-center py-3">
                  {canManage ? "Drop tasks here" : "Empty"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────── Table ────────────────────────────

function TaskTable({
  items,
  canManage,
  onStatus,
  onDelete,
}: {
  items: TaskRow[];
  canManage: boolean;
  onStatus: (t: TaskRow, s: string) => void;
  onDelete: (t: TaskRow) => void;
}) {
  const [sortKey, setSortKey] = React.useState<"createdAt" | "dueDate" | "priority">("createdAt");
  const [sortDir, setSortDir] = React.useState<1 | -1>(-1);
  const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  const sorted = React.useMemo(() => {
    return [...items].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "priority") {
        av = PRIORITY_ORDER[a.priority] ?? 9;
        bv = PRIORITY_ORDER[b.priority] ?? 9;
      } else {
        av = a[sortKey] ?? "";
        bv = b[sortKey] ?? "";
      }
      if (av === bv) return 0;
      return (av < bv ? -1 : 1) * sortDir;
    });
  }, [items, sortKey, sortDir]);

  const header = (key: "createdAt" | "dueDate" | "priority", label: string) => (
    <th
      className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-700"
      onClick={() => {
        if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
        else { setSortKey(key); setSortDir(1); }
      }}
    >
      {label} {sortKey === key && (sortDir === 1 ? "↑" : "↓")}
    </th>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Task</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Project</th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Assignee</th>
            {header("priority", "Priority")}
            {header("dueDate", "Due")}
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/60">
              <td className="px-3 py-2.5">
                <p className={`font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-64">{t.description}</p>
                )}
              </td>
              <td className="px-3 py-2.5 text-xs text-slate-600">{t.project?.name ?? "—"}</td>
              <td className="px-3 py-2.5 text-xs text-slate-600">{t.assigneeName ?? "—"}</td>
              <td className="px-3 py-2.5">
                <Badge variant="outline" className={`text-[9px] capitalize ${PRIORITY_TONE[t.priority] ?? ""}`}>
                  {t.priority}
                </Badge>
              </td>
              <td className="px-3 py-2.5 text-xs">
                {t.dueDate ? (
                  <span className={isOverdue(t) ? "text-rose-600 font-bold" : "text-slate-600"}>
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2.5">
                {canManage ? (
                  <Select value={t.status} onValueChange={(v) => onStatus(t, v)}>
                    <SelectTrigger className="h-7 w-36 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={`capitalize text-[10px] ${STATUS_TONE[t.status] ?? ""}`}>
                    {STATUS_LABEL[t.status]}
                  </Badge>
                )}
              </td>
              <td className="px-3 py-2.5">
                {canManage && (
                  <button
                    onClick={() => onDelete(t)}
                    className="text-slate-300 hover:text-rose-600 transition-colors"
                    aria-label={`Delete task ${t.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────────────── Calendar ────────────────────────────

function TaskCalendar({
  month,
  setMonth,
  monthDays,
  tasksOnDay,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  monthDays: { date: Date | null; key: string }[];
  tasksOnDay: (d: Date) => TaskRow[];
}) {
  const today = new Date().toDateString();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
          ←
        </Button>
        <h3 className="font-semibold text-sm">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
          →
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 min-w-[640px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-[10px] font-semibold text-slate-400 uppercase text-center py-1">
            {d}
          </div>
        ))}
        {monthDays.map((cell) => {
          if (!cell.date) return <div key={cell.key} className="min-h-24 rounded-lg bg-slate-50/40" />;
          const dayTasks = tasksOnDay(cell.date);
          const isToday = cell.date.toDateString() === today;
          return (
            <div
              key={cell.key}
              className={`min-h-24 rounded-lg border p-1.5 ${
                isToday ? "border-brand-500 bg-brand-500/5" : "border-slate-100 bg-white"
              }`}
            >
              <div className={`text-[10px] font-bold mb-1 ${isToday ? "text-brand-700" : "text-slate-400"}`}>
                {cell.date.getDate()}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    title={t.title}
                    className={`text-[9px] leading-tight rounded px-1 py-0.5 truncate ${STATUS_TONE[t.status] ?? "bg-slate-100"}`}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[8px] text-muted-foreground">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
