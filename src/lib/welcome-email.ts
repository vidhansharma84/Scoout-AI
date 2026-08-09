// Welcome email sent to a prospect the moment they submit the access-request
// form on the landing page.
//
// Two jobs: confirm a human will actually follow up (the form otherwise ends in
// a silent "thanks"), and get them doing the one thing that speeds up
// onboarding — finding their camera stream URL before we call.

import { sendEmail } from "./email";
import type { Submission } from "./submissions";

const ACCENT = "#FFCC1F";
const INK = "#0a0a0b";
const MUTED = "#6b6b66";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstNameOf(full: string): string {
  const first = full.trim().split(/\s+/)[0] ?? "";
  return first || "there";
}

function subjectFor(rec: Submission): string {
  return `Welcome to Scoout AI, ${firstNameOf(rec.name)} — here's what happens next`;
}

/**
 * Build the welcome email. Kept separate from sending so the template can be
 * previewed and diffed without touching a mail provider — see
 * scripts/preview-welcome-email.mjs.
 */
export function renderWelcomeEmail(
  rec: Submission,
  baseUrl: string,
): { subject: string; html: string; text: string } {
  const first = escape(firstNameOf(rec.name));
  const business = rec.businessName.trim();
  const forBusiness = business ? ` for ${escape(business)}` : "";
  const site = baseUrl.replace(/\/$/, "");

  const steps: Array<[string, string]> = [
    [
      "We review your request",
      "One of our team looks at your setup within one business day — no bots, no queue.",
    ],
    [
      "We call you",
      `We'll ring ${escape(rec.phone)} to understand what you want watched and answer anything you're unsure about.`,
    ],
    [
      "We set up your portal",
      "We create your account, add your first camera with you, and write your first watch rule together.",
    ],
  ];

  const stepsHtml = steps
    .map(
      ([title, body], i) => `
      <tr>
        <td style="padding:0 0 18px 0;vertical-align:top;width:34px">
          <div style="width:26px;height:26px;border-radius:999px;background:${ACCENT};color:${INK};font-weight:700;font-size:13px;line-height:26px;text-align:center">${i + 1}</div>
        </td>
        <td style="padding:0 0 18px 0;vertical-align:top">
          <div style="font-weight:600;color:${INK};font-size:15px">${title}</div>
          <div style="color:${MUTED};font-size:14px;line-height:1.55;margin-top:3px">${body}</div>
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escape(subjectFor(rec))}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e6e2">

          <tr>
            <td style="background:${INK};padding:22px 28px">
              <div style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:-0.2px">
                Scoout<span style="color:${ACCENT}">.AI</span>
              </div>
              <div style="color:#8a8a85;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:5px">
                Surveillance intelligence
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 28px 6px 28px">
              <h1 style="margin:0 0 10px 0;font-size:23px;line-height:1.25;color:${INK};font-weight:700">
                Thanks, ${first} — we've got your request${forBusiness}.
              </h1>
              <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.6">
                Your access request is in. Here's exactly what happens now, so you're not left wondering.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 4px 28px">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-bottom:14px">
                What happens next
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepsHtml}</table>
            </td>
          </tr>

          <tr>
            <td style="padding:6px 28px 4px 28px">
              <div style="background:#faf9f5;border:1px solid #eceae2;border-radius:12px;padding:18px 20px">
                <div style="font-weight:600;color:${INK};font-size:15px;margin-bottom:8px">
                  One thing that speeds this up
                </div>
                <p style="margin:0 0 10px 0;color:${MUTED};font-size:14px;line-height:1.6">
                  Have your camera's stream URL ready if you can. Most IP cameras show it in their
                  own app under <strong>Network</strong>, <strong>RTSP</strong> or <strong>Advanced</strong>,
                  and it looks like <code style="background:#efeee8;padding:1px 5px;border-radius:4px">rtsp://…</code>
                </p>
                <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6">
                  No IP camera yet? You don't need one to start — an Android phone can act as your
                  first camera, and we'll show you how on the call.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px 4px 28px">
              <a href="${site}" style="display:inline-block;background:${ACCENT};color:${INK};padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px">
                Visit Scoout AI
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 28px 28px">
              <div style="border-top:1px solid #eceae2;padding-top:18px">
                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-bottom:10px">
                  Need us sooner?
                </div>
                <div style="color:${MUTED};font-size:14px;line-height:1.9">
                  Ghana &nbsp;<a href="tel:+233503818938" style="color:${INK};text-decoration:none;font-weight:600">+233 50 381 8938</a><br>
                  Toronto HQ &nbsp;<a href="tel:+16477658028" style="color:${INK};text-decoration:none;font-weight:600">+1 (647) 765-8028</a><br>
                  Email &nbsp;<a href="mailto:hello@scoout.app" style="color:${INK};text-decoration:none;font-weight:600">hello@scoout.app</a>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#faf9f5;padding:16px 28px;border-top:1px solid #eceae2">
              <p style="margin:0;color:#9a9a94;font-size:11.5px;line-height:1.6">
                You're getting this because you requested access at ${escape(site.replace(/^https?:\/\//, ""))}.
                If that wasn't you, just ignore this email and we won't follow up.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Thanks, ${firstNameOf(rec.name)} — we've got your request${business ? ` for ${business}` : ""}.`,
    ``,
    `Your access request is in. Here's exactly what happens now:`,
    ``,
    `1. We review your request — within one business day, by a person.`,
    `2. We call you on ${rec.phone} to understand what you want watched.`,
    `3. We set up your portal, add your first camera with you, and write your first watch rule together.`,
    ``,
    `ONE THING THAT SPEEDS THIS UP`,
    `Have your camera's stream URL ready if you can. Most IP cameras show it in`,
    `their app under Network, RTSP or Advanced, and it looks like rtsp://...`,
    `No IP camera yet? An Android phone can be your first camera — we'll show you how.`,
    ``,
    `NEED US SOONER?`,
    `Ghana       +233 50 381 8938`,
    `Toronto HQ  +1 (647) 765-8028`,
    `Email       hello@scoout.app`,
    ``,
    `Scoout AI — surveillance intelligence.`,
    `You're getting this because you requested access at ${site.replace(/^https?:\/\//, "")}.`,
  ].join("\n");

  return { subject: subjectFor(rec), html, text };
}

/**
 * Send the welcome / next-steps email. Never throws — a failed send must not
 * fail the form submission, since the lead is already saved by then.
 */
export async function sendWelcomeEmail(
  rec: Submission,
  baseUrl: string,
): Promise<{ ok: boolean; provider: string }> {
  const { subject, html, text } = renderWelcomeEmail(rec, baseUrl);
  const res = await sendEmail({ to: rec.email, subject, html, text });
  return { ok: res.ok, provider: res.provider };
}
