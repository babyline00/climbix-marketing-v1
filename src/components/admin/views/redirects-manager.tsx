"use client";

import * as React from "react";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Redirect {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  enabled: boolean;
}

export function RedirectsManager() {
  const [redirects, setRedirects] = React.useState<Redirect[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const [source, setSource] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [statusCode, setStatusCode] = React.useState<"301" | "302">("301");
  const [adding, setAdding] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/redirects", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setRedirects(data.redirects ?? []);
      else setError(data.error ?? "Failed to load redirects");
    } catch {
      setError("Failed to load redirects");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void load();
  }, []);

  const addRedirect = async () => {
    if (!source.trim() || !destination.trim()) {
      setError("Source and destination are required");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, statusCode: Number(statusCode) }),
      });
      const data = await res.json();
      if (res.ok) {
        setRedirects((prev) => [...prev, data.redirect]);
        setSource("");
        setDestination("");
        setStatusCode("301");
      } else {
        setError(data.error ?? "Failed to create redirect");
      }
    } catch {
      setError("Failed to create redirect");
    } finally {
      setAdding(false);
    }
  };

  const update = async (id: string, patch: Partial<Redirect>) => {
    if (busy) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update redirect");
        return;
      }
      setRedirects((prev) => prev.map((r) => (r.id === id ? data.redirect : r)));
      load();
    } catch {
      setError("Failed to update redirect");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/redirects/${id}`, { method: "DELETE" });
      if (res.ok) setRedirects((prev) => prev.filter((r) => r.id !== id));
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete redirect");
      }
    } catch {
      setError("Failed to delete redirect");
    } finally {
      setBusy(null);
    }
  };

  const guessDestination = () => {
    if (!source.trim()) return;
    const s = source.trim().replace(/^\/+/, "");
    if (s) setDestination(`/${s}`);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Source path</label>
          <Input
            placeholder="/old-page"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="font-mono text-sm"
            onBlur={guessDestination}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Type</label>
          <Select value={statusCode} onValueChange={(v) => setStatusCode(v as "301" | "302")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="301">301 · Permanent</SelectItem>
              <SelectItem value="302">302 · Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Destination</label>
          <Input
            placeholder="/new-page or https://…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="lg:col-span-1">
          <Button
            size="sm"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
            onClick={() => void addRedirect()}
            disabled={adding}
          >
            {adding ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Plus className="size-4 mr-1" />}
            Add redirect
          </Button>
        </div>
      </div>

      {redirects.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          No redirects yet. Add your first 301 rule above.
        </p>
      ) : (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5">Destination</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Enabled</th>
                <th className="px-4 py-2.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{r.source}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-700 truncate max-w-[260px]">
                    <span className="inline-flex items-center gap-1">
                      {r.destination}
                      {r.destination.startsWith("http") && (
                        <ExternalLink className="size-3 shrink-0" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={String(r.statusCode)}
                      onChange={(e) => void update(r.id, { statusCode: Number(e.target.value) })}
                      disabled={busy === r.id}
                      className="h-7 rounded border border-slate-200 bg-white px-1.5 text-xs"
                    >
                      <option value="301">301</option>
                      <option value="302">302</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <Switch
                      checked={r.enabled}
                      disabled={busy === r.id}
                      onCheckedChange={(checked) => void update(r.id, { enabled: checked })}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-400 hover:text-rose-600"
                      onClick={() => void remove(r.id)}
                      disabled={busy === r.id}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {redirects.length > 0 && (
        <p className="text-xs text-slate-400">
          Redirects take effect within ~30 seconds and resolve using the cached rule table.
        </p>
      )}
    </div>
  );
}