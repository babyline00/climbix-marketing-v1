"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type ChartData = {
  leadsTimeline: { day: string; label: string; count: number }[];
  meetingsTimeline: { day: string; label: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  revenueTimeline: { month: string; label: string; revenue: number; cost: number }[];
};

const BRAND = "#FF6B2C";
const STATUS_COLORS: Record<string, string> = {
  NEW: "#FF6B2C",
  CONTACTED: "#0EA5E9",
  QUALIFIED: "#8B5CF6",
  PROPOSAL: "#EC4899",
  NEGOTIATION: "#F59E0B",
  CONVERTED: "#10B981",
  LOST: "#EF4444",
  FOLLOW_UP: "#64748B",
  IN_PROGRESS: "#F59E0B",
  CLOSED: "#64748B",
  ARCHIVED: "#CBD5E1",
};
const TASK_COLORS: Record<string, string> = {
  todo: "#94A3B8",
  in_progress: "#FF6B2C",
  review: "#8B5CF6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="h-56 mt-4">{children}</div>
    </div>
  );
}

function ChangeBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
        up ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

export default function DashboardCharts({ data }: { data: ChartData }) {
  const totalLeadsInRange = data.leadsTimeline.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ChartCard title="Leads captured" subtitle={`${totalLeadsInRange} leads in selected range`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.leadsTimeline} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={24} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" name="Leads" stroke={BRAND} strokeWidth={2} fill="url(#leadFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Lead status breakdown" subtitle="Distribution across pipeline stages">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.leadsByStatus.filter((s) => s.count > 0)}
                dataKey="count"
                nameKey="status"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.leadsByStatus
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#94A3B8"} />
                  ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard title="Revenue vs cost by month" subtitle="Project finance over the range">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueTimeline} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${Math.round(v / 1_000)}k` : `$${v}`
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number | string) => `$${Number(value).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
              <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="#FF6B2C" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top lead sources" subtitle="Where new leads come from">
          <div className="space-y-2.5 mt-1 overflow-y-auto h-full pr-1">
            {data.leadsBySource.length === 0 && (
              <p className="text-sm text-muted-foreground text-center pt-16">No leads in this range.</p>
            )}
            {data.leadsBySource.map((s) => {
              const max = data.leadsBySource[0]?.count || 1;
              return (
                <div key={s.source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 capitalize">{s.source.replace(/-/g, " ")}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${Math.max(4, (s.count / max) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Tasks by status" subtitle="All tasks, all projects">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.tasksByStatus} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="status" width={78} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Tasks" radius={[0, 3, 3, 0]}>
                {data.tasksByStatus.map((t) => (
                  <Cell key={t.status} fill={TASK_COLORS[t.status] ?? "#94A3B8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export { ChangeBadge };
