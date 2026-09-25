"use client";

import * as React from "react";
import { AdminLogin } from "./admin-login";
import { AdminShell } from "./admin-shell";
import type { SessionUser } from "@/lib/rbac";

export function AdminPanel() {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [checked, setChecked] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      // Support password-reset deep links: /#admin?reset=<token>
      if (typeof window !== "undefined" && window.location.hash.includes("?reset=")) {
        const token = window.location.hash.split("?reset=")[1]?.split("&")[0];
        if (token) {
          if (!cancelled) setResetToken(token);
          // Clear the token from the URL so it isn't shared via referrers
          history.replaceState(null, "", window.location.pathname + "#admin");
        }
      }

      // Validate the session server-side (httpOnly cookie is sent automatically)
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUser(data.user as SessionUser);
          setChecked(true);
          return;
        }
      } catch {
        /* fall through to local cache */
      }

      // Never trust a client-side cached identity. The httpOnly session cookie
      // is the sole source of authentication truth.
      if (!cancelled) setChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        initialResetToken={resetToken}
        onLogin={(u) => {
          setUser(u);
        }}
      />
    );
  }

  return (
    <AdminShell
      user={user}
      onLogout={() => setUser(null)}
    />
  );
}
