"use client";

// Forgot password: step 1 sends a 6-digit code by SMS or email, step 2 takes
// the code and a new password.

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PasswordField from "@/components/PasswordField";

export default function PortalForgotPage() {
  const [identifier, setIdentifier] = useState("");
  const [via, setVia] = useState<"sms" | "email" | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (url: string, body: unknown) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error ?? "Something went wrong");
    return data;
  };

  const run = async (fn: () => Promise<void>) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 400px at 50% 20%, rgba(255,204,31,0.18), transparent 60%), radial-gradient(500px 300px at 50% 90%, rgba(255,230,128,0.08), transparent 60%)",
        }}
      />

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-9">
          <Logo className="w-14 h-14" />
          <h1 className="mt-5 font-display text-3xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-foreground/60 max-w-xs">
            {done
              ? "Your password is updated."
              : via
                ? `We sent a 6-digit code by ${via === "sms" ? "SMS" : "email"} to ${identifier}.`
                : "We'll send a 6-digit code to your phone or email."}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface/60 p-7 backdrop-blur-xl space-y-5">
          {done ? (
            <Link
              href="/portal/login"
              className="btn-shine w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-5 py-3 font-medium glow-yellow hover:bg-accent-2 transition-colors"
            >
              Sign in <span aria-hidden>→</span>
            </Link>
          ) : !via ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  const data = await post("/api/v1/auth/forgot", { identifier });
                  setVia(data.via);
                });
              }}
            >
              <Field
                label="Phone Number / Business Email"
                name="identifier"
                value={identifier}
                onChange={setIdentifier}
                autoComplete="username"
                autoFocus
              />
              <ErrorBox error={error} />
              <Submit busy={submitting} label="Send code" busyLabel="Sending…" />
            </form>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(async () => {
                  await post("/api/v1/auth/reset", {
                    identifier,
                    code: fd.get("code"),
                    password: fd.get("password"),
                  });
                  setDone(true);
                });
              }}
            >
              <Field
                label="6-digit code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
              />
              <PasswordField
                label="New password"
                name="password"
                autoComplete="new-password"
                hint="8+ characters"
                minLength={8}
              />
              <ErrorBox error={error} />
              <Submit busy={submitting} label="Set new password" busyLabel="Saving…" />
              <button
                type="button"
                onClick={() => {
                  setVia(null);
                  setError(null);
                }}
                className="w-full text-center text-xs text-foreground/55 hover:text-accent"
              >
                Didn&apos;t get it? Send again
              </button>
            </form>
          )}

          {!done && (
            <p className="text-center text-xs text-foreground/55">
              Remembered it?{" "}
              <Link href="/portal/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      {error}
    </p>
  );
}

function Submit({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="btn-shine w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-5 py-3 font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {busy ? busyLabel : label}
      <span aria-hidden>→</span>
    </button>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  autoComplete,
  autoFocus,
  inputMode,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        {label}
      </span>
      <input
        name={name}
        required
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        inputMode={inputMode}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background"
      />
    </label>
  );
}
