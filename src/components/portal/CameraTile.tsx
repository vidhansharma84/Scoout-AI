"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { type Camera, statusColor, timeAgo } from "@/lib/portal-mocks";

export default function CameraTile({ camera }: { camera: Camera }) {
  const c = statusColor(camera.status);
  const isOffline = camera.status === "offline";

  return (
    <Link
      href={`/portal/cameras/${camera.id}`}
      className="group relative block rounded-2xl border border-border bg-surface/50 overflow-hidden hover:border-accent/40 transition-colors"
    >
      {/* viewport */}
      <div
        className={`relative aspect-[16/10] overflow-hidden ${
          isOffline ? "grayscale opacity-50" : ""
        }`}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(${camera.hue} 30% 12%), hsl(${
              (camera.hue + 30) % 360
            } 25% 6%) 60%, hsl(${(camera.hue + 60) % 360} 40% 14%))`,
          }}
        />
        {/* faux scene */}
        <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full opacity-30">
          <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.6">
            <line x1="0" y1="130" x2="320" y2="130" />
            <line x1="0" y1="160" x2="320" y2="160" />
            <line x1="60" y1="60" x2="60" y2="200" />
            <line x1="180" y1="60" x2="180" y2="200" />
          </g>
        </svg>

        {/* live scan line */}
        {!isOffline && (
          <motion.div
            initial={{ y: "-10%" }}
            animate={{ y: "110%" }}
            transition={{ duration: 3.6, ease: "linear", repeat: Infinity, delay: Math.random() }}
            className="pointer-events-none absolute inset-x-0 h-[1.5px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,204,31,0.75), transparent)",
              boxShadow: "0 0 10px rgba(255,204,31,0.55)",
            }}
          />
        )}

        {/* HUD */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-background/70 backdrop-blur px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-foreground/80">
          <span
            className={`h-1.5 w-1.5 rounded-full ${!isOffline ? "blink" : ""}`}
            style={{ background: c }}
          />
          {camera.name}
        </div>
        <div className="absolute top-2 right-2 rounded-md bg-background/70 backdrop-blur px-1.5 py-0.5 font-mono text-[9px] text-foreground/70">
          {camera.resolution.split("×")[0]}p
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono text-[9px] text-foreground/65">
          <span className="truncate">{camera.location}</span>
          <span className="shrink-0">{isOffline ? "offline" : `${camera.fps}fps`}</span>
        </div>

        {isOffline && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-300 bg-red-500/15 border border-red-500/30 rounded-md px-2 py-1">
              Stream lost
            </span>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{camera.location}</p>
          <p className="font-mono text-[10px] text-foreground/50 mt-0.5">
            {camera.detections} detections · last event {timeAgo(camera.lastEventAt)}
          </p>
        </div>
        <span
          aria-hidden
          className="text-foreground/30 group-hover:text-accent transition-colors text-sm"
        >
          →
        </span>
      </div>
    </Link>
  );
}
