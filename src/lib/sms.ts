// Minimal SMS + voice sender. Uses mNotify (Ghana) when MNOTIFY_API_KEY is
// set; otherwise logs the payload to stdout, same as the email fallback.
//
// Never throws — callers can always continue even if SMS fails.
//
// MNOTIFY_SENDER_ID must be a sender ID already approved on the mNotify
// account (max 11 chars). An unapproved one makes every send fail.

import { normalizePhone } from "./phone";

const API = "https://api.mnotify.com/api";

type SendArgs = {
  to: string | string[];
  message: string;
};

type SendResult = { ok: boolean; provider: string; sent?: number; id?: string };

function recipientsOf(to: string | string[]): string[] {
  return [
    ...new Set(
      (Array.isArray(to) ? to : [to])
        .map(normalizePhone)
        .filter((n): n is string => !!n),
    ),
  ];
}

function keyParam(apiKey: string): string {
  return `key=${encodeURIComponent(apiKey)}`;
}

export async function sendSms(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.MNOTIFY_API_KEY;
  const sender = process.env.MNOTIFY_SENDER_ID || "Scoout";

  const recipients = recipientsOf(args.to);
  if (recipients.length === 0) return { ok: false, provider: "none" };

  if (!apiKey) {
    console.log("[sms:noop] to=%s\n%s", recipients.join(","), args.message);
    return { ok: true, provider: "noop" };
  }

  try {
    const res = await fetch(`${API}/sms/quick?${keyParam(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        recipient: recipients,
        sender,
        message: args.message,
        is_schedule: false,
        schedule_date: "",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => null);
    // mNotify can answer 200 with status "error", so check the body too.
    if (!res.ok || data?.status !== "success") {
      console.error("[sms:mnotify] %s: %s", res.status, JSON.stringify(data));
      return { ok: false, provider: "mnotify" };
    }
    return {
      ok: true,
      provider: "mnotify",
      sent: data?.summary?.total_sent,
      id: data?.summary?._id,
    };
  } catch (e) {
    console.error("[sms:mnotify] network error:", e);
    return { ok: false, provider: "mnotify" };
  }
}

// Plays a pre-recorded message to each number. The recording is uploaded once
// in the mNotify dashboard; its id goes in MNOTIFY_FIRE_VOICE_ID. Unset = no
// calls, so this is opt-in per deployment.
export async function sendVoiceCall(args: {
  to: string | string[];
  campaign: string;
}): Promise<SendResult> {
  const apiKey = process.env.MNOTIFY_API_KEY;
  const voiceId = process.env.MNOTIFY_FIRE_VOICE_ID;
  const recipients = recipientsOf(args.to);
  if (recipients.length === 0 || !voiceId) return { ok: false, provider: "none" };

  if (!apiKey) {
    console.log("[voice:noop] to=%s campaign=%s", recipients.join(","), args.campaign);
    return { ok: true, provider: "noop" };
  }

  try {
    const form = new FormData();
    form.append("campaign", args.campaign);
    for (const r of recipients) form.append("recipient[]", r);
    form.append("voice_id", voiceId);
    form.append("is_schedule", "false");
    form.append("schedule_date", "");
    const res = await fetch(`${API}/voice/quick?${keyParam(apiKey)}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.status !== "success") {
      console.error("[voice:mnotify] %s: %s", res.status, JSON.stringify(data));
      return { ok: false, provider: "mnotify" };
    }
    return { ok: true, provider: "mnotify" };
  } catch (e) {
    console.error("[voice:mnotify] network error:", e);
    return { ok: false, provider: "mnotify" };
  }
}

// Remaining SMS credits, or null when unknown (no key, network error).
export async function smsBalance(): Promise<number | null> {
  const apiKey = process.env.MNOTIFY_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${API}/balance/sms?${keyParam(apiKey)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    const n = Number(data?.balance);
    return data?.status === "success" && Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
