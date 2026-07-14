"use client";

import { useState } from "react";

export default function AcceptInviteForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not accept invite");
        setBusy(false);
        return;
      }
      window.location.href = "/portal";
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label className="block">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
          Your name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ama Boateng"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
          Password{" "}
          <span className="tracking-normal normal-case text-foreground/40">
            · 8+ characters
          </span>
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-accent"
        />
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-shine w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-5 py-3 font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60"
      >
        {busy ? "Joining…" : "Join team"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
