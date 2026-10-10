// POST /api/v1/auth/login
// Validates phone-or-email + password. Sets cookies. Returns user + shop.

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
import { parseIdentifier } from "@/lib/phone";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // `identifier` is phone or email. Older clients (the mobile app) send `email`,
  // which may now hold a phone number too.
  const raw = String(body.identifier ?? body.email ?? "");
  const password = String(body.password ?? "");

  if (!raw.trim() || !password) {
    return NextResponse.json(
      { error: "phone/email and password are required" },
      { status: 400 },
    );
  }

  // Same error either way to avoid enumeration.
  const bad = () =>
    NextResponse.json({ error: "Invalid phone/email or password" }, { status: 401 });

  const id = parseIdentifier(raw);
  const db = getDb();
  const [user] = id
    ? await db
        .select()
        .from(schema.users)
        .where(
          id.phone
            ? eq(schema.users.phone, id.phone)
            : dsql`lower(${schema.users.email}) = ${id.email}`,
        )
        .limit(1)
    : [];

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
      phone: user.phone,
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
