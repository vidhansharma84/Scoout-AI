"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CHIPS = [
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
];

const TYPED_PROMPTS = [
  "Alert me when someone enters storage after 10pm",
  "Watch for smoke or fire near the gas cylinders",
  "Flag any person loitering by the cash counter",
  "Tell me if shelves stay empty for more than an hour",
];

export default function WatchFor() {
  return (
    <section
      id="watch-for"
      className="relative py-24 sm:py-32 border-t border-border overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / describe what to watch for
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[1.02] text-balance">
              Tell the AI what to watch.{" "}
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                In plain English.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-foreground/70 text-base sm:text-lg text-balance">
              No rule editors, no event configs. Type what you care about —
              Scoout turns it into a live watchlist and flags only the moments
              that match.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Dashboard mockup */}
          <div className="lg:col-span-8">
            <DashboardMock />
          </div>

          {/* Phone — Review clip */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <ReviewPhone />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div
      className="relative rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-2 sm:p-3"
      style={{
        boxShadow:
          "0 50px 140px -50px rgba(255,204,31,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <div className="flex-1 mx-4 max-w-md">
          <div className="rounded-md bg-background/60 border border-border px-3 py-1 font-mono text-[11px] text-foreground/60 text-center">
            scoout.ai / dashboard
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* Body */}
      <div className="px-6 sm:px-10 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            AI Prompt Detection
          </div>
          <h3 className="mt-5 font-display text-3xl sm:text-4xl font-semibold">
            What should we watch for?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-foreground/65 leading-relaxed">
            Describe what you want in plain English. The AI understands
            context, behavior, and intent.
          </p>

          <PromptInput />

          <ChipCloud />

          <button
            type="button"
            className="btn-shine mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-background px-6 py-3 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
          >
            Create alert
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptInput() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const full = TYPED_PROMPTS[idx];
    if (typing) {
      if (text.length < full.length) {
        const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 45);
        return () => clearTimeout(t);
      }
      const hold = setTimeout(() => setTyping(false), 1800);
      return () => clearTimeout(hold);
    } else {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 22);
        return () => clearTimeout(t);
      }
      setIdx((i) => (i + 1) % TYPED_PROMPTS.length);
      setTyping(true);
    }
  }, [text, typing, idx]);

  return (
    <div className="mt-7 mx-auto max-w-xl">
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-3 text-left">
        <span className="text-accent">⌕</span>
        <span className="flex-1 text-sm text-foreground/85 font-mono truncate">
          {text}
          <span className="ml-0.5 inline-block w-[2px] h-3.5 align-middle bg-accent blink" />
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-foreground/55">
          ⌘ K
        </span>
      </div>
    </div>
  );
}

function ChipCloud() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      {CHIPS.map((c, i) => (
        <motion.span
          key={c}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
          className="cursor-default rounded-full border border-border bg-surface/60 hover:bg-accent/15 hover:border-accent/40 px-3.5 py-1.5 text-xs text-foreground/80 transition-colors"
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

function ReviewPhone() {
  return (
    <div className="relative w-[280px] sm:w-[300px]">
      <div className="relative rounded-[42px] border border-border bg-gradient-to-b from-surface-2 to-surface p-2 shadow-[0_30px_120px_-30px_rgba(255,204,31,0.45)]">
        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-5 w-24 rounded-full bg-background/80 z-10" />
        <div className="aspect-[9/19] overflow-hidden rounded-[34px] bg-background relative">
          {/* status bar */}
          <div className="px-6 pt-3 flex items-center justify-between font-mono text-[10px] text-foreground/70">
            <span>9:41</span>
            <span>● ● ●</span>
          </div>

          <div className="px-4 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              Review clip
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold">
              Aisle 2 · 02:14 AM
            </h3>
          </div>

          {/* mock scene */}
          <div className="mx-4 mt-3 relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-[#0e1414] via-[#161a20] to-[#1a1410]">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(55% 45% at 60% 35%, rgba(255,140,40,0.22), transparent 65%), radial-gradient(40% 30% at 25% 75%, rgba(80,140,200,0.18), transparent 70%)",
              }}
            />
            {/* shelves */}
            <svg viewBox="0 0 200 250" className="absolute inset-0 w-full h-full opacity-50">
              <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.6">
                <line x1="0" y1="170" x2="200" y2="170" />
                <line x1="0" y1="200" x2="200" y2="200" />
                <line x1="0" y1="230" x2="200" y2="230" />
                <line x1="40" y1="80" x2="40" y2="250" />
                <line x1="130" y1="80" x2="130" y2="250" />
              </g>
            </svg>
            {/* detection box on a person */}
            <div
              className="absolute"
              style={{ top: "32%", left: "44%", width: "18%", height: "44%" }}
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-[2px]"
                style={{ boxShadow: "inset 0 0 0 1.5px rgb(255,170,40), 0 0 18px -4px rgb(255,170,40)" }}
              />
              <div
                className="absolute -top-4 left-0 px-1 py-0.5 font-mono text-[7px] uppercase tracking-wider"
                style={{ background: "rgb(255,170,40)", color: "#0a0a0b" }}
              >
                Person 92%
              </div>
            </div>
            {/* live tag */}
            <div className="absolute right-2 bottom-2 font-mono text-[9px] uppercase tracking-wider text-foreground/70 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 blink" />
              REC
            </div>
          </div>

          {/* AI chat */}
          <div className="mx-4 mt-4 space-y-2">
            <div className="rounded-2xl rounded-tl-sm bg-surface/80 border border-border px-3 py-2 text-[11px] text-foreground/85 leading-snug">
              What happened in this clip?
            </div>
            <div className="rounded-2xl rounded-tr-sm bg-accent/15 border border-accent/30 px-3 py-2 text-[11px] text-foreground/90 leading-snug">
              A person entered Aisle 2 at 02:14 AM, removed items from the top
              shelf, and left at 02:16. No staff scan recorded.
            </div>
          </div>

          {/* bottom action */}
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-2xl border border-border bg-surface-2/80 backdrop-blur p-1.5">
            <button className="flex-1 rounded-xl bg-accent text-background py-2 text-xs font-medium">
              Mark reviewed
            </button>
            <button className="px-3 py-2 rounded-xl border border-border text-xs text-foreground/70">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
