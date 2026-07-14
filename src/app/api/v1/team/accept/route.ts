// POST /api/v1/team/accept  { token, name, password }
// Public — the invitee doesn't have an account yet. Verifies the token,
// creates a new user in the shop, issues a session, deletes the invite.

import { NextResponse } from "next/server";
import { and, eq, gt, isNull, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  generateRefreshToken,
  initialsFromName,
  REFRESH_TTL_SEC,
  signAccess,
} from "@/lib/portal-auth";
import { hashPassword } from "@/lib/portal-passwords";
import { setAuthCookies } from "@/lib/portal-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = clip(body.token, 200);
  const name = clip(body.name, 120);
  const password = String(body.password ?? "");

  if (!token || !name || !password) {
    return NextResponse.json(
      { error: "token, name, and password are required" },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [invite] = await db
    .select()
    .from(schema.teamInvites)
    .where(
      and(
        eq(schema.teamInvites.token, token),
        isNull(schema.teamInvites.acceptedAt),
        gt(schema.teamInvites.expiresAt, dsql`now()`),
      ),
    )
    .limit(1);
  if (!invite) {
    return NextResponse.json({ error: "Invite is invalid or expired" }, { status: 404 });
  }

  const [dup] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(dsql`lower(${schema.users.email}) = ${invite.email.toLowerCase()}`)
    .limit(1);
  if (dup) {
    return NextResponse.json(
      { error: "An account with that email already exists — sign in instead" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const { user, shop } = await db.transaction(async (tx) => {
    const [userRow] = await tx
      .insert(schema.users)
      .values({
        shopId: invite.shopId,
        email: invite.email,
        passwordHash,
        role: invite.role,
        name,
        initials: initialsFromName(name),
      })
      .returning();
    const [shopRow] = await tx
      .select()
      .from(schema.shops)
      .where(eq(schema.shops.id, invite.shopId))
      .limit(1);
    await tx
      .update(schema.teamInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(schema.teamInvites.id, invite.id));
    return { user: userRow, shop: shopRow };
  });

  const { raw: refresh, hash: refreshHash } = await generateRefreshToken();
  await db.insert(schema.sessions).values({
    userId: user.id,
    refreshTokenHash: refreshHash,
    userAgent: req.headers.get("user-agent") ?? null,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SEC * 1000),
  });

  const access = await signAccess({
    userId: user.id,
    shopId: shop.id,
    role: user.role,
    email: user.email,
  });
  await setAuthCookies(access, refresh);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      role: user.role,
    },
    shop: {
      id: shop.id,
      name: shop.name,
      city: shop.city,
      plan: shop.plan,
    },
    tokens: { access, refresh },
  });
}
