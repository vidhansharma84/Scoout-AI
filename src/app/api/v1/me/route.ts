// GET   /api/v1/me — current user + shop, or 401.
// PATCH /api/v1/me { phone } — set or clear the number alerts are texted to.

import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: me.user.id,
      email: me.user.email,
      phone: me.user.phone,
      name: me.user.name,
      initials: me.user.initials,
      role: me.user.role,
    },
    shop: {
      id: me.shop.id,
      name: me.shop.name,
      city: me.shop.city,
      plan: me.shop.plan,
      trialEndsAt: me.shop.trialEndsAt,
    },
  });
}

export async function PATCH(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = String(body.phone ?? "").trim();
  const phone = raw ? normalizePhone(raw) : null;
  if (raw && !phone) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }
  // Phone-only accounts sign in with their number, so it can't be removed.
  if (!phone && !me.user.email) {
    return NextResponse.json(
      { error: "You sign in with this number, so it can't be removed" },
      { status: 400 },
    );
  }

  const db = getDb();
  if (phone) {
    const [taken] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(and(eq(schema.users.phone, phone), ne(schema.users.id, me.user.id)))
      .limit(1);
    if (taken) {
      return NextResponse.json(
        { error: "That number is already used by another account" },
        { status: 409 },
      );
    }
  }

  await db.update(schema.users).set({ phone }).where(eq(schema.users.id, me.user.id));
  return NextResponse.json({ ok: true, phone });
}
