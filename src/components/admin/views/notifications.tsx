"use client";

import * as React from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  readAt: string | null;
  createdAt: string;
}

const TYPE_TONE: Record<string, string> = {
  lead_new: "bg-brand-500/10 text-brand-700 border-brand-500/30",
  lead_assigned: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  lead_converted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  followup_due: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  system: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

export function AdminNotifications() {
  const [items, setItems] = React.useState<NotificationRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  };

  const markOne = async (n: NotificationRow) => {
    if (n.readAt) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: n.id }),
    });
  };

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="size-5 text-brand-600" />
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <Loader2 className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={markAll} disabled={unread === 0}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No notifications yet. New leads and assignments will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li
                key={n.id}
                onClick={() => markOne(n)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  n.readAt ? "hover:bg-slate-50" : "bg-brand-50/60 hover:bg-brand-50"
                }`}
              >
                <div className="mt-0.5 size-2 rounded-full shrink-0 mt-2">
                  {!n.readAt && <span className="block size-2 rounded-full bg-brand-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <Badge variant="outline" className={`text-[9px] uppercase ${TYPE_TONE[n.type] ?? TYPE_TONE.system}`}>
                      {n.type.replace("_", " ")}
                    </Badge>
                  </div>
                  {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                </div>
                <time className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
