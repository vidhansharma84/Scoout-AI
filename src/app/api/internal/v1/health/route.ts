// POST /api/internal/v1/health
// Worker reports the current stream state of a camera. Upserts into
// camera_health and mirrors the human-readable status into cameras.status
// so the portal reflects it without an extra query.

import { NextResponse, after } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { authorizeWorker } from "@/lib/worker-auth";
import { notifyCameraBackOnline } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATE = new Set(["online", "connecting", "degraded", "offline"]);

export async function POST(req: Request) {
  if (!authorizeWorker(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const cameraId = String(body.cameraId ?? "");
  if (!cameraId) return NextResponse.json({ error: "cameraId required" }, { status: 400 });

  const db = getDb();
  const [cam] = await db
    .select()
    .from(schema.cameras)
    .where(eq(schema.cameras.id, cameraId))
    .limit(1);
  if (!cam) return NextResponse.json({ error: "Camera not found" }, { status: 404 });

  const lastFrameAt = body.lastFrameAt ? new Date(String(body.lastFrameAt)) : new Date();
  const fpsActual = Number.isFinite(Number(body.fpsActual)) ? String(body.fpsActual) : null;
  const latencyMs = Number.isFinite(Number(body.latencyMs)) ? Number(body.latencyMs) : null;
  const streamState = VALID_STATE.has(String(body.streamState))
    ? (String(body.streamState) as "online" | "connecting" | "degraded" | "offline")
    : "online";

  await db
    .insert(schema.cameraHealth)
    .values({
      cameraId: cam.id,
      lastFrameAt,
      fpsActual,
      latencyMs,
      streamState,
    })
    .onConflictDoUpdate({
      target: schema.cameraHealth.cameraId,
      set: {
        lastFrameAt,
        fpsActual,
        latencyMs,
        streamState,
        updatedAt: new Date(),
      },
    });

  // A camera we texted "offline" about is back: clear the flag so the next
  // outage gets texted too, and tell the team it's watching again.
  const recovered = streamState === "online" && cam.offlineNotifiedAt !== null;

  await db
    .update(schema.cameras)
    .set({ status: streamState, ...(recovered ? { offlineNotifiedAt: null } : {}) })
    .where(eq(schema.cameras.id, cam.id));

  if (recovered) after(() => notifyCameraBackOnline(cam));

  return NextResponse.json({ ok: true });
}
