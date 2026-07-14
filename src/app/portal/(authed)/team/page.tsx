"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  email: string;
  name: string | null;
  initials: string | null;
  role: string;
  createdAt: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
};

type MeResponse = {
  members: Member[];
  invites: Invite[];
  isOwner: boolean;
};

export default function TeamPage() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    try {
      const [team, me] = await Promise.all([
        fetch("/api/v1/team").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/v1/me").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (team) setData(team);
      if (me?.user?.id) setMeId(me.user.id);
      setLoading(false);
    } catch {
      setError("Could not load team");
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeMember = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    const res = await fetch(`/api/v1/team/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Could not remove");
      return;
    }
    load();
  };

  const revokeInvite = async (id: string, email: string) => {
    if (!confirm(`Revoke invite to ${email}?`)) return;
    await fetch(`/api/v1/team/invite/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            / team
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
            Your team
          </h1>
          <p className="mt-1 text-foreground/60 text-sm">
            Owners can invite reviewers to help triage alerts.
          </p>
        </div>
        {data?.isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors"
          >
            + Invite teammate
          </button>
        )}
      </header>

      {loading ? (
        <p className="text-sm text-foreground/50">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <section className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-3">
              / members ({data?.members.length ?? 0})
            </p>
            <div className="rounded-2xl border border-border bg-surface/40 divide-y divide-border overflow-hidden">
              {data?.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-4 sm:px-5 py-4"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-sm font-semibold shrink-0">
                    {m.initials ?? (m.name?.slice(0, 2) ?? "??").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {m.name ?? m.email}
                        {m.id === meId && (
                          <span className="ml-2 text-foreground/40 text-xs font-normal">
                            (you)
                          </span>
                        )}
                      </p>
                      <span
                        className={`font-mono text-[9px] uppercase tracking-[0.18em] rounded-md px-1.5 py-0.5 ${
                          m.role === "owner"
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "bg-surface-2 text-foreground/60"
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 mt-0.5">{m.email}</p>
                  </div>
                  {data.isOwner && m.id !== meId && (
                    <button
                      onClick={() => removeMember(m.id, m.name ?? m.email)}
                      className="text-foreground/45 hover:text-red-400 transition-colors text-sm px-2"
                      title="Remove teammate"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {(data?.invites.length ?? 0) > 0 && (
            <section className="mb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-3">
                / pending invites ({data!.invites.length})
              </p>
              <div className="rounded-2xl border border-border bg-surface/40 divide-y divide-border overflow-hidden">
                {data!.invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 px-4 sm:px-5 py-4"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 border border-border text-foreground/50 text-lg shrink-0">
                      ✉
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{inv.email}</p>
                      <p className="text-xs text-foreground/55 mt-0.5">
                        Invited as {inv.role} · expires{" "}
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    {data!.isOwner && (
                      <button
                        onClick={() => revokeInvite(inv.id, inv.email)}
                        className="text-foreground/45 hover:text-red-400 transition-colors text-sm px-2"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSent={() => {
            setShowInvite(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"reviewer" | "owner">("reviewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentLink, setSentLink] = useState<string | null>(null);
  const [emailedVia, setEmailedVia] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not send invite");
      } else {
        setSentLink(data.inviteLink);
        setEmailedVia(data.emailSent ? data.emailProvider : null);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6">
        {sentLink ? (
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 border border-accent/30 text-accent text-xl mb-4">
              ✓
            </div>
            <h2 className="font-display text-xl font-semibold">Invite sent</h2>
            <p className="mt-2 text-sm text-foreground/70">
              {emailedVia === "resend"
                ? `We emailed the link to ${email}.`
                : `Email isn't configured yet — copy this link and send it manually:`}
            </p>
            <div className="mt-4 rounded-xl border border-border bg-background/60 px-3 py-2 text-left">
              <p className="font-mono text-xs text-foreground/80 break-all">
                {sentLink}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(sentLink)}
              className="mt-3 text-xs text-accent hover:underline"
            >
              Copy link
            </button>
            <button
              onClick={onSent}
              className="mt-6 w-full rounded-full bg-accent text-background py-2.5 text-sm font-medium hover:bg-accent-2 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="font-display text-xl font-semibold">
              Invite a teammate
            </h2>
            <p className="mt-1 text-sm text-foreground/65">
              They&apos;ll get an email with a link to set their password and
              join your shop.
            </p>
            <label className="block mt-5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
                Email
              </span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ama@kojosprovisions.com"
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-accent"
              />
            </label>
            <label className="block mt-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
                Role
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["reviewer", "owner"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2.5 text-sm text-left transition-colors ${
                      role === r
                        ? "border-accent/50 bg-accent/10 text-foreground"
                        : "border-border bg-surface/40 text-foreground/70 hover:border-foreground/30"
                    }`}
                  >
                    <p className={`font-medium ${role === r ? "text-accent" : ""}`}>
                      {r === "owner" ? "Owner" : "Reviewer"}
                    </p>
                    <p className="text-xs text-foreground/55 mt-0.5">
                      {r === "owner"
                        ? "Full access — cameras, rules, billing"
                        : "Review alerts, no billing"}
                    </p>
                  </button>
                ))}
              </div>
            </label>

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-border bg-surface/60 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !email}
                className="btn-shine flex-1 rounded-full bg-accent text-background py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
