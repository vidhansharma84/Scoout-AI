"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import CameraView from "./CameraView";

const headline = ["Surveillance", "Intelligence", "Powered By AI."];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate overflow-hidden pt-32 sm:pt-36 pb-16"
    >
      {/* radial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(255,106,44,0.18), transparent 60%), radial-gradient(700px 400px at 80% 30%, rgba(255,209,102,0.10), transparent 60%)",
        }}
      />
      {/* grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div style={{ y, opacity }} className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-3 py-1.5 text-xs text-foreground/80"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-accent/60 pulse-ring" />
              <span className="relative h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono uppercase tracking-[0.18em]">Live • AI Vision Active</span>
          </motion.div>

          <h1 className="mt-8 font-display font-semibold text-5xl sm:text-7xl md:text-8xl leading-[0.95] text-balance">
            {headline.map((word, i) => (
              <span key={word} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {i === 2 ? (
                    <>
                      Powered By{" "}
                      <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                        AI.
                      </span>
                    </>
                  ) : (
                    word
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-2xl text-base sm:text-lg text-foreground/70 text-balance"
          >
            Scoout AI turns your existing CCTV cameras into smart detectors.
            Spot smoke, fire and gas leaks early — and catch motion or
            suspicious activity at your store the moment it happens.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-3"
          >
            <a
              href="#request"
              className="btn-shine group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-background hover:bg-accent-2 transition-colors glow-orange"
            >
              Request Demo
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 backdrop-blur px-6 py-3.5 font-medium text-foreground hover:bg-surface transition-colors"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-6 text-xs uppercase tracking-[0.25em] text-foreground/50 font-mono"
          >
            Get alerts instantly · Protect your business and home
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20"
        >
          <CameraView />
        </motion.div>
      </div>
    </section>
  );
}
