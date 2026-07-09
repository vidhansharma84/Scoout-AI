"use client";

import { useState } from "react";

type Status = "open" | "reviewed" | "dismissed";

export default function AlertDetailActions({
  id,
  status: initial,
}: {
  id: string;
  status: Status;
}) {
  const [status, setStatus] = useState<Status>(initial);
  const [busy, setBusy] = useState(false);

  const patch = async (next: Status) => {
    if (busy || status === next) return;
    setBusy(true);
    const prev = status;
    setStatus(next);
    try {
      const res = await fetch(`/api/v1/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) setStatus(prev);
    } catch {
      setStatus(prev);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/55 mb-2">
        / actions
      </p>
      <Btn
        label="Mark reviewed"
        active={status === "reviewed"}
        onClick={() => patch("reviewed")}
        disabled={busy}
        primary
      />
      <Btn
        label="Dismiss"
        active={status === "dismissed"}
        onClick={() => patch("dismissed")}
        disabled={busy}
      />
      <Btn
        label="Re-open"
        active={status === "open"}
        onClick={() => patch("open")}
        disabled={busy}
      />
    </div>
  );
}

function Btn({
  label,
  active,
  onClick,
  disabled,
  primary,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
}) {
  const activeClasses = primary
    ? "bg-accent text-background border-accent"
    : "bg-surface-2 text-foreground border-border";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
        active
          ? activeClasses
          : "border-border bg-background/40 hover:bg-surface hover:border-accent/40"
      }`}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}
