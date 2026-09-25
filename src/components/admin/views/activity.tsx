"use client";

import * as React from "react";
import {
  History,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SessionUser } from "@/lib/rbac";

interface ActivityEntry {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}

const ACTION_ICONS: Record<string, typeof LogIn> = {
  login: LogIn,
  logout: LogOut,
  login_failed: ShieldAlert,
  create: Plus,
  update: Pencil,
  delete: Trash2,
};

const MODULE_COLORS: Record<string, string> = {
  auth: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  leads: "bg-brand-500/10 text-brand-700 border-brand-500/30",
  staff: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  content: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  homepage: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  system: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminActivity({ user }: { user: SessionUser }) {
  const [items, setItems] = React.useState<ActivityEntry[]>([]);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [modules, setModules] = React.useState<string[]>([]);
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "50",
        module: moduleFilter,
      });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/activity?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        setPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
        setModules(data.modules ?? []);
      }
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false);
    }
  }, [page, moduleFilter, query]);

  React.useEffect(() => {
    load();
  }, [load]);

  const iconFor = (action: string) => {
    for (const key of Object.keys(ACTION_ICONS)) {
      if (action.includes(key)) {
        const Icon = ACTION_ICONS[key];
        return <Icon className="size-3.5" />;
      }
    }
    return <History className="size-3.5" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <History className="size-5 text-brand-600" />
            Activity Log
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} recorded event{total === 1 ? "" : "s"} — sign-ins, content edits and more
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search user, action or details…"
            className="pl-9"
          />
        </div>
        <Select
          value={moduleFilter}
          onValueChange={(v) => {
            setModuleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">All modules</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No activity recorded yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {iconFor(entry.action)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{entry.userName}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase tracking-wide font-semibold ${
                        MODULE_COLORS[entry.module] ?? MODULE_COLORS.system
                      }`}
                    >
                      {entry.module}
                    </Badge>
                    <span className="text-xs font-mono text-slate-500">{entry.action}</span>
                  </div>
                  {entry.details && (
                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                      {entry.details}
                    </p>
                  )}
                </div>
                <time className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 hidden sm:block">
                  {fmtTime(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
