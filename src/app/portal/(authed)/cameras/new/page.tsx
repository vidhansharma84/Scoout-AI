"use client";

import Link from "next/link";
import { useState } from "react";
import StreamUrlHelp from "@/components/portal/StreamUrlHelp";

const PROTOCOLS = [
  { id: "rtsp", label: "RTSP", hint: "Most CCTV / NVR brands" },
  { id: "onvif", label: "ONVIF", hint: "Hikvision, Dahua, Axis…" },
  { id: "hls", label: "HLS / RTMP", hint: "Streamed cameras" },
] as const;

export default function AddCameraPage() {
  const [protocol, setProtocol] = useState<(typeof PROTOCOLS)[number]["id"]>("rtsp");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-3xl">
      <nav className="mb-4 text-sm">
        <Link
          href="/portal/cameras"
          className="text-foreground/55 hover:text-foreground transition-colors"
        >
          Cameras
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">Add</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          / connect camera
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">
          Connect a new camera
        </h1>
        <p className="mt-1.5 text-foreground/65 text-sm sm:text-base">
          Scoout AI plugs into your existing CCTV/NVR. No new hardware required.
        </p>
      </header>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (submitting) return;
          setSubmitting(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          try {
            const res = await fetch("/api/v1/cameras", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: fd.get("name"),
                location: fd.get("location"),
                streamUrl: fd.get("streamUrl"),
                protocol,
              }),
            });
            if (res.ok) {
              window.location.href = "/portal/cameras";
            } else {
              const data = await res.json().catch(() => ({}));
              setError(data?.error ?? "Could not connect camera");
              setSubmitting(false);
            }
          } catch {
            setError("Network error. Please try again.");
            setSubmitting(false);
          }
        }}
        className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-8 space-y-7"
      >
        <Section title="1. Stream source">
          <div className="grid gap-3 sm:grid-cols-3">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProtocol(p.id)}
                className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                  protocol === p.id
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-surface/40 hover:border-foreground/30"
                }`}
              >
                <p className={`text-sm font-semibold ${protocol === p.id ? "text-accent" : ""}`}>
                  {p.label}
                </p>
                <p className="text-xs text-foreground/55 mt-1">{p.hint}</p>
              </button>
            ))}
          </div>

          <Field
            label="Stream URL"
            name="streamUrl"
            placeholder={
              protocol === "rtsp"
                ? "rtsp://admin:••••@192.168.1.100:554/Streaming/Channels/101"
                : protocol === "onvif"
                  ? "http://192.168.1.100/onvif/device_service"
                  : "https://stream.example.com/live.m3u8"
            }
            mono
          />
          <div className="mt-2">
            <StreamUrlHelp />
          </div>
        </Section>

        <Section title="2. Camera details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name" name="name" placeholder="Cam-07" />
            <Field label="Location" name="location" placeholder="Aisle 4 — drinks" />
          </div>
        </Section>

        <Section title="3. Watchlist">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm text-foreground/80">
              Apply all <span className="text-foreground font-medium">4 active</span> watchlist rules to this camera
            </p>
            <p className="mt-1.5 text-xs text-foreground/55">
              You can change this anytime from the Watchlist page.
            </p>
            <label className="mt-3 inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <span className="w-9 h-5 rounded-full bg-surface-2 border border-border peer-checked:bg-accent transition-colors relative">
                <span className="absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
              </span>
              <span className="ml-2 text-sm text-foreground/80">Apply now</span>
            </label>
          </div>
        </Section>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-foreground/50">
            We&apos;ll test the stream and ping the AI model before saving.
          </p>
          <div className="flex gap-3">
            <Link
              href="/portal/cameras"
              className="inline-flex items-center rounded-full border border-border bg-surface/60 hover:bg-surface px-5 py-2.5 text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-shine inline-flex items-center gap-2 rounded-full bg-accent text-background px-5 py-2.5 text-sm font-medium glow-yellow hover:bg-accent-2 transition-colors disabled:opacity-60"
            >
              {submitting ? "Testing stream…" : "Connect camera"}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/60 mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  mono,
}: {
  label: string;
  name: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/55 mb-2">
        {label}
      </span>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        className={`w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-accent focus:bg-background ${
          mono ? "font-mono text-sm" : ""
        }`}
      />
    </label>
  );
}
