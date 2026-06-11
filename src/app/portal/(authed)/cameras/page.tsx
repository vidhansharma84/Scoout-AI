import Link from "next/link";
import CameraTile from "@/components/portal/CameraTile";
import { CAMERAS } from "@/lib/portal-mocks";

export default function CamerasListPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / cameras
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
            All cameras
          </h1>
          <p className="mt-1 text-foreground/60 text-sm">
            {CAMERAS.length} connected · {CAMERAS.filter((c) => c.status === "online").length} live
          </p>
        </div>
        <Link
          href="/portal/cameras/new"
          className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
        >
          <span aria-hidden>+</span> Add camera
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAMERAS.map((c) => (
          <CameraTile key={c.id} camera={c} />
        ))}
      </div>
    </div>
  );
}
