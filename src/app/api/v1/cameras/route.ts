// GET  /api/v1/cameras         — list the current shop's cameras
// POST /api/v1/cameras         — create a camera in the current shop

import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { pickHueFromString } from "@/lib/camera-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.cameras)
    .where(
      and(
        eq(schema.cameras.shopId, me.shop.id),
        eq(schema.cameras.archived, false),
      ),
    )
    .orderBy(desc(schema.cameras.createdAt));

  return NextResponse.json({ cameras: rows });
}

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clip(body.name, 80);
  const location = clip(body.location, 120) || null;
  const protocol = clip(body.protocol, 12).toLowerCase() || "rtsp";
  const streamUrl = clip(body.streamUrl, 500);

  if (!name || !streamUrl) {
    return NextResponse.json(
      { error: "name and streamUrl are required" },
      { status: 400 },
    );
  }
  if (!["rtsp", "onvif", "hls"].includes(protocol)) {
    return NextResponse.json(
      { error: "protocol must be one of rtsp, onvif, hls" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(schema.cameras)
    .values({
      shopId: me.shop.id,
      name,
      location,
      protocol,
      streamUrl,
      hue: pickHueFromString(name),
      status: "connecting",
    })
    .returning();

  return NextResponse.json({ camera: row }, { status: 201 });
}
