"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Download,
  Clock,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Building2,
  FolderKanban,
  ListTodo,
  PhoneCall,
  UserPlus,
  Image as ImageIcon,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeBadge } from "@/components/admin/views/dashboard-charts";

const DashboardCharts = dynamic(
  () => import("@/components/admin/views/dashboard-charts"),
  { ssr: false, loading: () => <Skeleton className="h-72 rounded-xl" /> }
);

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
] as const;

type Lead = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  website: string | null;
  service: string | null;
  source: string | null;
  status: string;
  action: string | null;
  createdAt: string;
};

type Meeting = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  date: string;
  time: string;
  timezone: string;
  status: string;
  lead: { email: string } | null;
};

type ChartData = {
  leadsTimeline: { day: string; label: string; count: number }[];
  meetingsTimeline: { day: string; label: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  revenueTimeline: { month: string; label: string; revenue: number; cost: number }[];
  changes: {
    leads: { current: number; previous: number; changePct: number };
    converted: { current: number; previous: number; changePct: number };
    revenue: { current: number; previous: number; changePct: number };
  };
};

type DashboardStats = {
  leads: { total: number; new: number; converted: number; lost: number; pipelineValue: number };
  clients: { total: number; active: number };
  projects: { total: number; active: number; completed: number; planning: number };
  tasks: { total: number; pending: number; completed: number };
  finance: { revenue: number; expenses: number; pending: number };
  meetings: { total: number; upcoming: number };
  followups: { today: number; overdue: number };
  system: { notifications: number; media: number; content: number; staff: number; activeStaff: number };
  range?: string;
  charts?: ChartData;
};

export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [range, setRange] = React.useState<string>("30d");

  const fetchLeads = React.useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchMeetings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchStats = React.useCallback(async (r: string) => {
    try {
      const res = await fetch(`/api/dashboard?range=${r}`, { cache: "no-store" });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    Promise.all([fetchLeads(), fetchMeetings(), fetchStats(range)]).finally(() =>
      setLoading(false)
    );
  }, [fetchLeads, fetchMeetings, fetchStats, range]);

  const changeRange = (r: string) => {
    setRange(r);
    fetchStats(r);
  };

  const exportLeads = () => {
    window.open("/api/export/leads", "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const recentLeads = leads.slice(0, 5);
  const upcoming = meetings
    .filter((m) => m.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your leads, meetings, and growth activity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Analytics date range">
            {RANGES.map((r) => (
              <button
                key={r.value}
                role="tab"
                aria-selected={range === r.value}
                onClick={() => changeRange(r.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  range === r.value
                    ? "bg-brand-500/10 text-brand-700"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            onClick={exportLeads}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Download className="size-4" />
            Export Leads (CSV)
          </Button>
        </div>
      </div>

      {/* Stats — all from /api/dashboard (DB aggregation, cached 30s) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Leads" value={stats?.leads.total ?? 0} tone="brand" delay={0} />
        <StatCard icon={AlertCircle} label="New Leads" value={stats?.leads.new ?? 0} tone="amber" delay={0.05} />
        <StatCard icon={Building2} label="Clients" value={stats?.clients.total ?? 0} tone="violet" delay={0.1} />
        <StatCard icon={FolderKanban} label={stats ? `Active Projects · ${stats.projects.completed} done` : "Active Projects"} value={stats?.projects.active ?? 0} tone="emerald" delay={0.15} />
        <StatCard icon={ListTodo} label="Pending Tasks" value={stats?.tasks.pending ?? 0} tone="amber" delay={0.2} />
        <StatCard icon={PhoneCall} label={stats && stats.followups.overdue > 0 ? `Follow-ups Today · ${stats.followups.overdue} overdue` : "Follow-ups Today"} value={stats?.followups.today ?? 0} tone="brand" delay={0.25} />
        <StatCard icon={CalendarCheck} label="Upcoming Meetings" value={stats?.meetings.upcoming ?? 0} tone="violet" delay={0.3} />
        <StatCard icon={Users} label={stats ? `Staff · ${stats.system.activeStaff} active` : "Staff"} value={stats?.system.staff ?? 0} tone="emerald" delay={0.35} />
      </div>

      {/* Finance strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Revenue (completed projects)" value={`$${(stats?.finance.revenue ?? 0).toLocaleString()}`} tone="emerald" delay={0.4} />
        <StatCard icon={TrendingUp} label="Expenses (all projects)" value={`$${(stats?.finance.expenses ?? 0).toLocaleString()}`} tone="amber" delay={0.45} />
        <StatCard icon={Users} label={`Pipeline Value · ${stats?.leads.converted ?? 0} converted`} value={`$${Math.round(stats?.leads.pipelineValue ?? 0).toLocaleString()}`} tone="brand" delay={0.5} />
      </div>

      {/* Analytics charts — date-range filtered (recharts, client-only) */}
      {stats?.charts && (
        <section aria-label="Analytics charts">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="size-4 text-brand-600" />
              Analytics
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                Leads
                <ChangeBadge pct={stats.charts.changes.leads.changePct} />
                {stats.charts.changes.leads.current} vs {stats.charts.changes.leads.previous} prev
              </span>
              <span className="hidden sm:flex items-center gap-1">
                Converted
                <ChangeBadge pct={stats.charts.changes.converted.changePct} />
                {stats.charts.changes.converted.current} vs {stats.charts.changes.converted.previous} prev
              </span>
            </div>
          </div>
          <DashboardCharts data={stats.charts} />
        </section>
      )}

      {/* Two-column: upcoming meetings + recent leads */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Upcoming meetings */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <CalendarCheck className="size-4 text-brand-600" />
                Upcoming Meetings
              </h2>
              <button
                onClick={() => onNavigate("meetings")}
                className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
              >
                View all
                <ArrowRight className="size-3" />
              </button>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No upcoming meetings scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3 hover:border-brand-500/40 transition-colors"
                  >
                    <div className="size-10 rounded-lg bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono text-brand-700 uppercase">
                        {new Date(m.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-sm font-bold text-brand-700">
                        {new Date(m.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {m.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
                        {m.time} · {m.timezone.split(" ")[0]}
                      </div>
                      {m.service && (
                        <div className="text-xs text-brand-700 mt-1">
                          {m.service}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="size-4 text-brand-600" />
                Recent Leads
              </h2>
              <button
                onClick={() => onNavigate("leads")}
                className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
              >
                View all
                <ArrowRight className="size-3" />
              </button>
            </div>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No leads yet. Leads from the website will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3 hover:border-brand-500/40 transition-colors"
                  >
                    <div className="size-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(l.name || l.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {l.name || l.email}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate">{l.email}</span>
                      </div>
                      {l.website && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <Globe className="size-3 shrink-0" />
                          <span className="truncate">{l.website}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={l.status} />
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(l.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Add Lead", desc: "Capture and assign new leads", view: "leads" },
              { icon: Building2, label: "Add Client", desc: "Register a client company", view: "clients" },
              { icon: FolderKanban, label: "Add Project", desc: "Start a client engagement", view: "projects" },
              { icon: ListTodo, label: "Create Task", desc: "Plan work inside a project", view: "projects" },
              { icon: PhoneCall, label: "Schedule Follow-up", desc: "Book the next touchpoint", view: "followups" },
              { icon: ImageIcon, label: "Upload Media", desc: "Images, videos & documents", view: "media" },
              { icon: UserPlus, label: "Add Staff", desc: "Invite a team member", view: "staff" },
              { icon: FileEdit, label: "Edit Website", desc: "Hero, services, contact info", view: "content" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => onNavigate(a.view)}
                className="text-left rounded-xl border border-border p-4 hover:border-brand-500/40 hover:bg-muted/30 transition-colors"
              >
                <a.icon className="size-5 text-brand-600 mb-2" />
                <div className="text-sm font-semibold">{a.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  delay,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  tone: "brand" | "amber" | "violet" | "emerald";
  delay: number;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-500/10 text-brand-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
    emerald: "bg-orange-500/10 text-orange-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card>
        <CardContent className="p-5">
          <div
            className={`size-10 rounded-xl ${tones[tone]} flex items-center justify-center mb-3`}
          >
            <Icon className="size-5" />
          </div>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
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
      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${map[status] || map.NEW}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
