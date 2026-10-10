// POST /api/v1/auth/reset  { identifier, code, password }
// Checks the newest unused code for that account, sets the new password and
// signs out every existing session. The user then logs in normally.

import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { parseIdentifier } from "@/lib/phone";
import { hashPassword } from "@/lib/portal-passwords";
import { hashResetCode, RESET_MAX_ATTEMPTS } from "@/lib/password-reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = parseIdentifier(String(body.identifier ?? "").slice(0, 200));
  const code = String(body.code ?? "").replace(/\D/g, "");
  const password = String(body.password ?? "");

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  const bad = () =>
    NextResponse.json({ error: "That code is wrong or has expired" }, { status: 400 });
  if (!id || code.length !== 6) return bad();

  const db = getDb();
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      id.phone
        ? eq(schema.users.phone, id.phone)
        : dsql`lower(${schema.users.email}) = ${id.email}`,
    )
    .limit(1);
  if (!user) return bad();

  const [reset] = await db
    .select()
    .from(schema.passwordResets)
    .where(
      and(
        eq(schema.passwordResets.userId, user.id),
        isNull(schema.passwordResets.usedAt),
        gt(schema.passwordResets.expiresAt, dsql`now()`),
      ),
    )
    .orderBy(desc(schema.passwordResets.createdAt))
    .limit(1);
  if (!reset || reset.attempts >= RESET_MAX_ATTEMPTS) return bad();

  if (reset.codeHash !== hashResetCode(user.id, code)) {
    await db
      .update(schema.passwordResets)
      .set({ attempts: reset.attempts + 1 })
      .where(eq(schema.passwordResets.id, reset.id));
    return bad();
  }

  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, user.id));
    await tx
      .update(schema.passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(schema.passwordResets.userId, user.id));
    await tx.delete(schema.sessions).where(eq(schema.sessions.userId, user.id));
  });

  return NextResponse.json({ ok: true });
}
