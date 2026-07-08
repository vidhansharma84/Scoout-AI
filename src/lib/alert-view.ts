// Helpers for the portal to consume alert rows without pulling in mock types.

export type AlertViewSeverity = "critical" | "warn" | "info";
export type AlertViewStatus = "open" | "reviewed" | "dismissed";

export type AlertView = {
  id: string;
  cameraId: string | null;
  cameraLabel: string;
  type: string;
  severity: AlertViewSeverity;
  summary: string;
  status: AlertViewStatus;
  at: string;
  reasoning?: string | null;
};

export function severityClasses(s: AlertViewSeverity) {
  if (s === "critical")
    return {
      border: "border-red-500/40",
      bg: "bg-red-500/10",
      text: "text-red-300",
      icon: "🔥",
    };
  if (s === "warn")
    return {
      border: "border-accent/40",
      bg: "bg-accent/10",
      text: "text-accent",
      icon: "⚠️",
    };
  return {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    text: "text-emerald-300",
    icon: "ℹ️",
  };
}

export function timeAgo(iso: string | Date): string {
  const t = iso instanceof Date ? iso.getTime() : new Date(iso).getTime();
  const ms = Date.now() - t;
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
