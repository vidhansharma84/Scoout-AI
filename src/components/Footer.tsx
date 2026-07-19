import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <a href="#top" className="inline-flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-display text-xl font-semibold">
              Scoout<span className="text-accent">.</span>AI
            </span>
          </a>
          <p className="max-w-sm text-sm text-foreground/60 sm:text-right">
            Surveillance intelligence powered by AI — turning your existing
            CCTV cameras into smart detectors and scanners.
          </p>
        </div>

        <BigMark />

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground/50 font-mono uppercase tracking-[0.2em]">
          <span>© 2026 Scoout AI. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BigMark() {
  return (
    <div className="mt-10 select-none overflow-hidden">
      <p className="font-display font-semibold leading-none tracking-tight text-[18vw] sm:text-[16vw] bg-gradient-to-tr from-foreground/10 via-foreground/30 to-foreground/5 bg-clip-text text-transparent">
        SCOOUT.AI
      </p>
    </div>
  );
}
