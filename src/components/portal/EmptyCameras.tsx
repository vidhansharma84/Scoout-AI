import Link from "next/link";

export default function EmptyCameras({
  variant = "dashboard",
}: {
  variant?: "dashboard" | "list";
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface/40 p-8 sm:p-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-2xl">
        📷
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
        / connect your first camera
      </p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">
        No cameras yet
      </h2>
      <p className="mt-3 text-sm text-foreground/65 max-w-md mx-auto">
        Scoout AI plugs into your existing CCTV — no new hardware required.
        Paste an RTSP URL and it starts watching within a minute.
      </p>
      <div className="mt-7 flex items-center justify-center gap-3">
        <Link
          href="/portal/cameras/new"
          className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
        >
          <span aria-hidden>+</span> Connect a camera
        </Link>
        {variant === "dashboard" && (
          <Link
            href="/portal/watchlist"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-5 py-2.5 text-sm transition-colors"
          >
            Set up watchlist
          </Link>
        )}
      </div>
    </div>
  );
}
