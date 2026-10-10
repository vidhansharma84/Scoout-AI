// POST /api/v1/auth/forgot  { identifier }   (phone or email)
// Sends a 6-digit reset code by SMS or email. Always answers ok, so the
// response never reveals whether an account exists.

import { NextResponse } from "next/server";
import { and, eq, gt, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { parseIdentifier } from "@/lib/phone";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { hashResetCode, newResetCode, RESET_TTL_MS } from "@/lib/password-reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = parseIdentifier(String(body.identifier ?? body.email ?? "").slice(0, 200));
  if (!id) {
    return NextResponse.json(
      { error: "Enter a valid phone number or email" },
      { status: 400 },
    );
  }
  const ok = NextResponse.json({ ok: true, via: id.phone ? "sms" : "email" });

  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(
      id.phone
        ? eq(schema.users.phone, id.phone)
        : dsql`lower(${schema.users.email}) = ${id.email}`,
    )
    .limit(1);
  if (!user) return ok;

  // At most one code a minute and five an hour per account — each SMS costs
  // credit, and this endpoint is public.
  const recent = await db
    .select({ createdAt: schema.passwordResets.createdAt })
    .from(schema.passwordResets)
    .where(
      and(
        eq(schema.passwordResets.userId, user.id),
        gt(schema.passwordResets.createdAt, dsql`now() - interval '1 hour'`),
      ),
    );
  const lastAt = Math.max(0, ...recent.map((r) => r.createdAt.getTime()));
  if (recent.length >= 5 || Date.now() - lastAt < 60_000) return ok;

  const code = newResetCode();
  await db.insert(schema.passwordResets).values({
    userId: user.id,
    codeHash: hashResetCode(user.id, code),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  const message = `Your Scoout AI password reset code is ${code}. It expires in 10 minutes. If you didn't ask for this, ignore it.`;
  if (id.phone) {
    await sendSms({ to: id.phone, message });
  } else if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `Your Scoout AI reset code: ${code}`,
      text: message,
      html: `<p>Your Scoout AI password reset code is</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p style="color:#8a8a85;font-size:12px">It expires in 10 minutes. If you didn't ask for this, ignore this email.</p>`,
    });
  }

  return ok;
}
