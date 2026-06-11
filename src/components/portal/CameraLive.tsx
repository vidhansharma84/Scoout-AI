"use client";

import { motion } from "framer-motion";
import type { Camera } from "@/lib/portal-mocks";

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

const BOXES: Box[] = [
  { label: "PERSON", conf: 0.94, top: "30%", left: "16%", w: "16%", h: "54%", color: "warn", delay: 0.3 },
  { label: "MOTION", conf: 0.81, top: "50%", left: "40%", w: "20%", h: "32%", color: "ok", delay: 0.6 },
  { label: "PERSON", conf: 0.88, top: "34%", left: "66%", w: "14%", h: "50%", color: "warn", delay: 0.9 },
];

const COLOR = {
  danger: "rgb(255,80,60)",
  warn: "rgb(255,170,40)",
  ok: "rgb(0,230,180)",
};

export default function CameraLive({ camera }: { camera: Camera }) {
  const isOffline = camera.status === "offline";

  return (
    <div className="relative rounded-3xl border border-border bg-gradient-to-b from-surface-2 to-surface p-3 sm:p-4">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            scoout.ai / {camera.id} · {camera.location.toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-foreground/60">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isOffline ? "" : "bg-red-500 blink"}`}
            style={isOffline ? { background: "rgb(255,80,60)" } : undefined}
          />
          {isOffline ? "OFFLINE" : "REC"}
        </div>
      </div>

      <div
        className={`scanline relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1414] via-[#101820] to-[#1c1410] ${
          isOffline ? "grayscale opacity-50" : ""
        }`}
      >
        {/* faux scene */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(60% 50% at 70% 30%, hsla(${camera.hue}, 70%, 45%, 0.3), transparent 60%), radial-gradient(40% 30% at 20% 70%, hsla(${(camera.hue + 180) % 360}, 50%, 50%, 0.18), transparent 70%)`,
          }}
        />
        {/* shelves */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)]" />
        <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full opacity-60">
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
            <line x1="0" y1="320" x2="800" y2="320" />
            <line x1="0" y1="370" x2="800" y2="370" />
            <line x1="0" y1="420" x2="800" y2="420" />
            <line x1="160" y1="180" x2="160" y2="450" />
            <line x1="360" y1="180" x2="360" y2="450" />
            <line x1="560" y1="180" x2="560" y2="450" />
            <line x1="720" y1="180" x2="720" y2="450" />
          </g>
        </svg>

        {!isOffline && (
          <>
            <motion.div
              initial={{ y: "-10%" }}
              animate={{ y: "110%" }}
              transition={{ duration: 3.6, ease: "linear", repeat: Infinity }}
              className="pointer-events-none absolute inset-x-0 h-[2px] z-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,204,31,0.85), transparent)",
                boxShadow: "0 0 14px rgba(255,204,31,0.6)",
              }}
            />
            {BOXES.map((b) => (
              <Detection key={`${b.label}-${b.left}`} {...b} />
            ))}
          </>
        )}

        {isOffline && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-red-300">
                Stream lost
              </p>
              <p className="mt-1 text-xs text-foreground/60">
                Last frame: yesterday 18:02
              </p>
            </div>
          </div>
        )}

        {/* HUD */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
          <span>● {camera.id.toUpperCase()}</span>
          <span className="text-foreground/40">
            res {camera.resolution} · {camera.fps}fps
          </span>
        </div>
        <div className="absolute right-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
          lat 38ms · model v3.2
        </div>
        <div className="absolute left-3 bottom-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
          {camera.location.toLowerCase()}
        </div>
        <div className="absolute right-3 bottom-3 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
          {!isOffline && <span className="blink">●</span>} live
        </div>
      </div>

      {/* timeline */}
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 mb-1.5">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>now</span>
        </div>
        <div className="relative h-3 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-accent/30"
            style={{ width: "78%" }}
          />
          {/* event markers */}
          {[12, 28, 41, 55, 67, 73].map((pct, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-[2px] bg-accent"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Detection({ label, conf, top, left, w, h, color, delay }: Box) {
  const c = COLOR[color];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{ top, left, width: w, height: h }}
    >
      <motion.div
        className="absolute inset-0 rounded-[3px]"
        style={{ boxShadow: `inset 0 0 0 1.5px ${c}, 0 0 24px -6px ${c}` }}
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.3,
        }}
      />
      {(
        [
          ["top-0 left-0", "border-t-2 border-l-2"],
          ["top-0 right-0", "border-t-2 border-r-2"],
          ["bottom-0 left-0", "border-b-2 border-l-2"],
          ["bottom-0 right-0", "border-b-2 border-r-2"],
        ] as const
      ).map(([pos, b]) => (
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
