"use client";

import { motion } from "framer-motion";

export default function Download() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-2 via-surface to-background p-8 sm:p-14">
          <div
            aria-hidden
            className="absolute -top-32 -right-32 h-80 w-80 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,106,44,0.45), transparent 60%)" }}
          />

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center relative">
            <div className="lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                / download our app
              </p>
              <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[1.02] text-balance">
                Your store. <br />
                <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                  In your pocket.
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-foreground/70 text-base sm:text-lg">
                With Scoout AI, fire outbreaks and theft will be controlled.
                Your business security increases by 30× — and you focus on
                growth, not guard-duty.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <StoreBadge
                  store="App Store"
                  caption="Download on the"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                      <path d="M16.365 1.43c0 1.14-.42 2.22-1.16 3.02-.83.91-2.18 1.61-3.27 1.52-.13-1.13.43-2.32 1.13-3.06.79-.85 2.16-1.49 3.3-1.48zm3.97 16.06c-.62 1.43-.92 2.06-1.72 3.32-1.11 1.74-2.68 3.91-4.62 3.93-1.72.02-2.16-1.13-4.49-1.12-2.33.02-2.81 1.14-4.54 1.12-1.94-.02-3.42-1.99-4.54-3.73-3.13-4.86-3.46-10.56-1.53-13.6 1.37-2.16 3.53-3.42 5.55-3.42 2.06 0 3.36 1.14 5.06 1.14 1.65 0 2.66-1.14 5.04-1.14 1.8 0 3.71.99 5.07 2.7-4.45 2.45-3.73 8.83.7 10.8z" />
                    </svg>
                  }
                />
                <StoreBadge
                  store="Google Play"
                  caption="Get it on"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                      <path d="M3.6 1.7c-.4.4-.6 1-.6 1.7v17.2c0 .7.2 1.3.6 1.7l9.5-10.3L3.6 1.7zm10.6 11.4l3 3-12 6.7c-.4.2-.8.2-1.1.1L14.2 13.1zm5-2.1l-3.4-1.9-3.6 3.9 3.6 4 3.4-1.9c1.1-.6 1.1-2.5 0-3.1zM14.2 12.9L5 2.5c.3-.1.7-.1 1.1.1l11.9 6.7-3.8 3.6z" />
                    </svg>
                  }
                />
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <Stat />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreBadge({
  store,
  caption,
  icon,
}: {
  store: string;
  caption: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href="#"
      className="btn-shine group inline-flex items-center gap-3 rounded-2xl border border-border bg-background/80 backdrop-blur px-5 py-3 hover:border-foreground/30 transition-colors"
    >
      <span className="text-foreground">{icon}</span>
      <span className="text-left">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-mono">
          {caption}
        </span>
        <span className="block font-display text-lg font-semibold leading-tight">
          {store}
        </span>
      </span>
    </a>
  );
}

function Stat() {
  const items = [
    { k: "30×", v: "Security uplift" },
    { k: "<2s", v: "Alert latency" },
    { k: "24/7", v: "AI watching" },
    { k: "0", v: "New hardware" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border"
    >
      {items.map((it) => (
        <div key={it.k} className="bg-background/70 backdrop-blur p-5 sm:p-6">
          <div className="font-display text-3xl sm:text-4xl font-semibold bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
            {it.k}
          </div>
          <div className="mt-1 text-sm text-foreground/65">{it.v}</div>
        </div>
      ))}
    </motion.div>
  );
}
