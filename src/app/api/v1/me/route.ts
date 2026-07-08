// GET /api/v1/me — current user + shop, or 401.

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/portal-session";

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
