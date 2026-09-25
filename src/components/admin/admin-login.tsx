"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/rbac";

const DEFAULT_EMAIL = "";

type Mode = "login" | "forgot" | "reset";

export function AdminLogin({
  onLogin,
  initialResetToken,
}: {
  onLogin: (user: SessionUser) => void;
  initialResetToken?: string;
}) {
  const [mode, setMode] = React.useState<Mode>(initialResetToken ? "reset" : "login");
  const [resetToken, setResetToken] = React.useState(initialResetToken ?? "");
  const [email, setEmail] = React.useState(DEFAULT_EMAIL);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
    setPassword("");
    setStatus("idle");
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        onLogin(data.user as SessionUser);
      } else {
        setStatus("error");
        setError(data.error || "Invalid email or password. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Authentication failed. Please try again.");
    }
  };

  const onForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice(
          data.message ??
            "If an account exists for this email, a password reset link has been sent."
        );
      } else {
        setError(data.error ?? "Request failed. Please try again.");
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice(data.message ?? "Password updated. You can now sign in.");
        window.setTimeout(() => switchMode("login"), 1600);
      } else {
        setError(data.error ?? "Reset failed. Please try again.");
      }
    } catch {
      setError("Reset failed. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const inputType = showPassword ? "text" : "password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800 p-4">
      <div className="absolute inset-0 hero-grid opacity-30" aria-hidden />
      <div className="absolute inset-0 hero-radial opacity-60" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="relative w-full max-w-md rounded-3xl bg-background border border-border shadow-2xl p-8"
      >
        <div className="text-center mb-6">
          <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
            {mode === "login" ? (
              <ShieldCheck className="size-7 text-white" />
            ) : (
              <KeyRound className="size-7 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Climbix Admin" : mode === "forgot" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in with your staff account to manage the website"
              : mode === "forgot"
                ? "Enter your account email to receive a reset link"
                : "Paste your reset token and choose a new password"}
          </p>
        </div>

        {mode === "login" && (
          <form onSubmit={onLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email address
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@climbixmarketing.com"
                  required
                  autoFocus
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={inputType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="w-full text-center text-xs text-muted-foreground hover:text-brand-600"
            >
              Forgot password?
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={onForgotSubmit} className="space-y-4">
            {notice ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  {notice}
                </div>
                <p className="text-xs text-muted-foreground">
                  Administrators can view the reset link in <strong>CRM → Email Log</strong>. Once SMTP is
                  configured in Settings → Email, links are delivered to the mailbox directly.
                </p>
                <Button type="button" variant="outline" className="w-full" onClick={() => switchMode("reset")}>
                  <KeyRound className="size-4 mr-1.5" /> I have a reset token
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email" className="text-xs">
                    Account email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@climbixmarketing.com"
                      required
                      autoFocus
                      className="pl-9"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-center text-xs text-muted-foreground hover:text-brand-600"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={onResetSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-token" className="text-xs">
                Reset token
              </Label>
              <Input
                id="reset-token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste the token from your reset email"
                required
                autoFocus
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={inputType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {notice && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                {notice}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full text-center text-xs text-muted-foreground hover:text-brand-600"
            >
              ← Back to sign in
            </button>
          </form>
        )}



        <a
          href="#top"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to website
        </a>
      </motion.div>
    </div>
  );
}
