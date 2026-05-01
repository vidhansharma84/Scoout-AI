"use client";

import Marquee from "./Marquee";

const customers = [
  "GOIL",
  "SHELL",
  "TOTAL",
  "SHOPRITE",
  "MELCOM",
  "ACCRA MALL",
  "CHINA MALL",
  "ESI SUPERMARKET",
  "PALACE MALL",
  "KOALA",
  "PUMA",
  "MAXMART",
];

const segments = [
  "Small retail stores",
  "Supermarkets",
  "Shopping malls",
  "Petrol stations",
  "Hotels",
  "University hostels",
  "Private homes",
  "Real-estate companies",
];

export default function TrustedBy() {
  return (
    <section id="trusted" className="relative py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / trusted by
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] text-balance">
            Powering security for businesses{" "}
            <span className="text-foreground/50">across the country.</span>
          </h2>
        </div>
      </div>

      <div className="mt-14">
        <Marquee duration={50}>
          {customers.map((c) => (
            <span
              key={c}
              className="font-display text-3xl sm:text-4xl font-semibold text-foreground/45 hover:text-foreground transition-colors whitespace-nowrap"
            >
              {c}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <ul className="flex flex-wrap gap-2">
          {segments.map((s) => (
            <li
              key={s}
              className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-foreground/75"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
