"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } catch {
          /* ignore */
        }
        window.location.href = "/admin/login";
      }}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
      <span aria-hidden>↗</span>
    </button>
  );
}
