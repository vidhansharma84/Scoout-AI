"use client";

import { motion } from "framer-motion";

type Box = {
  label: string;
  conf: number;
  top: string;
  left: string;
  w: string;
  h: string;
  color: "danger" | "warn" | "ok";
  delay: number;
};

const boxes: Box[] = [
  { label: "FIRE", conf: 0.97, top: "18%", left: "62%", w: "26%", h: "30%", color: "danger", delay: 0.4 },
  { label: "PERSON", conf: 0.91, top: "44%", left: "12%", w: "18%", h: "44%", color: "warn", delay: 0.7 },
  { label: "MOTION", conf: 0.84, top: "58%", left: "38%", w: "22%", h: "30%", color: "ok", delay: 1.0 },
];

const colorMap = {
  danger: "rgb(255, 80, 60)",
  warn: "rgb(255, 170, 40)",
  ok: "rgb(0, 230, 180)",
};

export default function CameraView() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* outer device frame */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-3 sm:p-4 shadow-[0_40px_120px_-40px_rgba(255,106,44,0.35)]">
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            </div>
            <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">
              scoout.ai / live · cam-04
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 blink" />
            REC
          </div>
        </div>

        {/* CCTV viewport */}
        <div className="scanline relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1414] via-[#101820] to-[#1c1410]">
          {/* faux scene gradient */}
          <div className="absolute inset-0 opacity-90"
               style={{
                 background:
                   "radial-gradient(60% 50% at 70% 30%, rgba(255,140,40,0.35), transparent 60%), radial-gradient(40% 30% at 20% 70%, rgba(80,140,200,0.18), transparent 70%)",
               }}
          />
          {/* shelf silhouettes */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)]" />
          <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full opacity-60">
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
              <line x1="0" y1="320" x2="800" y2="320" />
              <line x1="0" y1="370" x2="800" y2="370" />
              <line x1="0" y1="420" x2="800" y2="420" />
              <line x1="120" y1="180" x2="120" y2="450" />
              <line x1="320" y1="180" x2="320" y2="450" />
              <line x1="540" y1="180" x2="540" y2="450" />
              <line x1="700" y1="180" x2="700" y2="450" />
            </g>
          </svg>

          {/* smoke */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 0.55, 0.4, 0.6], y: [20, -10, -20, -30] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[18%] top-[12%] h-40 w-40 rounded-full blur-2xl"
            style={{ background: "rgba(255,170,90,0.55)" }}
          />

          {/* corner brackets */}
          <CornerBrackets />

          {/* boxes */}
          {boxes.map((b) => (
            <Detection key={b.label} {...b} />
          ))}

          {/* HUD */}
          <div className="absolute left-3 top-3 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
            <span>● 04 / 16 cams</span>
            <span className="text-foreground/40">res 1920×1080 · 30fps</span>
          </div>
          <div className="absolute right-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
            lat 38ms · model v3.2
          </div>
          <div className="absolute left-3 bottom-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
            cam-04 · aisle 3
          </div>
          <div className="absolute right-3 bottom-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
            <span className="blink">●</span> live
          </div>
        </div>
      </div>

      {/* floating alert card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-2 sm:-right-6 -bottom-6 sm:-bottom-10 w-[260px] rounded-2xl border border-border bg-background/85 backdrop-blur-xl p-4 shadow-2xl hidden sm:block"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-accent/15 border border-accent/30">
            <span className="text-accent text-base">🔥</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Fire Detected
              </span>
              <span className="font-mono text-[10px] text-foreground/50">now</span>
            </div>
            <p className="mt-1 text-[13px] text-foreground/80 leading-snug">
              Smoke pattern on Cam-04 (Aisle 3). Tap to view live feed.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-md bg-foreground text-background px-2.5 py-1 text-[11px] font-medium">
                View
              </button>
              <button className="rounded-md border border-border px-2.5 py-1 text-[11px] text-foreground/70">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CornerBrackets() {
  const stroke = "rgba(255,255,255,0.5)";
  return (
    <svg className="pointer-events-none absolute inset-3" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g fill="none" stroke={stroke} strokeWidth="0.4">
        <polyline points="0,4 0,0 4,0" />
        <polyline points="96,0 100,0 100,4" />
        <polyline points="0,96 0,100 4,100" />
        <polyline points="96,100 100,100 100,96" />
      </g>
    </svg>
  );
}

function Detection({ label, conf, top, left, w, h, color, delay }: Box) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{ top, left, width: w, height: h }}
    >
      <div
        className="absolute inset-0 rounded-[3px]"
        style={{ boxShadow: `inset 0 0 0 1.5px ${c}, 0 0 24px -6px ${c}` }}
      />
      {/* corner ticks */}
      {([
        ["top-0 left-0", "border-t-2 border-l-2"],
        ["top-0 right-0", "border-t-2 border-r-2"],
        ["bottom-0 left-0", "border-b-2 border-l-2"],
        ["bottom-0 right-0", "border-b-2 border-r-2"],
      ] as const).map(([pos, b]) => (
        <span
          key={pos}
          className={`absolute ${pos} h-3 w-3 ${b}`}
          style={{ borderColor: c }}
        />
      ))}
      <div
        className="absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
        style={{ background: c, color: "#0a0a0b" }}
      >
        {label}
        <span className="opacity-70">{Math.round(conf * 100)}%</span>
      </div>
    </motion.div>
  );
}
