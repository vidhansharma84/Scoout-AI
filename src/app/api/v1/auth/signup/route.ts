// POST /api/v1/auth/signup
// Creates a new shop + owner user + first session in one call.
// Returns 200 with the new user/shop; sets HttpOnly cookies.

import { NextResponse } from "next/server";
import { eq, sql as dsql } from "drizzle-orm";
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

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopName = clip(body.shopName, 120);
  const name = clip(body.name, 120);
  const email = clip(body.email, 200).toLowerCase();
  const password = String(body.password ?? "");
  const city = clip(body.city, 100) || null;
  const country = clip(body.country, 2).toUpperCase() || "GH";

  if (!shopName || !name || !email || !password) {
    return NextResponse.json(
      { error: "shopName, name, email, and password are required" },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const db = getDb();

  // Duplicate check
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(dsql`lower(${schema.users.email}) = ${email}`)
    .limit(1);
  if (existing.length) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  // Shop + user in a transaction; then session.
  const { user, shop } = await db.transaction(async (tx) => {
    const [shopRow] = await tx
      .insert(schema.shops)
      .values({ name: shopName, city, country })
      .returning();
    const [userRow] = await tx
      .insert(schema.users)
      .values({
        shopId: shopRow.id,
        email,
        passwordHash,
        role: "owner",
        name,
        initials: initialsFromName(name),
      })
      .returning();
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
      trialEndsAt: shop.trialEndsAt,
    },
    tokens: { access, refresh },
  });
}
