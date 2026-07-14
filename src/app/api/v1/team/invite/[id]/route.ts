// DELETE /api/v1/team/invite/:id  — revoke a pending invite (owner-only).

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.user.role !== "owner") {
    return NextResponse.json({ error: "Only owners can revoke invites" }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  await db
    .delete(schema.teamInvites)
    .where(and(eq(schema.teamInvites.id, id), eq(schema.teamInvites.shopId, me.shop.id)));
  return NextResponse.json({ ok: true });
}
