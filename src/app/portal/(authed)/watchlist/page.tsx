"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Rule = {
  id: string;
  prompt: string;
  active: boolean;
  cameras: string[];
  createdAt: string;
};

type Camera = {
  id: string;
  name: string;
  location: string | null;
};

const SUGGESTIONS = [
  "Person sitting",
  "Liquid spills",
  "Abandoned bags",
  "Damaged products",
  "Heat sources",
  "Vandalism",
  "Loitering after hours",
  "Cash handling",
  "Smoke patterns",
  "Crowd buildup",
  "Open fridge doors",
  "Forklift in aisle",
  "Empty shelves > 1h",
  "Mask not worn",
  "Spillage near checkout",
];

export default function WatchlistPage() {
  const [prompt, setPrompt] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [r, c] = await Promise.all([
      fetch("/api/v1/rules").then((r) => (r.ok ? r.json() : { rules: [] })),
      fetch("/api/v1/cameras").then((r) => (r.ok ? r.json() : { cameras: [] })),
    ]);
    setRules(r.rules ?? []);
    setCameras(c.cameras ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const createRule = async () => {
    if (!prompt.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), cameras: [] }),
      });
      if (res.ok) {
        setPrompt("");
        await refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Could not create rule");
      }
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (r: Rule) => {
    // Optimistic
    setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
    const res = await fetch(`/api/v1/rules/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active }),
    });
    if (!res.ok) refresh(); // rollback via refetch
  };

  const deleteRule = async (r: Rule) => {
    if (!confirm(`Delete rule "${r.prompt}"?`)) return;
    setRules((rs) => rs.filter((x) => x.id !== r.id));
    await fetch(`/api/v1/rules/${r.id}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          / watchlist
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
          What should we watch for?
        </h1>
        <p className="mt-1.5 text-foreground/65 text-sm sm:text-base max-w-2xl">
          Describe what you want in plain English. The AI understands context,
          behavior, and intent — then applies it to whichever cameras you pick.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-surface/50 p-5 sm:p-7 mb-10">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-3.5">
          <span className="text-accent text-lg">⌕</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createRule();
            }}
            placeholder="e.g. Alert me when someone opens the back door after hours"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none"
          />
          <button
            type="button"
            onClick={createRule}
            disabled={!prompt.trim() || creating}
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-4 py-2 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? "Creating…" : "Create rule"} <span aria-hidden>→</span>
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 self-center">
            suggestions:
          </span>
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => setPrompt((p) => (p ? `${p}, ${s.toLowerCase()}` : s))}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
              className="rounded-full border border-border bg-surface/70 hover:bg-accent/15 hover:border-accent/40 px-3 py-1 text-xs text-foreground/80 transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
              / active rules
            </p>
            <h2 className="font-display text-2xl font-semibold mt-1">
              {rules.length} {rules.length === 1 ? "rule" : "rules"}
            </h2>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : rules.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface/40 p-10 text-center">
            <p className="text-sm text-foreground/60">
              No rules yet. Type a prompt above (or tap a suggestion) to create
              your first watchlist entry.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rules.map((r) => {
              const cams = cameras.filter((c) => r.cameras.includes(c.id));
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-surface/40 p-5 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-base text-foreground/90 leading-snug">
                        <span className="text-accent">⌕</span> {r.prompt}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                          applied to
                        </span>
                        {r.cameras.length === 0 ? (
                          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-foreground/70">
                            all cameras
                          </span>
                        ) : (
                          cams.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-md bg-surface-2 px-2 py-0.5 text-foreground/80"
                            >
                              {c.name}
                              {c.location ? ` · ${c.location}` : ""}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleActive(r)}
                        aria-pressed={r.active}
                        className="inline-flex items-center cursor-pointer"
                      >
                        <span
                          className={`w-9 h-5 rounded-full border border-border relative transition-colors ${
                            r.active ? "bg-accent" : "bg-surface-2"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-transform ${
                              r.active ? "translate-x-4 left-0.5" : "left-0.5"
                            }`}
                          />
                        </span>
                      </button>
                      <button
                        onClick={() => deleteRule(r)}
                        className="text-foreground/45 hover:text-red-400 transition-colors text-sm"
                        title="Delete rule"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
