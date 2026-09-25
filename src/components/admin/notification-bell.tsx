"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell({ onOpenCenter }: { onOpenCenter: () => void }) {
  const [items, setItems] = React.useState<NotificationRow[]>([]);
  const [unread, setUnread] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=6", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      /* silent — polling */
    }
  }, []);

  React.useEffect(() => {
    load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-[11px] font-semibold text-brand-700 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          items.slice(0, 6).map((n) => (
            <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2.5 cursor-default">
              <div className="flex items-center gap-2 w-full">
                <span className={`size-1.5 rounded-full shrink-0 ${n.readAt ? "bg-slate-300" : "bg-brand-500"}`} />
                <span className="text-xs font-semibold truncate">{n.title}</span>
              </div>
              {n.message && (
                <p className="text-[11px] text-slate-500 pl-3.5 line-clamp-2">{n.message}</p>
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenCenter} className="text-brand-700 font-semibold justify-center">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
