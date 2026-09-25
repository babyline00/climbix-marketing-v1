"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EmailLog = {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  type: string;
  status: string;
  leadId: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  meeting_confirmation: "Meeting Confirmation",
  lead_notification: "Lead Notification",
  audit_complete: "Audit Complete",
};

export function AdminEmails() {
  const [emails, setEmails] = React.useState<EmailLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<EmailLog | null>(null);

  const fetchEmails = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const filtered = React.useMemo(() => {
    let result = emails;
    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.to.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [emails, search, typeFilter]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Email Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {emails.length} emails sent · {emails.filter((e) => e.status === "sent").length} delivered
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by recipient, subject, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="meeting_confirmation">Meeting Confirmations</SelectItem>
            <SelectItem value="lead_notification">Lead Notifications</SelectItem>
            <SelectItem value="audit_complete">Audit Completions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {emails.length === 0
                ? "No emails sent yet. Emails will appear here when leads book meetings or submit audits."
                : "No emails match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((email, i) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => setSelected(email)}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  {email.status === "sent" ? (
                    <CheckCircle2 className="size-4 text-orange-600" />
                  ) : (
                    <XCircle className="size-4 text-rose-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {email.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(email.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>To: {email.to}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {TYPE_LABELS[email.type] || email.type}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Email detail dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 font-medium">To</div>
                  <div className="text-slate-900">{selected.to}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">From</div>
                  <div className="text-slate-900">{selected.from}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Type</div>
                  <div className="text-slate-900">
                    {TYPE_LABELS[selected.type] || selected.type}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Status</div>
                  <div className="text-slate-900 capitalize">{selected.status}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Date</div>
                  <div className="text-slate-900">
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium mb-2">
                  Email Body
                </div>
                <div
                  className="border border-slate-200 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: selected.body }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
