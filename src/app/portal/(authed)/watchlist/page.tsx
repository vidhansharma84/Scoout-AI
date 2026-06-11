"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CAMERAS, RULES } from "@/lib/portal-mocks";

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

      {/* Composer */}
      <div className="rounded-3xl border border-border bg-surface/50 p-5 sm:p-7 mb-10">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-3.5">
          <span className="text-accent text-lg">⌕</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Alert me when someone opens the back door after hours"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none"
          />
          <button
            type="button"
            disabled={!prompt.trim()}
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-4 py-2 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create rule <span aria-hidden>→</span>
          </button>
        </div>

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

      {/* Active rules */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55">
              / active rules
            </p>
            <h2 className="font-display text-2xl font-semibold mt-1">
              {RULES.length} rules
            </h2>
          </div>
          <p className="text-sm text-foreground/55">
            Last 7 days: <span className="text-foreground/85">{RULES.reduce((a, r) => a + r.matchesLast7d, 0)}</span> matches
          </p>
        </div>

        <div className="grid gap-4">
          {RULES.map((r) => {
            const cams = CAMERAS.filter((c) => r.cameras.includes(c.id));
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
                      {cams.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-md bg-surface-2 px-2 py-0.5 text-foreground/80"
                        >
                          {c.name} · {c.location}
                        </span>
                      ))}
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                        · {r.matchesLast7d} matches last 7d
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={r.active}
                        className="peer sr-only"
                      />
                      <span className="w-9 h-5 rounded-full bg-surface-2 border border-border peer-checked:bg-accent transition-colors relative">
                        <span className="absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
                      </span>
                    </label>
                    <button className="text-foreground/45 hover:text-foreground transition-colors text-sm">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
