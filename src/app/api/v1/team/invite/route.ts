// POST /api/v1/team/invite  { email, role? }
// Owner-only. Creates an invite token, emails a link to /portal/invite/[token].

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { and, eq, gt, isNull, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { currentUser } from "@/lib/portal-session";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

function baseUrl(req: Request): string {
  const env = process.env.APP_URL;
  if (env) return env.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "ai.scoout.app";
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.user.role !== "owner") {
    return NextResponse.json({ error: "Only owners can invite" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = clip(body.email, 200).toLowerCase();
  const role = clip(body.role, 20).toLowerCase() || "reviewer";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!["reviewer", "owner"].includes(role)) {
    return NextResponse.json({ error: "Role must be reviewer or owner" }, { status: 400 });
  }

  const db = getDb();
  // Refuse if that email already belongs to a user in this shop.
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.shopId, me.shop.id),
        dsql`lower(${schema.users.email}) = ${email}`,
      ),
    )
    .limit(1);
  if (existing) {
    return NextResponse.json(
      { error: "Already a member of this shop" },
      { status: 409 },
    );
  }

  // Reuse a pending invite instead of piling up.
  const [live] = await db
    .select()
    .from(schema.teamInvites)
    .where(
      and(
        eq(schema.teamInvites.shopId, me.shop.id),
        dsql`lower(${schema.teamInvites.email}) = ${email}`,
        isNull(schema.teamInvites.acceptedAt),
        gt(schema.teamInvites.expiresAt, dsql`now()`),
      ),
    )
    .limit(1);

  let invite = live;
  if (!invite) {
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [row] = await db
      .insert(schema.teamInvites)
      .values({
        shopId: me.shop.id,
        email,
        role,
        token,
        invitedBy: me.user.id,
        expiresAt,
      })
      .returning();
    invite = row;
  }

  const link = `${baseUrl(req)}/portal/invite/${invite.token}`;
  const senderName = me.user.name || "your teammate";
  const shopName = me.shop.name;

  const emailResult = await sendEmail({
    to: email,
    subject: `${senderName} invited you to ${shopName} on Scoout AI`,
    text:
      `${senderName} invited you to join ${shopName} on Scoout AI as a ${role}.\n\n` +
      `Accept your invitation: ${link}\n\n` +
      `This link expires in 7 days. Scoout AI — surveillance intelligence.`,
    html:
      `<p>${senderName} invited you to join <strong>${escape(shopName)}</strong> on Scoout AI as a <strong>${role}</strong>.</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#FFCC1F;color:#0a0a0b;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600">Accept invitation</a></p>` +
      `<p>Or paste this link into your browser:<br><code>${link}</code></p>` +
      `<p style="color:#8a8a85;font-size:12px">This link expires in 7 days. Scoout AI — surveillance intelligence.</p>`,
  });

  return NextResponse.json({
    ok: true,
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    },
    // Return the link so owners can copy-paste when email isn't configured.
    inviteLink: link,
    emailProvider: emailResult.provider,
    emailSent: emailResult.ok,
  });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
