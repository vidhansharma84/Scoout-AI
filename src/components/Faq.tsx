"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    q: "Will Scoout AI work with my existing CCTV cameras?",
    a: "Yes. Scoout AI is camera-agnostic — it plugs into your current NVR or VMS and works with any brand, age, or model. You don't need to replace a single camera.",
  },
  {
    q: "What can Scoout AI detect?",
    a: "Smoke, fire and gas-leak signatures at an early stage, plus motion, intrusions and suspicious activity at your store, home, or facility.",
  },
  {
    q: "How fast do alerts arrive?",
    a: "Alerts reach your phone in under two seconds via push notification, SMS, or a triggered phone call — even on poor connections.",
  },
  {
    q: "Do I need new hardware or extra internet?",
    a: "No. Scoout AI runs on top of your existing camera setup. For sites with patchy data, we have an SMS and call fallback so alerts always get through.",
  },
  {
    q: "How is my footage handled?",
    a: "Inference runs at the edge wherever possible. Footage stays under your control — we never train on customer data without explicit consent.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / faq
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] text-balance">
              Frequently asked
              <br />
              <span className="text-foreground/50">questions.</span>
            </h2>
            <p className="mt-5 text-foreground/65 max-w-sm">
              Couldn&apos;t find what you&apos;re looking for? Send us a note via the
              demo form below — we usually reply same day.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((f, i) => (
                <Item key={i} q={f.q} a={f.a} idx={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/40 mt-1 w-8 shrink-0">
          {String(idx).padStart(2, "0")}
        </span>
        <span className="flex-1 font-display text-xl sm:text-2xl font-semibold leading-tight">
          {q}
        </span>
        <span
          className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-foreground/70 transition-transform ${
            open ? "rotate-45 bg-accent text-background border-accent" : ""
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pl-14 pr-12 pb-6 text-foreground/70 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
