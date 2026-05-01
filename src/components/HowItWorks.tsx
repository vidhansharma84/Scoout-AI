"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Plug into your existing NVR/VMS",
    body: "Scoout AI connects to your current camera operating system in minutes — no rip & replace, no new wiring.",
  },
  {
    n: "02",
    title: "Our models watch every frame",
    body: "Vision models trained on real-world store footage continuously detect smoke, fire, gas-leak signatures and motion.",
  },
  {
    n: "03",
    title: "You get an instant alert",
    body: "The moment something is wrong, your phone gets a push, an SMS, or a phone call — even when data is patchy.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / how it works
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-[1.02] text-balance">
              Trained ML models that{" "}
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                see what humans miss.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-foreground/70 text-base sm:text-lg max-w-md text-balance">
              We&apos;ve built and trained advanced vision models that plug
              into your existing CCTV system to detect early signs of smoke
              and gas-leak patterns and trigger instant alerts.
            </p>
            <a
              href="#request"
              className="btn-shine mt-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-background transition-colors"
            >
              Book Demo →
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-6 sm:p-7 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/50">
                  step {s.n}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 group-hover:bg-accent group-hover:text-background group-hover:border-accent transition-colors">
                  →
                </span>
              </div>
              <h3 className="mt-10 font-display text-2xl sm:text-3xl font-semibold leading-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-foreground/65 leading-relaxed">{s.body}</p>
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(255,106,44,0.35), transparent)",
                }}
              />
            </motion.div>
          ))}
        </div>

        <FeatureGrid />
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { label: "Smoke & fire", desc: "Early-stage pattern detection." },
    { label: "Gas leaks", desc: "Vapor + thermal signature cues." },
    { label: "Motion", desc: "After-hours intrusion + loitering." },
    { label: "Suspicious activity", desc: "Theft and tampering events." },
    { label: "Multi-cam", desc: "Run across your full NVR fleet." },
    { label: "Privacy-first", desc: "Inference stays at the edge." },
  ];
  return (
    <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
      {features.map((f) => (
        <div key={f.label} className="bg-background p-5 sm:p-6">
          <div className="flex items-center gap-2 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-display font-semibold">{f.label}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/60">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
