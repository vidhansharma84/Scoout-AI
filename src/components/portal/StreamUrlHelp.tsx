"use client";

import { useState } from "react";

type Brand = {
  name: string;
  pattern: string;
  note?: string;
};

// Common RTSP URL patterns per brand. Same content used by the mobile app.
const RTSP_BRANDS: Brand[] = [
  {
    name: "Hikvision",
    pattern: "rtsp://USER:PASS@CAMERA-IP:554/Streaming/Channels/101",
    note: "Channels/101 = camera 1 main stream. /102 = sub-stream. /201 for camera 2, etc.",
  },
  {
    name: "Dahua / Amcrest / Lorex",
    pattern:
      "rtsp://USER:PASS@CAMERA-IP:554/cam/realmonitor?channel=1&subtype=0",
    note: "channel=1 for first camera. subtype=0 main, subtype=1 sub-stream.",
  },
  {
    name: "Axis",
    pattern: "rtsp://USER:PASS@CAMERA-IP:554/axis-media/media.amp",
  },
  {
    name: "Reolink",
    pattern: "rtsp://USER:PASS@CAMERA-IP:554/h264Preview_01_main",
    note: "01 = channel 1. Replace with h264Preview_01_sub for the smaller sub-stream.",
  },
  {
    name: "Uniview",
    pattern: "rtsp://USER:PASS@CAMERA-IP:554/media/video1",
  },
  {
    name: "TP-Link Tapo",
    pattern: "rtsp://USER:PASS@CAMERA-IP:554/stream1",
    note: "stream1 = HD, stream2 = SD. Enable 'Camera Account' in the Tapo app first.",
  },
  {
    name: "Wyze (RTSP firmware)",
    pattern: "rtsp://USER:PASS@CAMERA-IP/live",
    note: "Requires the Wyze official RTSP firmware, not the default one.",
  },
];

export default function StreamUrlHelp() {
  const [open, setOpen] = useState(false);
  const [protocol, setProtocol] = useState<"rtsp" | "onvif" | "hls">("rtsp");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
      >
        <span aria-hidden>?</span> How do I find my stream URL?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-surface p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  / stream setup
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold">
                  How to get your stream URL
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-foreground/45 hover:text-foreground text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mt-5 border-b border-border">
              {(["rtsp", "onvif", "hls"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    protocol === p
                      ? "border-accent text-foreground"
                      : "border-transparent text-foreground/55 hover:text-foreground"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-5 text-sm text-foreground/85 leading-relaxed">
              {protocol === "rtsp" && <RtspContent />}
              {protocol === "onvif" && <OnvifContent />}
              {protocol === "hls" && <HlsContent />}
            </div>

            <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">
                / need help?
              </p>
              <p className="text-sm text-foreground/85">
                WhatsApp us at{" "}
                <a
                  href="https://wa.me/233503818938"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium"
                >
                  +233 50 381 8938
                </a>
                . We&apos;ll get on a call and set up your first camera together
                — usually under 10 minutes.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RtspContent() {
  return (
    <>
      <p>
        <strong>RTSP is the standard streaming protocol</strong> supported by
        virtually every CCTV recorder (DVR/NVR) and IP camera. It looks like
        this:
      </p>
      <div className="rounded-lg bg-background/70 border border-border px-3 py-2 font-mono text-xs text-foreground/85 break-all">
        rtsp://USER:PASS@CAMERA-IP:PORT/PATH
      </div>

      <div>
        <p className="font-semibold text-foreground mb-2">Step by step</p>
        <ol className="list-decimal list-outside pl-5 space-y-1.5 text-foreground/80">
          <li>
            <strong>Enable RTSP on your camera or NVR.</strong> On most brands
            it&apos;s under Settings → Network → RTSP. Often off by default.
          </li>
          <li>
            <strong>Find your camera&apos;s IP address.</strong> Log into your
            router or the camera&apos;s app. Example: <code className="text-foreground">192.168.1.100</code>.
          </li>
          <li>
            <strong>Get the RTSP path for your brand</strong> (see below).
          </li>
          <li>
            <strong>Replace USER, PASS, and CAMERA-IP</strong> with your camera&apos;s
            login and local IP. Default port is <code className="text-foreground">554</code>.
          </li>
        </ol>
      </div>

      <div>
        <p className="font-semibold text-foreground mb-2">Common brands</p>
        <div className="space-y-2">
          {RTSP_BRANDS.map((b) => (
            <div
              key={b.name}
              className="rounded-lg border border-border bg-background/40 p-3"
            >
              <p className="text-sm font-semibold text-foreground">{b.name}</p>
              <p className="mt-1 font-mono text-[11px] text-foreground/80 break-all">
                {b.pattern}
              </p>
              {b.note && (
                <p className="mt-1.5 text-xs text-foreground/55">{b.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <p className="font-semibold text-foreground mb-2">Gotchas</p>
        <ul className="list-disc list-outside pl-5 space-y-1 text-foreground/80 text-sm">
          <li>
            The camera has to be <strong>reachable from the internet</strong>.
            If it&apos;s on your shop&apos;s local network only, use your
            camera brand&apos;s cloud relay (Hik-Connect, Dahua DMSS, Reolink Cloud)
            or set up port forwarding on the router.
          </li>
          <li>
            <strong>Use a dedicated camera user</strong> with view-only rights
            rather than the admin account.
          </li>
          <li>
            If the URL contains special characters in the password (@, #, /,
            etc.), URL-encode them or change the password to alphanumerics.
          </li>
        </ul>
      </div>
    </>
  );
}

function OnvifContent() {
  return (
    <>
      <p>
        <strong>ONVIF</strong> is an auto-discovery standard supported by most
        modern IP cameras — Hikvision, Dahua, Axis, Uniview, and many others.
        Scoout AI probes the camera to find the right stream automatically, so
        you don&apos;t have to hunt for the exact path.
      </p>
      <div className="rounded-lg bg-background/70 border border-border px-3 py-2 font-mono text-xs text-foreground/85 break-all">
        http://CAMERA-IP:PORT/onvif/device_service
      </div>

      <ol className="list-decimal list-outside pl-5 space-y-1.5 text-foreground/80">
        <li>
          <strong>Enable ONVIF on your camera</strong> (usually already on).
          Settings → Network → ONVIF.
        </li>
        <li>
          Enter the URL above with your camera&apos;s IP. Default port is
          usually <code className="text-foreground">80</code> or <code className="text-foreground">8000</code> — check your camera&apos;s manual.
        </li>
        <li>
          Add the camera user credentials in the ONVIF section.
        </li>
      </ol>

      <p className="text-foreground/70">
        If ONVIF doesn&apos;t auto-detect (some older cameras), fall back to
        RTSP directly.
      </p>
    </>
  );
}

function HlsContent() {
  return (
    <>
      <p>
        <strong>HLS / RTMP</strong> is for cameras that already publish a
        public streaming URL — usually cloud-based cameras or a custom
        streaming setup. Rare for traditional CCTV, common for security
        systems built on Wowza / Cloudflare Stream / YouTube Live.
      </p>
      <div className="rounded-lg bg-background/70 border border-border px-3 py-2 font-mono text-xs text-foreground/85 break-all">
        https://stream.example.com/live.m3u8
      </div>

      <ul className="list-disc list-outside pl-5 space-y-1 text-foreground/80">
        <li>Paste the URL your streaming provider gave you.</li>
        <li>
          The URL should be publicly reachable — Scoout can&apos;t connect to
          streams behind a VPN or IP-restricted CDN.
        </li>
      </ul>

      <p className="text-foreground/70">
        If you&apos;re not sure whether your camera is HLS, it probably
        isn&apos;t — pick RTSP or ONVIF instead.
      </p>
    </>
  );
}
