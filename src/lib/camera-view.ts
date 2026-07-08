// Adapter: DB camera row → shape the existing portal UI (CameraTile,
// CameraLive) understands. Lets us swap mock data for real DB rows without
// rewriting the widgets.

import type { Camera as DbCamera } from "@/db/schema";
import { type Camera as UiCamera } from "@/lib/portal-mocks";

export function toCameraViewModel(
  row: DbCamera,
  extras: { detections24h?: number; lastEventAt?: Date | null } = {},
): UiCamera {
  const status =
    row.status === "online" || row.status === "offline" || row.status === "degraded"
      ? (row.status as UiCamera["status"])
      : "online";
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? "",
    status,
    resolution: row.resolution ?? "1920×1080",
    fps: row.fpsTarget ?? 15,
    lastEventAt: (extras.lastEventAt ?? row.createdAt).toISOString(),
    detections: extras.detections24h ?? 0,
    hue: row.hue ?? 30,
  };
}

export function pickHueFromString(seed: string): number {
  // deterministic mock hue from camera name so tiles don't all look identical.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}
