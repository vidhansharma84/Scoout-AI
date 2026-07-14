// DELETE /api/v1/team/:userId  — remove a teammate (owner-only, can't remove self).

import { NextResponse } from "next/server";
import { and, eq, ne, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.user.role !== "owner") {
    return NextResponse.json({ error: "Only owners can remove teammates" }, { status: 403 });
  }
  const { userId } = await params;
  if (userId === me.user.id) {
    return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 });
  }
  const db = getDb();
  // Ensure the target is in the caller's shop.
  const [target] = await db
    .select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users)
    .where(
      and(eq(schema.users.id, userId), eq(schema.users.shopId, me.shop.id)),
    )
    .limit(1);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent removing the last owner.
  if (target.role === "owner") {
    const [{ count }] = await db
      .select({ count: dsql<number>`count(*)::int` })
      .from(schema.users)
      .where(and(eq(schema.users.shopId, me.shop.id), eq(schema.users.role, "owner")));
    if (count <= 1) {
      return NextResponse.json(
        { error: "Can't remove the last owner — promote another user first" },
        { status: 400 },
      );
    }
  }

  await db.delete(schema.users).where(eq(schema.users.id, userId));
  return NextResponse.json({ ok: true });
  void ne;
}
