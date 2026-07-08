// GET /api/internal/v1/cameras/assigned
// Called by inference workers to fetch the cameras they should process,
// along with every active rule for each. MVP: return all non-archived cameras
// across all shops. Post-MVP: filter by workerId (each shard owns a slice).

import { NextResponse } from "next/server";
import { and, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { authorizeWorker } from "@/lib/worker-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeWorker(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const cameras = await db
    .select({
      id: schema.cameras.id,
      shopId: schema.cameras.shopId,
      name: schema.cameras.name,
      location: schema.cameras.location,
      protocol: schema.cameras.protocol,
      streamUrl: schema.cameras.streamUrl,
      inferenceProfile: schema.cameras.inferenceProfile,
    })
    .from(schema.cameras)
    .where(eq(schema.cameras.archived, false));

  if (cameras.length === 0) {
    return NextResponse.json({ cameras: [] });
  }

  const shopIds = [...new Set(cameras.map((c) => c.shopId))];
  const rules = await db
    .select({
      id: schema.rules.id,
      shopId: schema.rules.shopId,
      prompt: schema.rules.prompt,
      cameras: schema.rules.cameras,
    })
    .from(schema.rules)
    .where(and(eq(schema.rules.active, true), inArray(schema.rules.shopId, shopIds)));

  // Attach each rule to every applicable camera.
  const enriched = cameras.map((cam) => {
    const applicable = rules.filter(
      (r) =>
        r.shopId === cam.shopId &&
        (r.cameras.length === 0 || r.cameras.includes(cam.id)),
    );
    return {
      id: cam.id,
      shopId: cam.shopId,
      name: cam.name,
      location: cam.location,
      protocol: cam.protocol,
      streamUrl: cam.streamUrl,
      inferenceProfile: cam.inferenceProfile ?? "balanced",
      rules: applicable.map((r) => ({ id: r.id, prompt: r.prompt })),
    };
  });

  return NextResponse.json({ cameras: enriched });
  // silence unused import warning
  void or;
}
