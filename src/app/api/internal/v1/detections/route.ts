// POST /api/internal/v1/detections
// Worker reports a raw detection. We store it and return which rules would
// like to see it — the worker then picks which ones actually match (Week 7
// this is the LLM's job; Week 3 the mock worker just picks randomly).

import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { authorizeWorker } from "@/lib/worker-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const workerId = String(body.workerId ?? "").slice(0, 64) || "unknown";
  const cameraId = String(body.cameraId ?? "");
  const cls = String(body.class ?? "").slice(0, 64);
  const conf = Number(body.confidence);
  const at = body.at ? new Date(String(body.at)) : new Date();

  if (!cameraId || !cls || !Number.isFinite(conf)) {
    return NextResponse.json(
      { error: "cameraId, class, confidence required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [cam] = await db
    .select({ id: schema.cameras.id, shopId: schema.cameras.shopId })
    .from(schema.cameras)
    .where(and(eq(schema.cameras.id, cameraId), eq(schema.cameras.archived, false)))
    .limit(1);
  if (!cam) {
    return NextResponse.json({ error: "Camera not found" }, { status: 404 });
  }

  const [row] = await db
    .insert(schema.detections)
    .values({
      cameraId: cam.id,
      workerId,
      at,
      class: cls,
      confidence: String(conf),
      bboxJson:
        typeof body.bboxJson === "object" && body.bboxJson !== null
          ? JSON.stringify(body.bboxJson)
          : null,
      frameHash: typeof body.frameHash === "string" ? body.frameHash : null,
    })
    .returning();

  // Which rules on this shop should be checked against this detection?
  const rules = await db
    .select({ id: schema.rules.id, cameras: schema.rules.cameras, prompt: schema.rules.prompt })
    .from(schema.rules)
    .where(and(eq(schema.rules.shopId, cam.shopId), eq(schema.rules.active, true)));
  const applicable = rules.filter(
    (r) => r.cameras.length === 0 || r.cameras.includes(cam.id),
  );

  return NextResponse.json({
    detectionId: row.id,
    applicableRules: applicable.map((r) => ({ id: r.id, prompt: r.prompt })),
  });
  void inArray;
}
