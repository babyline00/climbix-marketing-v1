"use client";

import * as React from "react";
import {
  Download,
  Search,
  Users,
  Mail,
  Globe,
  Building2,
  MoreHorizontal,
  Phone,
  PhoneOff,
  CheckCircle2,
  Bell,
  RotateCcw,
  Trash2,
  Loader2,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { LeadImportDialog } from "./lead-import-dialog";
import { can, type SessionUser } from "@/lib/rbac";

type Lead = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  website: string | null;
  phone: string | null;
  service: string | null;
  goal: string | null;
  source: string | null;
  auditScore: number | null;
  leadScore: number | null;
  leadTier: string | null;
  status: string;
  action: string | null;
  actionNote: string | null;
  actionAt: string | null;
  message: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  createdAt: string;
};

const ACTIONS = [
  { value: "MADE_CALL", label: "Made a Call", icon: Phone, tone: "text-brand-600" },
  { value: "NO_RESPONSE", label: "No Response", icon: PhoneOff, tone: "text-amber-600" },
  { value: "CLOSED", label: "Closed", icon: CheckCircle2, tone: "text-orange-600" },
  { value: "REMINDER", label: "Reminder", icon: Bell, tone: "text-violet-600" },
  { value: "FOLLOW_UP", label: "Follow up", icon: RotateCcw, tone: "text-sky-600" },
];

const ACTION_LABEL: Record<string, string> = {
  MADE_CALL: "Made a Call",
  NO_RESPONSE: "No Response",
  CLOSED: "Closed",
  REMINDER: "Reminder",
  FOLLOW_UP: "Follow up",
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

export function AdminLeads({ user }: { user?: SessionUser }) {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [actionDialog, setActionDialog] = React.useState<{
    lead: Lead;
    action: string;
  } | null>(null);
  const [actionNote, setActionNote] = React.useState("");
  const [savingAction, setSavingAction] = React.useState(false);

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filtered = React.useMemo(() => {
    let result = leads;
    if (statusFilter !== "ALL") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.email.toLowerCase().includes(q) ||
          (l.name || "").toLowerCase().includes(q) ||
          (l.company || "").toLowerCase().includes(q) ||
          (l.website || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, search, statusFilter]);

  const exportLeads = () => {
    window.open("/api/export/leads", "_blank");
  };

  const openActionDialog = (lead: Lead, action: string) => {
    setActionDialog({ lead, action });
    setActionNote(lead.actionNote || "");
  };

  const saveAction = async () => {
    if (!actionDialog) return;
    setSavingAction(true);
    try {
      const newStatus =
        actionDialog.action === "CLOSED"
          ? "CLOSED"
          : actionDialog.action === "MADE_CALL" ||
              actionDialog.action === "FOLLOW_UP"
            ? "IN_PROGRESS"
            : undefined;

      const body: Record<string, unknown> = {
        action: actionDialog.action,
        actionNote,
      };
      if (newStatus) body.status = newStatus;

      await fetch(`/api/leads/${actionDialog.lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      await fetchLeads();
      setActionDialog(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAction(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      await fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  const [importOpen, setImportOpen] = React.useState(false);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leads.length} total · {leads.filter((l) => l.status === "NEW").length}{" "}
            new · {leads.filter((l) => l.status === "CLOSED").length} closed
          </p>
        </div>
        <div className="flex gap-2">
          {can(user?.permissions ?? [], "leads.manage") && (
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="border-brand-500/40 text-brand-700 hover:bg-brand-50"
            >
              Import CSV
            </Button>
          )}
          <Button
            onClick={exportLeads}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Download className="size-4" />
            Export Leads (CSV)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, or website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="size-4 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {leads.length === 0
                  ? "No leads yet. Leads from the website will appear here."
                  : "No leads match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                      Lead
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 hidden md:table-cell">
                      Service
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 hidden lg:table-cell">
                      Source
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                      Status
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                      Score
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                      Action
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 hidden xl:table-cell">
                      Created
                    </th>
                    <th className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(lead.name || lead.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {lead.name || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="size-3 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                            {(lead.company || lead.website) && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                {lead.website ? (
                                  <Globe className="size-3 shrink-0" />
                                ) : (
                                  <Building2 className="size-3 shrink-0" />
                                )}
                                <span className="truncate">
                                  {lead.website || lead.company}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {lead.service || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {lead.source || "—"}
                          </span>
                          {lead.utmSource && (
                            <span
                              title={`utm_source=${lead.utmSource}${lead.utmMedium ? ` · utm_medium=${lead.utmMedium}` : ""}${lead.utmCampaign ? ` · utm_campaign=${lead.utmCampaign}` : ""}`}
                              className="text-[10px] px-1.5 py-0.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-600 font-medium"
                            >
                              {lead.utmSource}
                              {lead.utmMedium ? ` / ${lead.utmMedium}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={lead.leadScore} tier={lead.leadTier} />
                      </td>
                      <td className="px-4 py-3">
                        {lead.action ? (
                          <ActionBadge action={lead.action} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              Update action
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ACTIONS.map((a) => (
                              <DropdownMenuItem
                                key={a.value}
                                onClick={() => openActionDialog(lead, a.value)}
                              >
                                <a.icon className={`size-4 ${a.tone}`} />
                                {a.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteLead(lead.id)}
                              className="text-rose-600 focus:text-rose-700"
                            >
                              <Trash2 className="size-4" />
                              Delete lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action dialog */}
      <Dialog
        open={!!actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog &&
                `${ACTION_LABEL[actionDialog.action]} — ${actionDialog.lead.name || actionDialog.lead.email}`}
            </DialogTitle>
            <DialogDescription>
              Add a note about this action (optional). The note will be saved
              with the lead's record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="action-note" className="text-xs">
                Note
              </Label>
              <Textarea
                id="action-note"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="e.g., Spoke with Jane, she's interested in SEO services. Follow up next Tuesday."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(null)}
              disabled={savingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={saveAction}
              disabled={savingAction}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {savingAction ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save action"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV import */}
      <LeadImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={fetchLeads}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: "bg-brand-500/15 text-brand-700",
    IN_PROGRESS: "bg-amber-500/15 text-amber-700",
    CLOSED: "bg-orange-500/15 text-orange-700",
    ARCHIVED: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] || map.NEW}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const actionObj = ACTIONS.find((a) => a.value === action);
  if (!actionObj) return <span className="text-xs">—</span>;
  const Icon = actionObj.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted">
      <Icon className={`size-3 ${actionObj.tone}`} />
      {actionObj.label}
    </span>
  );
}

function ScoreBadge({
  score,
  tier,
}: {
  score: number | null;
  tier: string | null;
}) {
  if (score === null || tier === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const tierStyles: Record<string, string> = {
    HOT: "bg-rose-100 text-rose-700 border-rose-200",
    WARM: "bg-amber-100 text-amber-700 border-amber-200",
    COLD: "bg-sky-100 text-sky-700 border-sky-200",
  };

  const tierIcon: Record<string, string> = {
    HOT: "🔥",
    WARM: "⚡",
    COLD: "❄️",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyles[tier] || tierStyles.COLD}`}
      title={`Score: ${score}/100 — Tier: ${tier}`}
    >
      {tierIcon[tier]} {score}
    </span>
  );
}
