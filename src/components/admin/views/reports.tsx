"use client";

import * as React from "react";
import { BarChart3, Loader2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportData {
  range: string;
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
    byStatus: { status: string; count: number }[];
    bySource: { source: string; count: number }[];
  };
  staff: { name: string; assigned: number; converted: number }[];
  projects: { byStatus: { status: string; count: number; budget: number; cost: number; revenue: number }[] };
  tasks: { byStatus: { status: string; count: number }[] };
}

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-24 shrink-0 truncate text-muted-foreground">{label}</span>
      <div className="flex-1 h-5 rounded-md bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-md ${tone ?? "bg-brand-500"}`}
          style={{ width: `${max > 0 ? Math.max(4, (value / max) * 100) : 4}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

function downloadCsv(rows: (string | number)[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const GSC_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
];

function GscPanel() {
  const [days, setDays] = React.useState("28");
  const [dimension, setDimension] = React.useState<"query" | "page">("query");
  const [data, setData] = React.useState<{
    configured: boolean;
    rows: GscRow[];
    totals: { clicks: number; impressions: number; ctr: number; position: number };
    error?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const start = new Date(now.getTime() - (Number(days) - 1) * 24 * 60 * 60 * 1000);
      const qs = new URLSearchParams({
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
        dimension,
      });
      const res = await fetch(`/api/reports/gsc?${qs}`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setData(json.report ?? null);
      else setData({ configured: false, rows: [], totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, error: json.error });
    } catch {
      setData({ configured: false, rows: [], totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, error: "Failed to reach Search Console API" });
    } finally {
      setLoading(false);
    }
  }, [days, dimension]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const exportGsc = () => {
    if (!data) return;
    downloadCsv(
      [
        ["Search Console", `${days} days`, dimension],
        [],
        [dimension === "query" ? "Query" : "Page", "Clicks", "Impressions", "CTR %", "Position"],
        ...data.rows.map((r) => [r.keys[0] ?? "", r.clicks, r.impressions, +(r.ctr * 100).toFixed(2), +r.position.toFixed(1)]),
      ],
      `climbix-gsc-${dimension}-${days}d.csv`
    );
  };

  if (!data?.configured) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Search className="size-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-700">Search Console not connected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {data?.error ? data.error : "Add your Google Search Console service-account credentials in Settings → Search Console to see keyword and page performance."}
        </p>
        <p className="text-xs text-slate-400 mt-3">
          Settings → Search Console → Service account email, private key and site URL.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              {GSC_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dimension} onValueChange={(v) => setDimension(v as "query" | "page")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="query">Top queries</SelectItem>
              <SelectItem value="page">Top pages</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportGsc}>
            <Download className="size-4" /> CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : data.error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {data.error}. Check your service-account credentials and that the site is added in Search Console.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold">{data.totals.clicks.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Clicks</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold">{data.totals.impressions.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Impressions</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold">{(data.totals.ctr * 100).toFixed(1)}%</p>
              <p className="text-[11px] text-muted-foreground">CTR</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold">{data.totals.position.toFixed(1)}</p>
              <p className="text-[11px] text-muted-foreground">Avg. position</p>
            </div>
          </div>

          {data.rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No data for this period.</p>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">{dimension === "query" ? "Query" : "Page"}</th>
                    <th className="px-4 py-2.5 text-right">Clicks</th>
                    <th className="px-4 py-2.5 text-right">Impressions</th>
                    <th className="px-4 py-2.5 text-right">CTR</th>
                    <th className="px-4 py-2.5 text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.keys[0]} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-medium text-slate-700 max-w-[320px] truncate" title={r.keys[0]}>
                        {r.keys[0]}
                      </td>
                      <td className="px-4 py-2 text-right">{r.clicks}</td>
                      <td className="px-4 py-2 text-right">{r.impressions}</td>
                      <td className="px-4 py-2 text-right">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant={r.position <= 3 ? "default" : "outline"} className="text-[10px]">
                          {r.position.toFixed(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminReports() {
  const [data, setData] = React.useState<ReportData | null>(null);
  const [range, setRange] = React.useState("30d");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?range=${range}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    load();
  }, [load]);

  const exportReport = () => {
    if (!data) return;
    const rows: (string | number)[][] = [
      ["Climbix Marketing Report", `Range: ${range}`],
      [],
      ["Lead Report"],
      ["Status", "Count"],
      ...data.leads.byStatus.map((s) => [s.status, s.count]),
      ["Total", data.leads.total],
      ["Converted", data.leads.converted],
      ["Conversion Rate %", data.leads.conversionRate],
      [],
      ["Leads by Source", "Count"],
      ...data.leads.bySource.map((s) => [s.source, s.count]),
      [],
      ["Staff Performance", "Assigned", "Converted"],
      ...data.staff.map((s) => [s.name, s.assigned, s.converted]),
      [],
      ["Project Status", "Count", "Budget", "Cost", "Revenue"],
      ...data.projects.byStatus.map((p) => [p.status, p.count, p.budget, p.cost, p.revenue]),
      [],
      ["Task Status", "Count"],
      ...data.tasks.byStatus.map((t) => [t.status, t.count]),
    ];
    downloadCsv(rows, `climbix-report-${range}.csv`);
  };

  const maxStatus = Math.max(1, ...(data?.leads.byStatus.map((s) => s.count) ?? [1]));
  const maxSource = Math.max(1, ...(data?.leads.bySource.map((s) => s.count) ?? [1]));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-5 text-brand-600" />
            Reports
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Leads, sales, projects and search performance</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto gap-1 bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-700">
            <BarChart3 className="size-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="gsc" className="gap-1.5 data-[state=active]:bg-brand-500/10 data-[state=active]:text-brand-700">
            <Search className="size-3.5" /> Search Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-5">
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportReport} disabled={!data}>
              <Download className="size-4" />
              CSV
            </Button>
          </div>

          {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : !data ? (
        <p className="text-center text-sm text-muted-foreground py-16">Unable to load reports.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Lead summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-sm mb-4">Lead Report</h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-2xl font-bold">{data.leads.total}</p>
                <p className="text-[11px] text-muted-foreground">Total leads</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{data.leads.converted}</p>
                <p className="text-[11px] text-muted-foreground">Converted</p>
              </div>
              <div className="rounded-xl bg-brand-50 p-3 text-center">
                <p className="text-2xl font-bold text-brand-700">{data.leads.conversionRate}%</p>
                <p className="text-[11px] text-muted-foreground">Conversion</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.leads.byStatus.map((s) => (
                <Bar key={s.status} label={s.status} value={s.count} max={maxStatus} />
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-sm mb-4">Leads by Source</h3>
            {data.leads.bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No leads in this range.</p>
            ) : (
              <div className="space-y-2">
                {data.leads.bySource.map((s) => (
                  <Bar key={s.source} label={s.source} value={s.count} max={maxSource} tone="bg-violet-500" />
                ))}
              </div>
            )}
          </div>

          {/* Staff performance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-sm mb-4">Staff Performance</h3>
            {data.staff.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No assigned leads in this range. Assign leads to see performance.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-slate-100">
                    <th className="pb-2">Staff</th>
                    <th className="pb-2 text-right">Assigned</th>
                    <th className="pb-2 text-right">Converted</th>
                    <th className="pb-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.staff.map((s) => (
                    <tr key={s.name} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 font-medium">{s.name}</td>
                      <td className="py-2 text-right">{s.assigned}</td>
                      <td className="py-2 text-right">{s.converted}</td>
                      <td className="py-2 text-right">
                        <Badge variant="outline" className="text-[10px]">
                          {s.assigned > 0 ? Math.round((s.converted / s.assigned) * 100) : 0}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Project finance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-sm mb-4">Project Performance</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-slate-100">
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Count</th>
                  <th className="pb-2 text-right">Budget</th>
                  <th className="pb-2 text-right">Cost</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.byStatus.map((p) => (
                  <tr key={p.status} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-medium capitalize">{p.status.replace("_", " ")}</td>
                    <td className="py-2 text-right">{p.count}</td>
                    <td className="py-2 text-right">{p.budget ? `$${p.budget.toLocaleString()}` : "—"}</td>
                    <td className="py-2 text-right">{p.cost ? `$${p.cost.toLocaleString()}` : "—"}</td>
                    <td className="py-2 text-right">{p.revenue ? `$${p.revenue.toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
                {data.projects.byStatus.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No projects yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="gsc" className="mt-4">
          <GscPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
