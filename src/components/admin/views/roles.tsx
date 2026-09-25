"use client";

import * as React from "react";
import {
  ShieldCheck,
  Loader2,
  Plus,
  Save,
  Lock,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PERMISSION_CATALOG,
  ALL_PERMISSION,
  type SessionUser,
} from "@/lib/rbac";

interface RoleInfo {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount?: number;
}

export function AdminRoles({ user }: { user: SessionUser }) {
  const [roles, setRoles] = React.useState<RoleInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({ label: "", key: "", description: "" });
  const [newPerms, setNewPerms] = React.useState<Set<string>>(new Set());

  const canManageRoles =
    user.role === "SUPER_ADMIN" || user.permissions.includes("*");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles ?? []);
        setError(null);
      } else {
        setError(data.error || "Failed to load roles");
      }
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const toggleExpand = (role: RoleInfo) => {
    if (expanded === role.id) {
      setExpanded(null);
      return;
    }
    setExpanded(role.id);
    setDraft(new Set(role.permissions));
  };

  const togglePerm = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set);
    if (key === ALL_PERMISSION) {
      if (next.has(ALL_PERMISSION)) next.clear();
      else {
        next.clear();
        next.add(ALL_PERMISSION);
      }
    } else {
      next.delete(ALL_PERMISSION);
      if (next.has(key)) next.delete(key);
      else next.add(key);
    }
    setter(next);
  };

  const saveRole = async (role: RoleInfo) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: Array.from(draft) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save role");
        return;
      }
      flash(`Permissions for ${role.label} saved`);
      await load();
    } catch {
      setError("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newRole.label.trim(),
          name: newRole.key.trim(),
          description: newRole.description.trim(),
          permissions: Array.from(newPerms),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create role");
        return;
      }
      setCreateOpen(false);
      setNewRole({ label: "", key: "", description: "" });
      setNewPerms(new Set());
      flash("Custom role created");
      await load();
    } catch {
      setError("Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const isWildcard = (perms: string[]) => perms.includes(ALL_PERMISSION);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-5 text-brand-600" />
            Roles &amp; Permissions
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {roles.length} roles · Super Admin always has full access
          </p>
        </div>
        {canManageRoles && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
          >
            <Plus className="size-4" />
            New Custom Role
          </Button>
        )}
      </div>

      {toast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => {
            const isOpen = expanded === role.id;
            const editable = canManageRoles && !role.isSystem;
            return (
              <div
                key={role.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(role)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-700/15 border border-brand-500/25 flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{role.label}</span>
                        {role.isSystem ? (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-slate-300 text-slate-500">
                            System
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-violet-400/40 bg-violet-500/10 text-violet-700">
                            Custom
                          </Badge>
                        )}
                        {isWildcard(role.permissions) && (
                          <Badge className="text-[10px] uppercase tracking-wide bg-rose-500/10 text-rose-700 border border-rose-500/30">
                            Full Access
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {role.description || role.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {role.userCount ?? 0} user{(role.userCount ?? 0) === 1 ? "" : "s"}
                    </span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded: permission matrix */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/60">
                    {isWildcard(role.permissions) && (
                      <p className="mb-3 text-xs font-medium text-rose-700">
                        This role bypasses all permission checks.
                      </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {PERMISSION_CATALOG.map((group) => (
                        <div key={group.group} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {group.group}
                          </div>
                          <div className="space-y-2">
                            {group.items.map((item) => {
                              const checked =
                                isWildcard(editable ? Array.from(draft) : role.permissions) ||
                                (editable ? draft.has(item.key) : role.permissions.includes(item.key));
                              return (
                                <label
                                  key={item.key}
                                  className="flex items-start gap-2.5 py-1 cursor-pointer"
                                >
                                  <Checkbox
                                    checked={checked}
                                    disabled={!editable}
                                    onCheckedChange={() => togglePerm(draft, setDraft, item.key)}
                                    className="mt-0.5"
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium leading-tight">
                                      {item.label}
                                    </span>
                                    <span className="block text-[11px] text-muted-foreground font-mono leading-tight mt-0.5">
                                      {item.key}
                                      {item.hint ? ` — ${item.hint}` : ""}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {!editable ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Lock className="size-3" />
                          System role — permissions are fixed.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {draft.size} permission{draft.size === 1 ? "" : "s"} selected
                        </p>
                      )}
                      {editable && (
                        <Button
                          size="sm"
                          onClick={() => saveRole(role)}
                          disabled={saving}
                          className="bg-brand-600 hover:bg-brand-700 text-white"
                        >
                          {saving ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Save className="size-3.5" />
                          )}
                          Save Permissions
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create custom role dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Define a new role and pick the permissions it grants. Assign it to staff
              users from the Staff page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="role-label" className="text-xs">
                  Display name
                </Label>
                <Input
                  id="role-label"
                  value={newRole.label}
                  onChange={(e) => setNewRole({ ...newRole, label: e.target.value })}
                  placeholder="e.g. SEO Specialist"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-key" className="text-xs">
                  Role key (A-Z, underscores)
                </Label>
                <Input
                  id="role-key"
                  value={newRole.key}
                  onChange={(e) =>
                    setNewRole({
                      ...newRole,
                      key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                    })
                  }
                  placeholder="SEO_SPECIALIST"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role-desc" className="text-xs">
                Description
              </Label>
              <Input
                id="role-desc"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="What can this role do?"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 max-h-64 overflow-y-auto scrollbar-thin space-y-3">
              {PERMISSION_CATALOG.map((group) => (
                <div key={group.group}>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {group.group}
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <label key={item.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <Checkbox
                          checked={newPerms.has(item.key)}
                          onCheckedChange={() => togglePerm(newPerms, setNewPerms, item.key)}
                        />
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                          {item.key}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={createRole}
              disabled={saving || !newRole.label.trim() || !newRole.key.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
