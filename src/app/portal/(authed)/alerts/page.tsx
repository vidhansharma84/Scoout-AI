import Link from "next/link";
import { ALERTS, severityClasses, timeAgo } from "@/lib/portal-mocks";

const FILTERS = [
  { key: "all", label: "All", count: ALERTS.length },
  { key: "open", label: "Open", count: ALERTS.filter((a) => a.status === "open").length },
  { key: "critical", label: "Critical", count: ALERTS.filter((a) => a.severity === "critical").length },
  { key: "warn", label: "Warnings", count: ALERTS.filter((a) => a.severity === "warn").length },
  { key: "reviewed", label: "Reviewed", count: ALERTS.filter((a) => a.status === "reviewed").length },
  { key: "dismissed", label: "Dismissed", count: ALERTS.filter((a) => a.status === "dismissed").length },
];

export default function AlertsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / alerts
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
            Alert feed
          </h1>
          <p className="mt-1 text-foreground/60 text-sm">
            Everything the AI has flagged across your cameras.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-2 text-sm transition-colors">
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 hover:bg-surface px-4 py-2 text-sm transition-colors">
            Mark all reviewed
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f, i) => (
          <button
            key={f.key}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors flex items-center gap-2 ${
              i === 0
                ? "bg-accent/15 text-foreground border border-accent/30"
                : "border border-border bg-surface/60 text-foreground/70 hover:bg-surface"
            }`}
          >
            {f.label}
            <span
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                i === 0 ? "bg-accent text-background" : "bg-surface-2 text-foreground/55"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden divide-y divide-border">
        {ALERTS.map((a) => {
          const sc = severityClasses(a.severity);
          return (
            <Link
              key={a.id}
              href={`/portal/cameras/${a.cameraId}`}
              className="block hover:bg-surface-2/30 transition-colors"
            >
              <div className="flex items-start gap-4 px-4 sm:px-5 py-4">
                <div
                  className={`shrink-0 grid h-11 w-11 place-items-center rounded-xl border ${sc.border} ${sc.bg}`}
                >
                  <span aria-hidden className="text-base">
                    {sc.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${sc.text}`}>
                      {a.type}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/45 uppercase tracking-wider">
                      {a.cameraLabel}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/45">
                      · {timeAgo(a.at)}
                    </span>
                    <span
                      className={`ml-auto rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                        a.status === "open"
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "bg-surface-2 text-foreground/55"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed">
                    {a.summary}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors"
                    >
                      Open clip
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/65"
                    >
                      Mark reviewed
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/55"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
