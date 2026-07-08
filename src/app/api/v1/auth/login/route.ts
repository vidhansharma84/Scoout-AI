// POST /api/v1/auth/login
// Validates email + password. Sets cookies. Returns user + shop.

import { NextResponse } from "next/server";
import { eq, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import {
  generateRefreshToken,
  REFRESH_TTL_SEC,
  signAccess,
} from "@/lib/portal-auth";
import { verifyPassword } from "@/lib/portal-passwords";
import { setAuthCookies } from "@/lib/portal-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(dsql`lower(${schema.users.email}) = ${email}`)
    .limit(1);

  // Same error either way to avoid enumeration.
  const bad = () =>
    NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!user) {
    // A little delay to slow brute-force
    await new Promise((r) => setTimeout(r, 400));
    return bad();
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 400));
    return bad();
  }

  const [shop] = await db
    .select()
    .from(schema.shops)
    .where(eq(schema.shops.id, user.shopId))
    .limit(1);
  if (!shop) return NextResponse.json({ error: "Shop missing" }, { status: 500 });

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
      trialEndsAt: shop.trialEndsAt,
    },
    tokens: { access, refresh },
  });
}
