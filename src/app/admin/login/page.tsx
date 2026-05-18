"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 400px at 50% 20%, rgba(255,204,31,0.18), transparent 60%), radial-gradient(500px 300px at 50% 90%, rgba(255,209,102,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo className="w-14 h-14" />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            Scoout<span className="text-accent">.</span>AI
          </h1>
          <p className="mt-2 text-[11px] text-foreground/55 font-mono uppercase tracking-[0.22em]">
            Admin Console
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            setError(null);
            const fd = new FormData(e.currentTarget);
            try {
              const r = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: fd.get("username"),
                  password: fd.get("password"),
                }),
              });
              if (r.ok) {
                window.location.href = "/admin";
              } else {
                const data = await r.json().catch(() => ({}));
                setError(data?.error ?? "Login failed");
                setSubmitting(false);
              }
            } catch {
              setError("Network error. Please try again.");
              setSubmitting(false);
            }
          }}
          className="rounded-3xl border border-border bg-surface/60 p-7 backdrop-blur-xl space-y-5"
        >
          <Field
            label="Username"
            name="username"
            autoComplete="username"
            defaultValue="admin"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-shine w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-5 py-3 font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in…" : "Sign in"}
            <span aria-hidden>→</span>
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-foreground/40 font-mono uppercase tracking-[0.22em]">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  autoFocus,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background"
      />
    </label>
  );
}
