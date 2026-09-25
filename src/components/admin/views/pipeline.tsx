"use client";

import * as React from "react";
import { GripVertical, Loader2, RefreshCw, Flag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, type SessionUser } from "@/lib/rbac";

export const PIPELINE_COLUMNS: { key: string; label: string; tone: string }[] = [
  { key: "NEW", label: "New", tone: "border-sky-300 bg-sky-50" },
  { key: "CONTACTED", label: "Contacted", tone: "border-indigo-300 bg-indigo-50" },
  { key: "QUALIFIED", label: "Qualified", tone: "border-violet-300 bg-violet-50" },
  { key: "PROPOSAL", label: "Proposal", tone: "border-amber-300 bg-amber-50" },
  { key: "NEGOTIATION", label: "Negotiation", tone: "border-orange-300 bg-orange-50" },
  { key: "CONVERTED", label: "Converted", tone: "border-emerald-300 bg-emerald-50" },
  { key: "LOST", label: "Lost", tone: "border-rose-300 bg-rose-50" },
];

interface PipelineLead {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  status: string;
  estimatedValue: number | null;
  assignedTo: string | null;
  leadTier: string | null;
}

export function AdminPipeline({ user }: { user: SessionUser }) {
  const [leads, setLeads] = React.useState<PipelineLead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [hoverCol, setHoverCol] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const canMove = can(user.permissions, "pipeline.manage") || can(user.permissions, "leads.manage");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setLeads(data.leads ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const moveLead = async (lead: PipelineLead, status: string) => {
    if (lead.status === status) return;
    // optimistic update
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        flash("Failed to move lead — reverting");
        load();
      } else {
        flash(`${lead.name ?? lead.email} → ${status}`);
      }
    } catch {
      flash("Failed to move lead — reverting");
      load();
    }
  };

  const legacy = leads.filter((l) => !PIPELINE_COLUMNS.some((c) => c.key === l.status));
  const totalValue = (status: string) =>
    leads
      .filter((l) => l.status === status)
      .reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Lead Pipeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag cards between stages{canMove ? "" : " — read-only for your role"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {toast && (
        <div className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-sm text-brand-700">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {PIPELINE_COLUMNS.map((col) => {
            const items = leads.filter((l) => l.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  if (!canMove) return;
                  e.preventDefault();
                  setHoverCol(col.key);
                }}
                onDragLeave={() => setHoverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoverCol(null);
                  const id = e.dataTransfer.getData("text/plain") || dragId;
                  const lead = leads.find((l) => l.id === id);
                  if (lead && canMove) moveLead(lead, col.key);
                }}
                className={`w-64 shrink-0 rounded-2xl border-2 ${col.tone} ${
                  hoverCol === col.key ? "ring-2 ring-brand-400" : ""
                } flex flex-col max-h-[70vh]`}
              >
                <div className="px-3 py-2.5 border-b border-black/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{col.label}</span>
                    <Badge variant="outline" className="bg-white/70 text-[10px]">
                      {items.length}
                    </Badge>
                  </div>
                  {totalValue(col.key) > 0 && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ${totalValue(col.key).toLocaleString()} pipeline
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                  {items.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">Drop leads here</p>
                  )}
                  {items.map((lead) => (
                    <div
                      key={lead.id}
                      draggable={canMove}
                      onDragStart={(e) => {
                        setDragId(lead.id);
                        e.dataTransfer.setData("text/plain", lead.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={`rounded-xl bg-white border border-slate-200 shadow-sm p-2.5 ${
                        canMove ? "cursor-grab active:cursor-grabbing hover:border-brand-400" : ""
                      } ${dragId === lead.id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start gap-1.5">
                        {canMove && (
                          <GripVertical className="size-3.5 text-slate-300 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">
                            {lead.name ?? "Unnamed"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{lead.email}</p>
                          {lead.company && (
                            <p className="text-[11px] text-slate-400 truncate">{lead.company}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {lead.leadTier && (
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1 py-0 ${
                                  lead.leadTier === "HOT"
                                    ? "border-rose-400/50 text-rose-600 bg-rose-50"
                                    : lead.leadTier === "WARM"
                                      ? "border-amber-400/50 text-amber-600 bg-amber-50"
                                      : "border-slate-300 text-slate-500 bg-slate-50"
                                }`}
                              >
                                <Flag className="size-2.5 mr-0.5" />
                                {lead.leadTier}
                              </Badge>
                            )}
                            {lead.estimatedValue != null && lead.estimatedValue > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-700">
                                ${lead.estimatedValue.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {lead.assignedTo && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                              <UserRound className="size-2.5" />
                              {lead.assignedTo}
                            </p>
                          )}
                          {canMove && (
                            <Select
                              value={lead.status}
                              onValueChange={(v) => moveLead(lead, v)}
                            >
                              <SelectTrigger className="mt-2 h-7 text-[11px] w-full bg-slate-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[200]">
                                {PIPELINE_COLUMNS.map((c) => (
                                  <SelectItem key={c.key} value={c.key}>
                                    {c.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Legacy statuses not part of the visual pipeline */}
          {legacy.length > 0 && (
            <div className="w-64 shrink-0 rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col max-h-[70vh]">
              <div className="px-3 py-2.5 border-b border-black/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Other</span>
                  <Badge variant="outline" className="bg-white/70 text-[10px]">
                    {legacy.length}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Archived / closed items</div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {legacy.map((lead) => (
                  <div key={lead.id} className="rounded-xl bg-white border border-slate-200 p-2.5">
                    <p className="text-sm font-semibold truncate">{lead.name ?? "Unnamed"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{lead.email}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
