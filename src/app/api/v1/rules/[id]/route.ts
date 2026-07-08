// PATCH  /api/v1/rules/:id   — toggle active, edit prompt, edit cameras
// DELETE /api/v1/rules/:id   — hard-delete rule (they're cheap to recreate)

import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

async function ownedRule(shopId: string, ruleId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.rules)
    .where(and(eq(schema.rules.id, ruleId), eq(schema.rules.shopId, shopId)))
    .limit(1);
  return row ?? null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const rule = await ownedRule(me.shop.id, id);
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Partial<typeof schema.rules.$inferInsert> = {};
  if ("active" in body) patch.active = Boolean(body.active);
  if ("prompt" in body) {
    const p = clip(body.prompt, 500);
    if (!p) return NextResponse.json({ error: "prompt cannot be empty" }, { status: 400 });
    patch.prompt = p;
  }
  if ("cameras" in body) {
    const raw = Array.isArray(body.cameras) ? (body.cameras as unknown[]) : [];
    const ids = raw.map((c) => (typeof c === "string" ? c : "")).filter(Boolean);
    if (ids.length) {
      const db = getDb();
      const owned = await db
        .select({ id: schema.cameras.id })
        .from(schema.cameras)
        .where(
          and(
            eq(schema.cameras.shopId, me.shop.id),
            inArray(schema.cameras.id, ids),
          ),
        );
      if (owned.length !== ids.length) {
        return NextResponse.json(
          { error: "one or more cameras don't belong to your shop" },
          { status: 400 },
        );
      }
    }
    patch.cameras = ids;
  }

  const db = getDb();
  const [updated] = await db
    .update(schema.rules)
    .set(patch)
    .where(eq(schema.rules.id, id))
    .returning();
  return NextResponse.json({ rule: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const rule = await ownedRule(me.shop.id, id);
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  await db.delete(schema.rules).where(eq(schema.rules.id, id));
  return NextResponse.json({ ok: true });
}
