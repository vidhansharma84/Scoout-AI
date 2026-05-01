"use client";

import { motion } from "framer-motion";

export default function Alerts() {
  return (
    <section id="alerts" className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / custom AI alerts
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[1.02] text-balance">
              Reach you the way{" "}
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                an emergency demands.
              </span>
            </h2>
            <p className="mt-6 text-foreground/70 text-lg max-w-xl">
              Push notifications. SMS. A live phone call when you can&apos;t miss it.
              Even when data is patchy, your alert still gets through.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {[
                "Push notification",
                "SMS alert",
                "Phone call trigger",
                "No-data fallback",
              ].map((x) => (
                <li
                  key={x}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm text-foreground/80"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-accent text-[10px]">
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 relative">
            <PhoneMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="relative rounded-[42px] border border-border bg-gradient-to-b from-surface-2 to-surface p-2 shadow-[0_30px_120px_-30px_rgba(255,106,44,0.4)]">
        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-5 w-24 rounded-full bg-background/80 z-10" />
        <div className="aspect-[9/19] overflow-hidden rounded-[34px] bg-background relative">
          {/* status bar */}
          <div className="px-6 pt-3 flex items-center justify-between font-mono text-[10px] text-foreground/70">
            <span>9:41</span>
            <span>● ● ●</span>
          </div>

          {/* greeting */}
          <div className="px-5 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              Today
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
              Good evening,
              <br /> Kojo
            </h3>
          </div>

          {/* alerts list */}
          <div className="mt-5 px-3 space-y-3">
            <AlertCard
              level="critical"
              icon="🔥"
              title="Fire detected"
              meta="Cam-04 · Aisle 3 · just now"
              delay={0.0}
            />
            <AlertCard
              level="warn"
              icon="🚶"
              title="Motion after hours"
              meta="Cam-12 · Storage · 2m ago"
              delay={0.15}
            />
            <AlertCard
              level="info"
              icon="🟢"
              title="All clear"
              meta="11 cameras · stable"
              delay={0.3}
            />
          </div>

          {/* tab bar */}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-border bg-surface-2/80 backdrop-blur p-2 flex items-center justify-around text-foreground/50 text-xs">
            <span className="text-foreground">Live</span>
            <span>Alerts</span>
            <span>Cams</span>
            <span>Me</span>
          </div>
        </div>
      </div>

      {/* incoming call tile */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-6 top-10 hidden md:block w-[220px] rounded-2xl border border-border bg-background/85 backdrop-blur-xl p-3 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-background">
            📞
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground/50 font-mono">
              Incoming · Scoout AI
            </p>
            <p className="font-display font-semibold">Critical alert call</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AlertCard({
  level,
  icon,
  title,
  meta,
  delay,
}: {
  level: "critical" | "warn" | "info";
  icon: string;
  title: string;
  meta: string;
  delay: number;
}) {
  const colors = {
    critical: "border-accent/40 bg-accent/10",
    warn: "border-yellow-500/30 bg-yellow-500/5",
    info: "border-emerald-500/25 bg-emerald-500/5",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-start gap-3 rounded-2xl border p-3 ${colors[level]}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background/70 border border-border text-base">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-foreground/55 font-mono">{meta}</p>
      </div>
    </motion.div>
  );
}
