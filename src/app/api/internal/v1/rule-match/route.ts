// POST /api/internal/v1/rule-match
// Worker confirms a detection matches a rule → we materialize an alert.
// Body: { detectionId, ruleId, confidence, reasoning?, type?, severity? }

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { authorizeWorker } from "@/lib/worker-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

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

  const detectionId = String(body.detectionId ?? "");
  const ruleId = String(body.ruleId ?? "");
  if (!detectionId || !ruleId) {
    return NextResponse.json({ error: "detectionId, ruleId required" }, { status: 400 });
  }

  const db = getDb();

  // Load detection + camera + rule together and verify same shop.
  const [det] = await db
    .select({
      id: schema.detections.id,
      cameraId: schema.detections.cameraId,
      class: schema.detections.class,
      at: schema.detections.at,
      thumbnailKey: schema.detections.thumbnailKey,
    })
    .from(schema.detections)
    .where(eq(schema.detections.id, detectionId))
    .limit(1);
  if (!det) return NextResponse.json({ error: "Detection not found" }, { status: 404 });

  const [cam] = await db
    .select({
      id: schema.cameras.id,
      shopId: schema.cameras.shopId,
      name: schema.cameras.name,
      location: schema.cameras.location,
    })
    .from(schema.cameras)
    .where(eq(schema.cameras.id, det.cameraId))
    .limit(1);
  if (!cam) return NextResponse.json({ error: "Camera missing" }, { status: 404 });

  const [rule] = await db
    .select()
    .from(schema.rules)
    .where(and(eq(schema.rules.id, ruleId), eq(schema.rules.shopId, cam.shopId)))
    .limit(1);
  if (!rule) return NextResponse.json({ error: "Rule not owned" }, { status: 404 });

  const type = clip(body.type, 80) || defaultTypeFor(det.class);
  const severity = clip(body.severity, 16) || defaultSeverityFor(det.class);
  const reasoning = clip(body.reasoning, 1000) || null;
  const summary =
    clip(body.summary, 800) ||
    defaultSummary({
      cameraLabel: `${cam.name}${cam.location ? " · " + cam.location : ""}`,
      at: det.at,
      cls: det.class,
      prompt: rule.prompt,
    });

  const [alert] = await db
    .insert(schema.alerts)
    .values({
      shopId: cam.shopId,
      cameraId: cam.id,
      ruleId: rule.id,
      detectionId: det.id,
      type,
      severity: normalizeSeverity(severity),
      summary,
      reasoning,
      thumbnailKey: det.thumbnailKey,
      at: det.at,
    })
    .returning();

  return NextResponse.json({ alertId: alert.id });
}

function normalizeSeverity(s: string): "critical" | "warn" | "info" {
  if (s === "critical" || s === "warn" || s === "info") return s;
  return "warn";
}

function defaultTypeFor(cls: string): string {
  switch (cls) {
    case "fire":
      return "Fire detected";
    case "smoke":
      return "Smoke pattern";
    case "person":
      return "Motion after-hours";
    case "motion":
      return "Motion detected";
    case "loitering":
      return "Loitering";
    case "crowd":
      return "Crowd buildup";
    default:
      return cls.charAt(0).toUpperCase() + cls.slice(1);
  }
}

function defaultSeverityFor(cls: string): "critical" | "warn" | "info" {
  if (cls === "fire" || cls === "smoke") return "critical";
  if (cls === "person" || cls === "motion" || cls === "loitering") return "warn";
  return "info";
}

function defaultSummary(args: {
  cameraLabel: string;
  at: Date;
  cls: string;
  prompt: string;
}): string {
  const hhmm = args.at.toISOString().slice(11, 16);
  return `${args.cameraLabel} — ${args.cls} detected at ${hhmm} UTC. Rule: "${args.prompt.slice(0, 120)}".`;
}
