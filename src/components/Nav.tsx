"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#trusted", label: "Trusted by" },
  { href: "#alerts", label: "Alerts" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div
          className={`flex items-center justify-between rounded-full border border-border px-4 sm:px-5 py-2.5 transition-all duration-300 ${
            scrolled
              ? "bg-background/80 backdrop-blur-xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)]"
              : "bg-background/40 backdrop-blur"
          }`}
        >
          <a href="#top" className="flex items-center gap-2 group">
            <Logo className="w-7 h-7" />
            <span className="font-display font-semibold tracking-tight text-foreground">
              Scoout<span className="text-accent">.</span>AI
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#request"
              className="btn-shine hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-background transition-colors"
            >
              Request Demo
              <span aria-hidden>→</span>
            </a>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1">
                <span className="h-px w-4 bg-foreground" />
                <span className="h-px w-4 bg-foreground" />
              </div>
            </button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 rounded-2xl border border-border bg-background/90 backdrop-blur-xl p-4"
          >
            <ul className="flex flex-col gap-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-foreground/80 hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#request"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent text-background px-4 py-2 text-sm font-medium"
                >
                  Request Demo →
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
