// GET   /api/v1/alerts/:id  — single alert (shop-scoped)
// PATCH /api/v1/alerts/:id  — { status: reviewed | dismissed | open, reason? }

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { signDownloadUrl } from "@/lib/clip-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();
const STATUS = new Set(["open", "reviewed", "dismissed"]);

async function loadOwned(shopId: string, alertId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.alerts)
    .where(and(eq(schema.alerts.id, alertId), eq(schema.alerts.shopId, shopId)))
    .limit(1);
  return row ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const alert = await loadOwned(me.shop.id, id);
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Include shop-scoped camera label + a signed clip/thumbnail URL if we have keys.
  const db = getDb();
  let cameraLabel = "Unknown camera";
  if (alert.cameraId) {
    const [cam] = await db
      .select({ name: schema.cameras.name, location: schema.cameras.location })
      .from(schema.cameras)
      .where(eq(schema.cameras.id, alert.cameraId))
      .limit(1);
    if (cam) {
      cameraLabel = cam.name + (cam.location ? ` · ${cam.location}` : "");
    }
  }
  const clipUrl = alert.clipKey ? await signDownloadUrl(alert.clipKey, 3600) : null;
  const thumbnailUrl = alert.thumbnailKey
    ? await signDownloadUrl(alert.thumbnailKey, 3600)
    : null;

  return NextResponse.json({
    alert: { ...alert, cameraLabel, clipUrl, thumbnailUrl },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const alert = await loadOwned(me.shop.id, id);
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = String(body.status ?? "").trim();
  if (!STATUS.has(status)) {
    return NextResponse.json(
      { error: "status must be open | reviewed | dismissed" },
      { status: 400 },
    );
  }

  const patch: Partial<typeof schema.alerts.$inferInsert> = { status };
  if (status === "reviewed") {
    patch.reviewedBy = me.user.id;
    patch.reviewedAt = new Date();
  } else if (status === "dismissed") {
    patch.reviewedBy = me.user.id;
    patch.reviewedAt = new Date();
    patch.dismissedReason = clip(body.reason, 200) || null;
  } else {
    patch.reviewedBy = null;
    patch.reviewedAt = null;
    patch.dismissedReason = null;
  }

  const db = getDb();
  const [updated] = await db
    .update(schema.alerts)
    .set(patch)
    .where(eq(schema.alerts.id, id))
    .returning();
  return NextResponse.json({ alert: updated });
}
