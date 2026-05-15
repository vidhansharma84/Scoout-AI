// Edge-compatible session auth using HMAC-signed cookies.
// Secret is derived from ADMIN_PASSWORD so sessions auto-invalidate when the
// password is rotated.

const enc = new TextEncoder();

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const COOKIE_NAME = "scoout_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return "scoout-admin-v1:" + (process.env.ADMIN_PASSWORD ?? "");
}

export async function createSession(): Promise<{ value: string; expires: Date }> {
  const expiry = Date.now() + SESSION_TTL_MS;
  const sig = await hmacSha256Hex(getSecret(), String(expiry));
  return { value: `${expiry}.${sig}`, expires: new Date(expiry) };
}

export async function verifySession(value: string | undefined | null): Promise<boolean> {
  if (!value || typeof value !== "string") return false;
  const dot = value.indexOf(".");
  if (dot < 0) return false;
  const expiryStr = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expected = await hmacSha256Hex(getSecret(), expiryStr);
  return timingSafeEqualString(sig, expected);
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
