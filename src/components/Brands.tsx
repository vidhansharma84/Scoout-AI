"use client";

import Marquee from "./Marquee";

const cctvBrands = [
  "HIKVISION",
  "DAHUA",
  "AXIS",
  "BOSCH",
  "CP PLUS",
  "UNIVIEW",
  "AVIGILON",
  "REOLINK",
  "TIANDY",
  "HONEYWELL",
  "SAMSUNG WISENET",
  "PANASONIC",
];

export default function Brands() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              / works with what you have
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-semibold leading-[1.05] text-balance">
              Works with{" "}
              <span className="bg-gradient-to-tr from-accent to-accent-2 bg-clip-text text-transparent">
                any camera system.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-foreground/70 text-base sm:text-lg max-w-xl text-balance">
              No new hardware required. Scoout AI plugs into your existing
              cameras and NVR/VMS — regardless of brand, age, or model.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 sm:mt-16">
        <Marquee duration={45}>
          {cctvBrands.map((b) => (
            <BrandPill key={b} name={b} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function BrandPill({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-surface/40 px-6 py-3 text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors">
      <span className="h-2 w-2 rounded-full bg-foreground/30" />
      <span className="font-display font-semibold tracking-tight text-lg sm:text-xl whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}
