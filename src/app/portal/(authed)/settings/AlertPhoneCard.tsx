"use client";

// The one real control on the settings page: which number critical alerts,
// camera-offline and trial texts go to.

import { useEffect, useState } from "react";

export default function AlertPhoneCard() {
  const [saved, setSaved] = useState<string | null | undefined>(undefined);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p = d?.user?.phone ?? null;
        setSaved(p);
        setValue(p ? `+${p}` : "");
      })
      .catch(() => setSaved(null));
  }, []);

  const call = async (url: string, init: RequestInit, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(url, init);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error ?? "Something went wrong");
      setMsg({ ok: true, text: okText });
      return data;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Network error" });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await call(
      "/api/v1/me",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value }),
      },
      value.trim() ? "Saved. Alerts will be texted to this number." : "Removed.",
    );
    if (data) {
      setSaved(data.phone);
      setValue(data.phone ? `+${data.phone}` : "");
    }
  };

  return (
    <section className="rounded-2xl border border-accent/30 bg-surface/40">
      <div className="px-5 sm:px-6 py-4 border-b border-border">
        <h2 className="font-display text-lg font-semibold">SMS alerts</h2>
        <p className="text-xs text-foreground/55 mt-0.5">
          Fire and smoke alerts, cameras going offline, and trial reminders are
          texted to this number.
        </p>
      </div>
      <form onSubmit={save} className="px-5 sm:px-6 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={saved === undefined ? "Loading…" : "024 123 4567"}
            disabled={saved === undefined}
            className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-foreground placeholder:text-foreground/30 outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || saved === undefined}
              className="rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              disabled={busy || !saved}
              onClick={() =>
                call("/api/v1/me/test-sms", { method: "POST" }, "Test SMS sent — check your phone.")
              }
              className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
            >
              Send test
            </button>
          </div>
        </div>
        {msg && (
          <p className={`text-xs ${msg.ok ? "text-accent" : "text-red-400"}`}>{msg.text}</p>
        )}
      </form>
    </section>
  );
}
