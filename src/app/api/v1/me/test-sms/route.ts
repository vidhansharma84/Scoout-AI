// POST /api/v1/me/test-sms — texts the signed-in user's phone so they can
// confirm alerts will reach them. Once a minute per user.

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/portal-session";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lastSent = new Map<string, number>();

export async function POST() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!me.user.phone) {
    return NextResponse.json({ error: "Save a phone number first" }, { status: 400 });
  }
  const last = lastSent.get(me.user.id) ?? 0;
  if (Date.now() - last < 60_000) {
    return NextResponse.json({ error: "Wait a minute before sending another" }, { status: 429 });
  }
  lastSent.set(me.user.id, Date.now());

  const res = await sendSms({
    to: me.user.phone,
    message: `Scoout AI test: SMS alerts for ${me.shop.name} will reach this number.`,
  });
  if (!res.ok) {
    return NextResponse.json({ error: "The SMS could not be sent. Try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
