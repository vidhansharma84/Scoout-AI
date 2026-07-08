// GET    /api/v1/cameras/:id  — single camera scoped to current shop
// PATCH  /api/v1/cameras/:id  — update mutable fields
// DELETE /api/v1/cameras/:id  — soft-delete (archived=true)

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

async function ownedCamera(shopId: string, cameraId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.cameras)
    .where(and(eq(schema.cameras.id, cameraId), eq(schema.cameras.shopId, shopId)))
    .limit(1);
  return row ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const cam = await ownedCamera(me.shop.id, id);
  if (!cam) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ camera: cam });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const cam = await ownedCamera(me.shop.id, id);
  if (!cam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Partial<typeof schema.cameras.$inferInsert> = {};
  if ("name" in body) patch.name = clip(body.name, 80);
  if ("location" in body) patch.location = clip(body.location, 120) || null;
  if ("streamUrl" in body) patch.streamUrl = clip(body.streamUrl, 500);
  if ("protocol" in body) {
    const p = clip(body.protocol, 12).toLowerCase();
    if (!["rtsp", "onvif", "hls"].includes(p)) {
      return NextResponse.json({ error: "protocol invalid" }, { status: 400 });
    }
    patch.protocol = p;
  }

  const db = getDb();
  const [updated] = await db
    .update(schema.cameras)
    .set(patch)
    .where(eq(schema.cameras.id, id))
    .returning();
  return NextResponse.json({ camera: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const cam = await ownedCamera(me.shop.id, id);
  if (!cam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  await db
    .update(schema.cameras)
    .set({ archived: true })
    .where(eq(schema.cameras.id, id));
  return NextResponse.json({ ok: true });
}
