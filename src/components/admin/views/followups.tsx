"use client";

import * as React from "react";
import {
  CalendarClock,
  Loader2,
  Plus,
  Check,
  Trash2,
  AlarmClock,
  CalendarDays,
  History,
  Phone,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, type SessionUser } from "@/lib/rbac";

interface FollowUpRow {
  id: string;
  leadId: string;
  staffName: string | null;
  type: string;
  scheduledAt: string;
  notes: string | null;
  result: string | null;
  done: boolean;
  lead: { id: string; name: string | null; email: string; company: string | null; status: string } | null;
}

interface LeadOption {
  id: string;
  name: string | null;
  email: string;
}

const TYPES = ["call", "whatsapp", "email", "meeting", "sms", "other"];
const TYPE_ICONS: Record<string, string> = {
  call: "📞", whatsapp: "💬", email: "✉️", meeting: "🤝", sms: "📱", other: "📌",
};

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminFollowups({ user }: { user: SessionUser }) {
  const [groups, setGroups] = React.useState<{ today: FollowUpRow[]; overdue: FollowUpRow[]; upcoming: FollowUpRow[]; done: FollowUpRow[] }>({
    today: [], overdue: [], upcoming: [], done: [],
  });
  const [leads, setLeads] = React.useState<LeadOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({ leadId: "", type: "call", scheduledAt: "", notes: "" });

  const canManage = can(user.permissions, "leads.manage");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, lRes] = await Promise.all([
        fetch("/api/followups", { cache: "no-store" }),
        fetch("/api/leads", { cache: "no-store" }),
      ]);
      const fData = await fRes.json();
      if (fRes.ok) {
        setGroups({
          today: fData.today ?? [], overdue: fData.overdue ?? [],
          upcoming: fData.upcoming ?? [], done: fData.done ?? [],
        });
      }
      if (lRes.ok) {
        const data = await lRes.json();
        setLeads((data.leads ?? []).slice(0, 100).map((l: LeadOption) => ({ id: l.id, name: l.name, email: l.email })));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setCreateOpen(false);
        setForm({ leadId: "", type: "call", scheduledAt: "", notes: "" });
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const markDone = async (f: FollowUpRow) => {
    await fetch(`/api/followups/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true, result: "Completed" }),
    });
    load();
  };

  const remove = async (f: FollowUpRow) => {
    await fetch(`/api/followups/${f.id}`, { method: "DELETE" });
    load();
  };

  const Row = ({ f, tone }: { f: FollowUpRow; tone?: "overdue" | "done" }) => (
    <li className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
      <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-base shrink-0">
        {TYPE_ICONS[f.type] ?? "📌"}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${tone === "done" ? "line-through text-muted-foreground" : ""}`}>
          {f.lead?.name ?? f.lead?.email ?? "Lead"}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {f.lead?.company || f.lead?.email}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
          <span className={tone === "overdue" ? "text-rose-600 font-semibold" : ""}>
            {fmtDateTime(f.scheduledAt)}
          </span>
          <span>· {f.type}</span>
          {f.staffName && <span>· {f.staffName}</span>}
          {f.notes && <span className="truncate max-w-48">· {f.notes}</span>}
        </p>
      </div>
      {canManage && !f.done && (
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="size-8 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => markDone(f)} aria-label="Mark done">
            <Check className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="size-8 p-0 text-rose-600 hover:bg-rose-50" onClick={() => remove(f)} aria-label="Delete">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </li>
  );

  const Section = ({
    icon: Icon, title, rows, tone, empty,
  }: {
    icon: typeof CalendarClock; title: string; rows: FollowUpRow[];
    tone?: "overdue" | "done"; empty: string;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Icon className={`size-4 ${tone === "overdue" ? "text-rose-500" : "text-brand-600"}`} />
          {title}
        </h3>
        <Badge variant="outline" className="text-[10px]">{rows.length}</Badge>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul>{rows.map((f) => <Row key={f.id} f={f} tone={tone} />)}</ul>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Phone className="size-5 text-brand-600" />
            Follow-ups
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {groups.today.length} today · {groups.overdue.length} overdue · {groups.upcoming.length} upcoming
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
            <Plus className="size-4" />
            Schedule Follow-up
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Section icon={AlarmClock} title="Overdue" rows={groups.overdue} tone="overdue" empty="Nothing overdue — great job!" />
            <Section icon={CalendarClock} title="Today" rows={groups.today} empty="No follow-ups scheduled for today." />
          </div>
          <div className="space-y-4">
            <Section icon={CalendarDays} title="Upcoming" rows={groups.upcoming} empty="No upcoming follow-ups." />
            <Section icon={History} title="Recently completed" rows={groups.done} tone="done" empty="Nothing completed yet." />
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>Pick a lead, choose the channel and time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Lead *</Label>
              <Select value={form.leadId} onValueChange={(v) => setForm({ ...form, leadId: v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent className="z-[200] max-h-64">
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name ?? l.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[200]">
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">When *</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Discuss proposal…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={create} disabled={saving || !form.leadId || !form.scheduledAt} className="bg-brand-600 hover:bg-brand-700 text-white">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
