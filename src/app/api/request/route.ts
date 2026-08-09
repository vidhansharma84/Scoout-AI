import { NextResponse } from "next/server";
import { saveSubmission } from "@/lib/submissions";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export const runtime = "nodejs";

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n).trim();

function baseUrl(request: Request): string {
  const env = process.env.APP_URL;
  if (env) return env.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "scoout.ai";
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clip(body.name, 200);
  const phone = clip(body.phone, 50);
  const email = clip(body.email, 200);

  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "name, phone, and email are required" },
      { status: 400 }
    );
  }

  const rec = await saveSubmission({
    name,
    phone,
    email,
    city: clip(body.city, 100),
    businessName: clip(body.businessName, 200),
    businessType: clip(body.businessType, 200),
  });

  // The lead is already saved, so a failing mailbox must not fail the form.
  // sendWelcomeEmail never throws; this catch is belt-and-braces.
  let emailed = false;
  try {
    const res = await sendWelcomeEmail(rec, baseUrl(request));
    emailed = res.ok;
  } catch (e) {
    console.error("[request] welcome email failed:", e);
  }

  return NextResponse.json({ ok: true, id: rec.id, emailed });
}
