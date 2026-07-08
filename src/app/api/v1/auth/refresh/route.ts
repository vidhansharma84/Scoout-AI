// POST /api/v1/auth/refresh
// Rotates refresh token. Portal uses cookie; mobile sends {refresh} in body.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_COOKIE,
  REFRESH_TTL_SEC,
  signAccess,
} from "@/lib/portal-auth";
import { setAuthCookies } from "@/lib/portal-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const jar = await cookies();
  let raw = jar.get(REFRESH_COOKIE)?.value;
  if (!raw) {
    try {
      const body = await req.json();
      raw = typeof body?.refresh === "string" ? body.refresh : undefined;
    } catch {
      /* ignore */
    }
  }
  if (!raw) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const db = getDb();
  const hash = await hashRefreshToken(raw);
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.refreshTokenHash, hash))
    .limit(1);

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  if (!user) return NextResponse.json({ error: "User missing" }, { status: 401 });

  // Rotate: delete the old, insert a new.
  const { raw: newRaw, hash: newHash } = await generateRefreshToken();
  await db.transaction(async (tx) => {
    await tx.delete(schema.sessions).where(eq(schema.sessions.id, session.id));
    await tx.insert(schema.sessions).values({
      userId: user.id,
      refreshTokenHash: newHash,
      userAgent: req.headers.get("user-agent") ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SEC * 1000),
    });
  });

  const access = await signAccess({
    userId: user.id,
    shopId: user.shopId,
    role: user.role,
    email: user.email,
  });
  await setAuthCookies(access, newRaw);

  return NextResponse.json({ tokens: { access, refresh: newRaw } });
}
