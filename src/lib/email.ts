// Minimal email sender. Uses Resend when RESEND_API_KEY is set; otherwise
// logs the payload to stdout so devs can copy the link during onboarding.
//
// Never throws — callers can always continue even if email fails.

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; provider: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Scoout AI <no-reply@ai.scoout.app>";

  if (!apiKey) {
    // Console fallback — the invite link is still visible in the log.
    console.log(
      "[email:noop] to=%s subject=%s\n%s",
      args.to,
      args.subject,
      args.text ?? args.html.replace(/<[^>]+>/g, ""),
    );
    return { ok: true, provider: "noop" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      console.error("[email:resend] %s: %s", res.status, await res.text().catch(() => ""));
      return { ok: false, provider: "resend" };
    }
    const data = await res.json();
    return { ok: true, provider: "resend", id: data?.id };
  } catch (e) {
    console.error("[email:resend] network error:", e);
    return { ok: false, provider: "resend" };
  }
}
