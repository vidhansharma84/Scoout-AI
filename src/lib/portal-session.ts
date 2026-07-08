// Cookie helpers + current-user resolver for API routes.

import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_TTL_SEC,
  REFRESH_TTL_SEC,
  hashRefreshToken,
  verifyAccess,
} from "./portal-auth";

export async function setAuthCookies(access: string, refresh: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TTL_SEC,
  });
  jar.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TTL_SEC,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { path: "/", expires: new Date(0) });
  jar.set(REFRESH_COOKIE, "", { path: "/", expires: new Date(0) });
}

/**
 * Read access token from cookie or Authorization header, verify, and load the
 * user. Returns null when unauthenticated. Runs only on Node runtime.
 */
export async function currentUser() {
  const jar = await cookies();
  let token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) {
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) token = auth.slice("Bearer ".length);
  }
  const payload = await verifyAccess(token);
  if (!payload?.sub) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.sub))
    .limit(1);
  const user = rows[0];
  if (!user) return null;

  const shopRows = await db
    .select()
    .from(schema.shops)
    .where(eq(schema.shops.id, user.shopId))
    .limit(1);
  return { user, shop: shopRows[0] };
}

/**
 * Look up a session by refresh token, verifying its hash matches DB storage.
 */
export async function findSessionByRefreshToken(raw: string) {
  const db = getDb();
  const hash = await hashRefreshToken(raw);
  const rows = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.refreshTokenHash, hash))
    .limit(1);
  return rows[0] ?? null;
}
