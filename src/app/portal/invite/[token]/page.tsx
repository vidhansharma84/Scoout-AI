// Public accept-invite page. Reachable without a session.
// URL: /portal/invite/<token>

import Link from "next/link";
import { and, gt, isNull, eq, sql as dsql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import Logo from "@/components/Logo";
import AcceptInviteForm from "./AcceptInviteForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadInvite(token: string) {
  const db = getDb();
  const [invite] = await db
    .select({
      id: schema.teamInvites.id,
      email: schema.teamInvites.email,
      role: schema.teamInvites.role,
      shopId: schema.teamInvites.shopId,
      expiresAt: schema.teamInvites.expiresAt,
    })
    .from(schema.teamInvites)
    .where(
      and(
        eq(schema.teamInvites.token, token),
        isNull(schema.teamInvites.acceptedAt),
        gt(schema.teamInvites.expiresAt, dsql`now()`),
      ),
    )
    .limit(1);
  if (!invite) return null;
  const [shop] = await db
    .select({ name: schema.shops.name, city: schema.shops.city })
    .from(schema.shops)
    .where(eq(schema.shops.id, invite.shopId))
    .limit(1);
  return { invite, shop };
}

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await loadInvite(token);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 isolate">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 400px at 50% 20%, rgba(255,204,31,0.18), transparent 60%)",
        }}
      />
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo className="w-14 h-14" />
          <h1 className="mt-4 font-display text-3xl font-semibold">
            Scoout<span className="text-accent">.</span>AI
          </h1>
        </div>

        {!data ? (
          <div className="rounded-3xl border border-border bg-surface/60 p-8 text-center">
            <h2 className="font-display text-xl font-semibold">
              Invite not found
            </h2>
            <p className="mt-3 text-sm text-foreground/70">
              This link is invalid or has expired. Ask the person who invited
              you to send a new one, or sign in if you already have an account.
            </p>
            <Link
              href="/portal/login"
              className="inline-block mt-6 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium hover:bg-accent-2 transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-surface/60 p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent text-center">
              You&apos;re invited
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-center">
              Join {data.shop?.name ?? "the team"}
            </h2>
            <p className="mt-2 text-sm text-foreground/70 text-center">
              As <strong>{data.invite.role}</strong> on Scoout AI. Set your name
              and password to get started.
            </p>
            <div className="mt-5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-center">
              <p className="text-sm">{data.invite.email}</p>
            </div>
            <AcceptInviteForm token={token} />
          </div>
        )}
      </div>
    </div>
  );
}
