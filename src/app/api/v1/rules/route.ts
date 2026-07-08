// GET  /api/v1/rules   — list watchlist rules for the current shop
// POST /api/v1/rules   — create a new rule

import { NextResponse } from "next/server";
import { desc, eq, inArray, and } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.rules)
    .where(eq(schema.rules.shopId, me.shop.id))
    .orderBy(desc(schema.rules.createdAt));
  return NextResponse.json({ rules: rows });
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

  const prompt = clip(body.prompt, 500);
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const rawCameras = Array.isArray(body.cameras) ? (body.cameras as unknown[]) : [];
  const cameraIds = rawCameras
    .map((c) => (typeof c === "string" ? c : ""))
    .filter(Boolean);

  const db = getDb();
  // Validate every camera belongs to this shop.
  if (cameraIds.length) {
    const owned = await db
      .select({ id: schema.cameras.id })
      .from(schema.cameras)
      .where(
        and(
          eq(schema.cameras.shopId, me.shop.id),
          inArray(schema.cameras.id, cameraIds),
        ),
      );
    if (owned.length !== cameraIds.length) {
      return NextResponse.json(
        { error: "one or more cameras don't belong to your shop" },
        { status: 400 },
      );
    }
  }

  const [row] = await db
    .insert(schema.rules)
    .values({
      shopId: me.shop.id,
      prompt,
      cameras: cameraIds,
      active: true,
      createdBy: me.user.id,
    })
    .returning();
  return NextResponse.json({ rule: row }, { status: 201 });
}
