// POST /api/v1/auth/logout
// Deletes the refresh session from DB and clears cookies. Idempotent.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { hashRefreshToken, REFRESH_COOKIE } from "@/lib/portal-auth";
import { clearAuthCookies } from "@/lib/portal-session";

export const runtime = "nodejs";

export async function POST() {
  const jar = await cookies();
  const raw = jar.get(REFRESH_COOKIE)?.value;
  if (raw) {
    try {
      const db = getDb();
      const hash = await hashRefreshToken(raw);
      await db.delete(schema.sessions).where(eq(schema.sessions.refreshTokenHash, hash));
    } catch {
      /* ignore */
    }
  }
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
