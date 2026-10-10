import { NextResponse, after } from "next/server";
import { notifyNewLead } from "@/lib/notify";
import { saveSubmission } from "@/lib/submissions";
import { sendWelcomeEmail } from "@/lib/welcome-email";
import { sendSms } from "@/lib/sms";
import { parseIdentifier } from "@/lib/phone";

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

  // The form has one "Phone Number / Business Email" field (`contact`). Many
  // shop owners have no email, so either one is enough. Older clients still
  // send separate `phone` and `email`.
  const name = clip(body.name, 200);
  const contact = clip(body.contact, 200);
  const id = contact ? parseIdentifier(contact) : null;
  const phone = id ? (id.phone ? contact : "") : clip(body.phone, 50);
  const email = id ? (id.email ?? "") : clip(body.email, 200).toLowerCase();

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      {
        error: contact
          ? "Enter a valid phone number or email"
          : "name and a phone number or email are required",
      },
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
  if (email) {
    try {
      const res = await sendWelcomeEmail(rec, baseUrl(request));
      emailed = res.ok;
    } catch (e) {
      console.error("[request] welcome email failed:", e);
    }
  }

  let texted = false;
  if (phone) {
    const firstName = name.split(/\s+/)[0];
    const sms = await sendSms({
      to: phone,
      message:
        `Hi ${firstName}, thanks for requesting access to Scoout AI. ` +
        `Our team will call you shortly to get your cameras connected. ` +
        `Tip: have your camera's stream URL ready.`,
    });
    texted = sms.ok;
  }

  // Ping the Scoout team so someone calls while the lead is warm.
  after(() => notifyNewLead(rec));

  return NextResponse.json({ ok: true, id: rec.id, emailed, texted });
}
