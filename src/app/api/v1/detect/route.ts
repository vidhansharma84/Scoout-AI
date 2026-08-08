// POST /api/v1/detect — a camera node reports a fire/smoke candidate.
//
// Unlike /api/internal/v1/*, this is authenticated with the ordinary portal JWT
// rather than the shared WORKER_TOKEN, because the caller is the user's own
// phone running the Scoout AI app. A shared worker secret can't ship inside an
// installable app; the user's own session can.
//
// Body: { cameraId, candidate: "fire"|"smoke", score: number, frames: string[] }
//   frames — 1..3 base64 JPEGs, oldest first, roughly 1s apart.
//
// The device filter is deliberately trigger-happy. Everything here exists to
// decide whether the candidate deserves to wake somebody up.

import { NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { confirmFireCandidate } from "@/lib/fire-vision";
import { newKey, writeClip } from "@/lib/clip-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FRAMES = 3;
const MAX_FRAME_BYTES = 1_500_000; // ~1.5MB per JPEG, decoded
const COOLDOWN_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const cameraId = String(body.cameraId ?? "");
  const candidate = String(body.candidate ?? "");
  const score = Number(body.score ?? 0);
  const frames = Array.isArray(body.frames)
    ? (body.frames as unknown[]).slice(0, MAX_FRAMES).map((f) => String(f ?? ""))
    : [];

  if (!cameraId) {
    return NextResponse.json({ error: "cameraId required" }, { status: 400 });
  }
  if (candidate !== "fire" && candidate !== "smoke") {
    return NextResponse.json(
      { error: 'candidate must be "fire" or "smoke"' },
      { status: 400 },
    );
  }
  if (frames.length === 0) {
    return NextResponse.json({ error: "at least one frame required" }, { status: 400 });
  }

  const db = getDb();

  // Tenancy: the camera must belong to the caller's shop. Never trust cameraId.
  const [cam] = await db
    .select()
    .from(schema.cameras)
    .where(and(eq(schema.cameras.id, cameraId), eq(schema.cameras.shopId, me.shop.id)))
    .limit(1);
  if (!cam) return NextResponse.json({ error: "Camera not found" }, { status: 404 });

  // Decode before spending anything on the model.
  let buffers: Buffer[];
  try {
    buffers = frames.map((f) => Buffer.from(stripDataUrl(f), "base64"));
  } catch {
    return NextResponse.json({ error: "frames must be base64" }, { status: 400 });
  }
  if (buffers.some((b) => b.length === 0 || b.length > MAX_FRAME_BYTES)) {
    return NextResponse.json({ error: "frame too large or empty" }, { status: 413 });
  }

  // The device proved it is alive by getting here.
  if (cam.status !== "online") {
    await db
      .update(schema.cameras)
      .set({ status: "online" })
      .where(eq(schema.cameras.id, cam.id));
  }

  // A fire keeps burning, and the filter keeps firing. One alert per camera per
  // cooldown window — re-alerting every few seconds is how people learn to
  // swipe the notification away without reading it.
  const [recent] = await db
    .select({ id: schema.alerts.id })
    .from(schema.alerts)
    .where(
      and(
        eq(schema.alerts.cameraId, cam.id),
        eq(schema.alerts.severity, "critical"),
        eq(schema.alerts.status, "open"),
        gte(schema.alerts.at, new Date(Date.now() - COOLDOWN_MS)),
      ),
    )
    .orderBy(desc(schema.alerts.at))
    .limit(1);
  if (recent) {
    return NextResponse.json({
      status: "suppressed",
      reason: "an open critical alert for this camera is less than 5 minutes old",
      alertId: recent.id,
    });
  }

  const cameraLabel = `${cam.name}${cam.location ? " · " + cam.location : ""}`;

  let verdict;
  try {
    verdict = await confirmFireCandidate({
      frames: frames.map(stripDataUrl),
      candidate: candidate as "fire" | "smoke",
      localScore: Number.isFinite(score) ? score : 0,
      cameraLabel,
    });
  } catch (e) {
    console.error("[detect] vision check failed:", e);
    return NextResponse.json({ error: "Vision check failed" }, { status: 502 });
  }

  if (verdict.verdict === "none") {
    // Deliberately no DB write. Rejected candidates are noise, and noise that
    // gets stored eventually gets displayed.
    return NextResponse.json({
      status: "rejected",
      reasoning: verdict.reasoning,
      cause: verdict.falsePositiveCause,
    });
  }

  // Confirmed. Persist the middle frame as the thumbnail — the device sends
  // oldest-first, so the middle one usually frames the event best.
  const thumbBuf = buffers[Math.floor(buffers.length / 2)];
  const thumbnailKey = newKey("jpg");
  try {
    await writeClip(thumbnailKey, thumbBuf);
  } catch (e) {
    console.error("[detect] thumbnail write failed:", e);
  }

  const at = new Date();

  const [detection] = await db
    .insert(schema.detections)
    .values({
      cameraId: cam.id,
      workerId: `phone:${me.user.id}`,
      at,
      class: verdict.verdict,
      confidence: String(verdict.confidence),
      frameHash: null,
      thumbnailKey,
    })
    .returning();

  // Attach the shop's fire rule if one exists, so the alert links back to the
  // thing the owner asked to be watched for. Optional — alerts.ruleId is nullable.
  const [rule] = await db
    .select({ id: schema.rules.id })
    .from(schema.rules)
    .where(and(eq(schema.rules.shopId, cam.shopId), eq(schema.rules.active, true)))
    .orderBy(desc(schema.rules.createdAt))
    .limit(1);

  const type = verdict.verdict === "fire" ? "Fire detected" : "Smoke pattern";
  const hhmm = at.toISOString().slice(11, 16);

  const [alert] = await db
    .insert(schema.alerts)
    .values({
      shopId: cam.shopId,
      cameraId: cam.id,
      ruleId: rule?.id ?? null,
      detectionId: detection.id,
      type,
      severity: "critical",
      summary: `${cameraLabel} — ${verdict.verdict} detected at ${hhmm} UTC.`,
      reasoning: verdict.reasoning,
      thumbnailKey,
      at,
    })
    .returning();

  return NextResponse.json({
    status: "confirmed",
    alertId: alert.id,
    detectionId: detection.id,
    verdict: verdict.verdict,
    confidence: verdict.confidence,
    reasoning: verdict.reasoning,
  });
}

function stripDataUrl(s: string): string {
  const i = s.indexOf("base64,");
  return i === -1 ? s : s.slice(i + "base64,".length);
}
