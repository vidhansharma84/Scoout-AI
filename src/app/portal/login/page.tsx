"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

export default function PortalLoginPage() {
  const [submitting, setSubmitting] = useState(false);

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
        <div className="flex flex-col items-center text-center mb-9">
          <Logo className="w-14 h-14" />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            Scoout<span className="text-accent">.</span>AI
          </h1>
          <p className="mt-2 text-[11px] text-foreground/55 font-mono uppercase tracking-[0.22em]">
            Surveillance Portal
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            // mock: no real auth — go straight in
            setTimeout(() => {
              window.location.href = "/portal";
            }, 700);
          }}
          className="rounded-3xl border border-border bg-surface/60 p-7 backdrop-blur-xl space-y-5"
        >
          <Field
            label="Business email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue="kojo@kojosprovisions.com"
            autoFocus
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="••••••••••"
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-foreground/70 select-none">
              <input
                type="checkbox"
                defaultChecked
                className="h-3.5 w-3.5 rounded border border-border bg-background accent-accent"
              />
              Keep me signed in
            </label>
            <a
              href="#"
              className="text-foreground/60 hover:text-accent transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-shine w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-background px-5 py-3 font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in…" : "Sign in"}
            <span aria-hidden>→</span>
          </button>

          <p className="text-center text-xs text-foreground/55">
            New here?{" "}
            <a href="#" className="text-accent hover:underline">
              Request access
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-[10px] text-foreground/40 font-mono uppercase tracking-[0.22em]">
          UI demo — credentials are mock
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
