"use client";

import { useState } from "react";

/**
 * Password input with a show/hide eye toggle. Shares its visual style with the
 * plain _Field controls used across portal auth pages so it slots in.
 */
export default function PasswordField({
  label,
  name,
  autoComplete = "current-password",
  autoFocus = false,
  required = true,
  hint,
  minLength,
  value,
  onChange,
  defaultValue,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  hint?: string;
  minLength?: number;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        <span>
          {label}
          {hint && (
            <span className="ml-2 lowercase tracking-normal text-foreground/40 normal-case">
              · {hint}
            </span>
          )}
        </span>
      </span>
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="w-full rounded-xl border border-border bg-background/60 pl-4 pr-12 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 my-1 grid place-items-center rounded-lg px-2 text-foreground/55 hover:text-accent hover:bg-surface/60 transition-colors"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-6.5 0-10-7-10-7a17.63 17.63 0 0 1 4.16-5.19M9.9 4.24A10 10 0 0 1 12 4c6.5 0 10 7 10 7a17.55 17.55 0 0 1-3.06 3.94" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M2 2l20 20" />
    </svg>
  );
}
