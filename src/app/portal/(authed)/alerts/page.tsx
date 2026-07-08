"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  type AlertView,
  type AlertViewSeverity,
  type AlertViewStatus,
  severityClasses,
  timeAgo,
} from "@/lib/alert-view";

type Counts = {
  total: number;
  open: number;
  reviewed: number;
  dismissed: number;
  critical: number;
  warn: number;
};

type Filter = { key: string; label: string; qs?: string; count: (c: Counts) => number };

const FILTERS: Filter[] = [
  { key: "all", label: "All", count: (c) => c.total },
  { key: "open", label: "Open", qs: "status=open", count: (c) => c.open },
  { key: "critical", label: "Critical", qs: "severity=critical", count: (c) => c.critical },
  { key: "warn", label: "Warnings", qs: "severity=warn", count: (c) => c.warn },
  { key: "reviewed", label: "Reviewed", qs: "status=reviewed", count: (c) => c.reviewed },
  { key: "dismissed", label: "Dismissed", qs: "status=dismissed", count: (c) => c.dismissed },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0, open: 0, reviewed: 0, dismissed: 0, critical: 0, warn: 0,
  });
  const [filter, setFilter] = useState<Filter>(FILTERS[0]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: Filter) => {
    setLoading(true);
    const qs = f.qs ? `?${f.qs}` : "";
    const r = await fetch(`/api/v1/alerts${qs}`);
    if (r.ok) {
      const data = await r.json();
      setAlerts(data.alerts ?? []);
      setCounts(data.counts ?? counts);
    }
    setLoading(false);
  }, [counts]);

  useEffect(() => {
    load(filter);
    const poll = setInterval(() => load(filter), 15_000);
    return () => clearInterval(poll);
  }, [filter, load]);

  const mutate = async (id: string, status: AlertViewStatus) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch(`/api/v1/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load(filter);
  };

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
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = filter.key === f.key;
          const count = f.count(counts);
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors flex items-center gap-2 ${
                active
                  ? "bg-accent/15 text-foreground border border-accent/30"
                  : "border border-border bg-surface/60 text-foreground/70 hover:bg-surface"
              }`}
            >
              {f.label}
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                  active ? "bg-accent text-background" : "bg-surface-2 text-foreground/55"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && alerts.length === 0 ? (
        <p className="text-sm text-foreground/50">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/40 p-14 text-center">
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            {counts.total === 0
              ? "No alerts yet. Add cameras and watchlist rules — anything the AI flags will show up here in real time."
              : "No alerts match this filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden divide-y divide-border">
          {alerts.map((a) => (
            <AlertRow key={a.id} a={a} onMutate={mutate} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  a,
  onMutate,
}: {
  a: AlertView;
  onMutate: (id: string, status: AlertViewStatus) => void;
}) {
  const sc = severityClasses(a.severity as AlertViewSeverity);
  const href = a.cameraId ? `/portal/cameras/${a.cameraId}` : "#";
  return (
    <div className="flex items-start gap-4 px-4 sm:px-5 py-4 hover:bg-surface-2/30 transition-colors">
      <div
        className={`shrink-0 grid h-11 w-11 place-items-center rounded-xl border ${sc.border} ${sc.bg}`}
      >
        <span aria-hidden className="text-base">
          {sc.icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${sc.text}`}>{a.type}</span>
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
          <Link
            href={href}
            className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors"
          >
            Open camera
          </Link>
          {a.status !== "reviewed" && (
            <button
              onClick={() => onMutate(a.id, "reviewed")}
              className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/70"
            >
              Mark reviewed
            </button>
          )}
          {a.status !== "dismissed" && (
            <button
              onClick={() => onMutate(a.id, "dismissed")}
              className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/55"
            >
              Dismiss
            </button>
          )}
          {a.status !== "open" && (
            <button
              onClick={() => onMutate(a.id, "open")}
              className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/55"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
