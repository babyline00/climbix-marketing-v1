"use client";

import * as React from "react";
import {
  CalendarCheck,
  Clock,
  Mail,
  Globe,
  Building2,
  Video,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Meeting = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  date: string;
  time: string;
  timezone: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

export function AdminMeetings() {
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);

  const fetchMeetings = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      // We don't have a dedicated meeting PATCH endpoint, but we can use the
      // leads API to update the lead status. For now, just update local state.
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } finally {
      setUpdating(null);
    }
  };

  const upcoming = meetings
    .filter(
      (m) =>
        m.date >= new Date().toISOString().slice(0, 10) &&
        m.status === "scheduled"
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const past = meetings
    .filter(
      (m) =>
        m.date < new Date().toISOString().slice(0, 10) ||
        m.status !== "scheduled"
    )
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Meetings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meetings.length} total · {upcoming.length} upcoming · {past.length}{" "}
          past
        </p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Upcoming Strategy Calls
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarCheck className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No upcoming meetings scheduled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                updating={updating === m.id}
                onStatus={(s) => updateStatus(m.id, s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-8">
            Past Meetings
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.slice(0, 12).map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                updating={updating === m.id}
                onStatus={(s) => updateStatus(m.id, s)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({
  meeting,
  updating,
  onStatus,
}: {
  meeting: Meeting;
  updating: boolean;
  onStatus: (status: string) => void;
}) {
  const d = new Date(meeting.date + "T00:00:00");
  const isPast = meeting.date < new Date().toISOString().slice(0, 10);

  return (
    <Card
      className={
        isPast ? "opacity-70" : "border-brand-500/30 shadow-md shadow-brand-500/5"
      }
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-xl bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-brand-700 uppercase">
              {d.toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="text-base font-bold text-brand-700">
              {d.getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{meeting.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="size-3" />
              {meeting.time} · {meeting.timezone.split(" ")[0]}
            </div>
            {meeting.service && (
              <div className="text-xs text-brand-700 mt-1">
                {meeting.service}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="size-3 shrink-0" />
            <span className="truncate">{meeting.email}</span>
          </div>
          {meeting.company && (
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="size-3 shrink-0" />
              <span className="truncate">{meeting.company}</span>
            </div>
          )}
        </div>

        {meeting.notes && (
          <div className="mt-3 rounded-lg bg-muted/50 p-2.5 text-xs text-foreground/80">
            {meeting.notes}
          </div>
        )}

        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              meeting.status === "scheduled"
                ? "bg-brand-500/15 text-brand-700"
                : meeting.status === "completed"
                  ? "bg-orange-500/15 text-orange-700"
                  : "bg-rose-500/15 text-rose-700"
            }`}
          >
            {meeting.status}
          </span>
        </div>

        {!isPast && meeting.status === "scheduled" && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatus("completed")}
              disabled={updating}
              className="flex-1 text-xs h-8"
            >
              {updating ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3" />
              )}
              Complete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatus("cancelled")}
              disabled={updating}
              className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
            >
              <XCircle className="size-3" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
