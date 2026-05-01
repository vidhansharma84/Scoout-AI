import Logo from "./Logo";

const socials = [
  { name: "Facebook", href: "#" },
  { name: "Twitter / X", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "TikTok", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#top" className="inline-flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="font-display text-xl font-semibold">
                Scoout<span className="text-accent">.</span>AI
              </span>
            </a>
            <p className="mt-4 max-w-sm text-foreground/65">
              Surveillance intelligence powered by AI — turning your existing
              CCTV cameras into smart detectors and scanners.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/45">
              Product
            </p>
            <ul className="mt-4 space-y-2 text-foreground/80">
              <li><a href="#how" className="hover:text-foreground">How it works</a></li>
              <li><a href="#trusted" className="hover:text-foreground">Trusted by</a></li>
              <li><a href="#alerts" className="hover:text-foreground">Alerts</a></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/45">
              Socials
            </p>
            <ul className="mt-4 space-y-2 text-foreground/80">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} className="hover:text-foreground">{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <BigMark />

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground/50 font-mono uppercase tracking-[0.2em]">
          <span>© 2026 Scoout AI. All rights reserved.</span>
          <span>Built for businesses that don&apos;t sleep.</span>
        </div>
      </div>
    </footer>
  );
}

function BigMark() {
  return (
    <div className="mt-14 select-none overflow-hidden">
      <p className="font-display font-semibold leading-none tracking-tight text-[18vw] sm:text-[16vw] bg-gradient-to-tr from-foreground/10 via-foreground/30 to-foreground/5 bg-clip-text text-transparent">
        SCOOUT.AI
      </p>
    </div>
  );
}
