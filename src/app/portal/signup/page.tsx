"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PasswordField from "@/components/PasswordField";

export default function PortalSignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo className="w-14 h-14" />
          <h1 className="mt-5 font-display text-3xl font-semibold">
            Start free
          </h1>
          <p className="mt-2 text-sm text-foreground/60 max-w-xs">
            14-day trial. No credit card. Add one camera and see it work in
            under 5 minutes.
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
              const r = await fetch("/api/v1/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  shopName: fd.get("shopName"),
                  city: fd.get("city"),
                  name: fd.get("name"),
                  email: fd.get("email"),
                  password: fd.get("password"),
                }),
              });
              if (r.ok) {
                window.location.href = "/portal";
              } else {
                const data = await r.json().catch(() => ({}));
                setError(data?.error ?? "Signup failed");
                setSubmitting(false);
              }
            } catch {
              setError("Network error. Please try again.");
              setSubmitting(false);
            }
          }}
          className="rounded-3xl border border-border bg-surface/60 p-7 backdrop-blur-xl space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" name="shopName" placeholder="Kojo's Provisions" autoFocus />
            <Field label="City" name="city" placeholder="Accra" required={false} />
          </div>
          <Field label="Your name" name="name" placeholder="Kojo Mensah" />
          <Field
            label="Business email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="kojo@kojosprovisions.com"
          />
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            hint="8+ characters"
            minLength={8}
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
            {submitting ? "Creating your workspace…" : "Create free account"}
            <span aria-hidden>→</span>
          </button>

          <p className="text-center text-xs text-foreground/55">
            Already have an account?{" "}
            <Link href="/portal/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  autoFocus,
  required = true,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        {label}
        {hint && (
          <span className="ml-2 lowercase tracking-normal text-foreground/40 normal-case">
            · {hint}
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background"
      />
    </label>
  );
}
