// GET /api/v1/team — list team members + pending invites for the current shop.

import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  const members = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      initials: schema.users.initials,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .where(eq(schema.users.shopId, me.shop.id))
    .orderBy(desc(schema.users.createdAt));

  const invites = await db
    .select({
      id: schema.teamInvites.id,
      email: schema.teamInvites.email,
      role: schema.teamInvites.role,
      expiresAt: schema.teamInvites.expiresAt,
      createdAt: schema.teamInvites.createdAt,
    })
    .from(schema.teamInvites)
    .where(
      and(
        eq(schema.teamInvites.shopId, me.shop.id),
        isNull(schema.teamInvites.acceptedAt),
        gt(schema.teamInvites.expiresAt, dsql`now()`),
      ),
    )
    .orderBy(desc(schema.teamInvites.createdAt));

  return NextResponse.json({
    members,
    invites,
    isOwner: me.user.role === "owner",
  });
}
