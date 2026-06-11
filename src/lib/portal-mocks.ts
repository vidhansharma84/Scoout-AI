// Mock data for the Scoout AI surveillance portal UI.
// Pure UI demo — no DB, no API. Used only by /portal/* pages.

export type CameraStatus = "online" | "offline" | "degraded";

export type Camera = {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  resolution: string;
  fps: number;
  lastEventAt: string; // ISO
  detections: number; // last 24h
  // visual seed for the mock thumbnail gradient
  hue: number;
};

export const SHOP = {
  name: "Kojo's Provisions",
  city: "Accra, Ghana",
  plan: "Starter — 6 cameras",
};

export const USER = {
  name: "Kojo Mensah",
  email: "kojo@kojosprovisions.com",
  initials: "KM",
  role: "Owner",
};

export const CAMERAS: Camera[] = [
  {
    id: "cam-01",
    name: "Cam-01",
    location: "Front entrance",
    status: "online",
    resolution: "1920×1080",
    fps: 30,
    lastEventAt: "2026-06-11T02:46:00Z",
    detections: 142,
    hue: 28,
  },
  {
    id: "cam-02",
    name: "Cam-02",
    location: "Aisle 1 — beverages",
    status: "online",
    resolution: "1920×1080",
    fps: 24,
    lastEventAt: "2026-06-11T03:11:00Z",
    detections: 87,
    hue: 200,
  },
  {
    id: "cam-03",
    name: "Cam-03",
    location: "Storage room",
    status: "online",
    resolution: "1280×720",
    fps: 15,
    lastEventAt: "2026-06-11T02:14:00Z",
    detections: 24,
    hue: 12,
  },
  {
    id: "cam-04",
    name: "Cam-04",
    location: "Cash counter",
    status: "online",
    resolution: "1920×1080",
    fps: 30,
    lastEventAt: "2026-06-11T03:42:00Z",
    detections: 311,
    hue: 50,
  },
  {
    id: "cam-05",
    name: "Cam-05",
    location: "Back alley",
    status: "offline",
    resolution: "1920×1080",
    fps: 30,
    lastEventAt: "2026-06-10T18:02:00Z",
    detections: 0,
    hue: 240,
  },
  {
    id: "cam-06",
    name: "Cam-06",
    location: "Aisle 3 — staples",
    status: "online",
    resolution: "1280×720",
    fps: 24,
    lastEventAt: "2026-06-11T03:38:00Z",
    detections: 64,
    hue: 160,
  },
];

export type AlertSeverity = "critical" | "warn" | "info";

export type Alert = {
  id: string;
  cameraId: string;
  cameraLabel: string;
  type: string;
  severity: AlertSeverity;
  at: string; // ISO
  summary: string;
  status: "open" | "reviewed" | "dismissed";
};

export const ALERTS: Alert[] = [
  {
    id: "alt-9012",
    cameraId: "cam-04",
    cameraLabel: "Cam-04 · Cash counter",
    type: "Fire detected",
    severity: "critical",
    at: "2026-06-11T03:42:00Z",
    summary:
      "Smoke pattern + thermal signature consistent with early-stage fire. 4.2s ignition cue near checkout. Phone call triggered.",
    status: "open",
  },
  {
    id: "alt-9011",
    cameraId: "cam-03",
    cameraLabel: "Cam-03 · Storage room",
    type: "Motion after-hours",
    severity: "warn",
    at: "2026-06-11T02:14:00Z",
    summary:
      "Person entered storage at 02:14 AM. Removed items from top shelf. Left 02:16 AM. No staff scan recorded.",
    status: "open",
  },
  {
    id: "alt-9010",
    cameraId: "cam-01",
    cameraLabel: "Cam-01 · Front entrance",
    type: "Loitering",
    severity: "warn",
    at: "2026-06-11T01:08:00Z",
    summary:
      "Two persons stationary at entrance for 6 min 24 sec between 01:01 and 01:08 AM.",
    status: "reviewed",
  },
  {
    id: "alt-9009",
    cameraId: "cam-05",
    cameraLabel: "Cam-05 · Back alley",
    type: "Camera offline",
    severity: "warn",
    at: "2026-06-10T18:02:00Z",
    summary:
      "Stream lost at 18:02 yesterday. Last frame normal. Likely power or cable issue.",
    status: "open",
  },
  {
    id: "alt-9008",
    cameraId: "cam-04",
    cameraLabel: "Cam-04 · Cash counter",
    type: "Smoke pattern",
    severity: "warn",
    at: "2026-06-10T15:31:00Z",
    summary:
      "Smoke-like pattern detected. Confidence 0.68. Dismissed by reviewer — steam from kettle.",
    status: "dismissed",
  },
  {
    id: "alt-9007",
    cameraId: "cam-02",
    cameraLabel: "Cam-02 · Aisle 1",
    type: "Crowd buildup",
    severity: "info",
    at: "2026-06-10T12:14:00Z",
    summary: "8+ people in aisle 1 between 12:11 and 12:14. Promo display worked.",
    status: "reviewed",
  },
  {
    id: "alt-9006",
    cameraId: "cam-06",
    cameraLabel: "Cam-06 · Aisle 3",
    type: "Forklift in aisle",
    severity: "info",
    at: "2026-06-10T10:02:00Z",
    summary: "Restocking activity. Forklift detected for 4 min.",
    status: "reviewed",
  },
];

export type Rule = {
  id: string;
  prompt: string;
  active: boolean;
  cameras: string[]; // camera ids
  matchesLast7d: number;
};

export const RULES: Rule[] = [
  {
    id: "rule-1",
    prompt: "Alert me when anyone enters the storage room after 10pm",
    active: true,
    cameras: ["cam-03"],
    matchesLast7d: 3,
  },
  {
    id: "rule-2",
    prompt: "Watch for smoke or fire near the gas cylinders",
    active: true,
    cameras: ["cam-04", "cam-06"],
    matchesLast7d: 1,
  },
  {
    id: "rule-3",
    prompt: "Flag any person loitering by the cash counter for more than 2 minutes",
    active: true,
    cameras: ["cam-04"],
    matchesLast7d: 7,
  },
  {
    id: "rule-4",
    prompt: "Tell me if shelves in aisle 1 stay empty for more than an hour",
    active: false,
    cameras: ["cam-02"],
    matchesLast7d: 0,
  },
];

export const STATS = {
  camerasOnline: 5,
  camerasTotal: 6,
  alertsOpen: 3,
  alertsLast24h: 12,
  hoursMonitoredToday: 30.4,
  modelLatencyMs: 38,
};

export function statusColor(s: CameraStatus): string {
  return s === "online" ? "rgb(0,230,180)" : s === "degraded" ? "rgb(255,170,40)" : "rgb(255,80,60)";
}

export function severityClasses(s: AlertSeverity): {
  border: string;
  bg: string;
  text: string;
  icon: string;
} {
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

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
