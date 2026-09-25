"use client";

import * as React from "react";
import {
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ShieldCheck,
  KeyRound,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, type SessionUser } from "@/lib/rbac";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface RoleInfo {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount?: number;
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  ADMIN: "bg-brand-500/10 text-brand-700 border-brand-500/30",
  SALES_MANAGER: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  CONTENT_MANAGER: "bg-violet-500/10 text-violet-700 border-violet-500/30",
  MANAGER: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  STAFF: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  VIEWER: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function AdminStaff({ user }: { user: SessionUser }) {
  const [users, setUsers] = React.useState<StaffUser[]>([]);
  const [roles, setRoles] = React.useState<RoleInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canManage = can(user.permissions, "staff.manage");
  const isSuper = user.role === "SUPER_ADMIN";

  // Editor state
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StaffUser | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    phone: "",
  });

  const [deleteTarget, setDeleteTarget] = React.useState<StaffUser | null>(null);
  const [resetTarget, setResetTarget] = React.useState<StaffUser | null>(null);
  const [resetPassword, setResetPassword] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users ?? []);
        setRoles(data.roles ?? []);
        setError(null);
      } else {
        setError(data.error || "Failed to load staff");
      }
    } catch {
      setError("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const roleLabel = (key: string) => roles.find((r) => r.name === key)?.label ?? key;

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "STAFF", phone: "" });
    setEditorOpen(true);
  };

  const openEdit = (u: StaffUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone ?? "" });
    setEditorOpen(true);
  };

  const saveEditor = async () => {
    setSaving(true);
    setError(null);
    try {
      const url = editing ? `/api/staff/${editing.id}` : "/api/staff";
      const method = editing ? "PATCH" : "POST";
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        role: form.role,
        phone: form.phone.trim() || null,
      };
      if (!editing) {
        payload.email = form.email.trim().toLowerCase();
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save staff user");
        return;
      }
      setEditorOpen(false);
      await load();
    } catch {
      setError("Failed to save staff user");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: StaffUser, next: boolean) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: next } : x)));
    try {
      const res = await fetch(`/api/staff/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update status");
        await load();
      }
    } catch {
      setError("Failed to update status");
      await load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Failed to delete user");
      setDeleteTarget(null);
      await load();
    } catch {
      setError("Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const confirmReset = async () => {
    if (!resetTarget) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${resetTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setResetTarget(null);
        setResetPassword("");
      }
    } catch {
      setError("Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      roleLabel(u.role).toLowerCase().includes(query.toLowerCase())
  );

  const canEditUser = (u: StaffUser) =>
    canManage && (isSuper || u.role !== "SUPER_ADMIN");

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="size-5 text-brand-600" />
            Staff Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} account{users.length === 1 ? "" : "s"} · {roles.length} roles
          </p>
        </div>
        {canManage && (
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
          >
            <UserPlus className="size-4" />
            Add Staff User
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or role…"
          className="pl-9"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                  Last Login
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No staff users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {u.name}
                            {u.id === user.id && (
                              <span className="ml-2 text-[10px] uppercase tracking-wide text-brand-600 font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`font-semibold ${
                          ROLE_COLORS[u.role] ?? "bg-slate-500/10 text-slate-600 border-slate-500/30"
                        }`}
                      >
                        {roleLabel(u.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {canEditUser(u) ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={u.isActive}
                            onCheckedChange={(v) => toggleActive(u, v)}
                            disabled={u.id === user.id}
                          />
                          <span className="text-xs text-muted-foreground">
                            {u.isActive ? "Active" : "Deactivated"}
                          </span>
                        </label>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            u.isActive
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/30"
                          }
                        >
                          {u.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canEditUser(u) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(u)}
                              className="size-8 p-0"
                              aria-label={`Edit ${u.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setResetTarget(u);
                                setResetPassword("");
                              }}
                              className="size-8 p-0"
                              aria-label={`Reset password for ${u.name}`}
                            >
                              <KeyRound className="size-3.5" />
                            </Button>
                          </>
                        )}
                        {canManage && u.id !== user.id && (isSuper || u.role !== "SUPER_ADMIN") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(u)}
                            className="size-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff User" : "Add Staff User"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the user's details or assign a different role."
                : "Create a new admin panel account and assign its role."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name" className="text-xs">
                Full name
              </Label>
              <Input
                id="staff-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Cooper"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email" className="text-xs">
                Email address
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@climbixmarketing.com"
                disabled={Boolean(editing)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role" className="text-xs">
                Role
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {roles.map((r) => (
                    <SelectItem
                      key={r.id}
                      value={r.name}
                      disabled={r.name === "SUPER_ADMIN" && !isSuper}
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-phone" className="text-xs">
                Phone (optional)
              </Label>
              <Input
                id="staff-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-password" className="text-xs">
                {editing ? "New password (leave blank to keep current)" : "Password"}
              </Label>
              <Input
                id="staff-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "••••••••" : "Minimum 8 characters"}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={saveEditor}
              disabled={saving || !form.name.trim() || (!editing && (!form.email.trim() || form.password.length < 8))}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => !open && setResetTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold">{resetTarget?.email}</span>. They can use it on
              their next sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password" className="text-xs">
              New password
            </Label>
            <Input
              id="reset-password"
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={confirmReset}
              disabled={saving || resetPassword.length < 8}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-semibold">
                {deleteTarget?.name} ({deleteTarget?.email})
              </span>
              . They will no longer be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
