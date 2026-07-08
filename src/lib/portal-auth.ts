// Edge-compatible auth primitives for the Scoout AI portal.
// - Access token: short-lived JWT (jose), portal via cookie, mobile via Bearer.
// - Refresh token: opaque random string, hashed in the sessions table, 30d.
// Password hashing (bcrypt) lives in a Node-only helper — see hashPassword() /
// verifyPassword() — never called from middleware.

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ACCESS_COOKIE = "scoout_at";
export const REFRESH_COOKIE = "scoout_rt";

export const ACCESS_TTL_SEC = 15 * 60; // 15 min
export const REFRESH_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

export type AccessPayload = JWTPayload & {
  sub: string; // user id
  shopId: string;
  role: string;
  email: string;
};

function accessSecret(): Uint8Array {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signAccess(payload: {
  userId: string;
  shopId: string;
  role: string;
  email: string;
}): Promise<string> {
  return await new SignJWT({
    shopId: payload.shopId,
    role: payload.role,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .setIssuer("scoout-ai")
    .sign(accessSecret());
}

export async function verifyAccess(
  token: string | undefined | null,
): Promise<AccessPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, accessSecret(), {
      issuer: "scoout-ai",
      algorithms: ["HS256"],
    });
    return payload as AccessPayload;
  } catch {
    return null;
  }
}

/**
 * Generate an opaque refresh token (raw) and its hash (to store in DB).
 * Never persist the raw value.
 */
export async function generateRefreshToken(): Promise<{
  raw: string;
  hash: string;
}> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = bytesToBase64Url(bytes);
  const hash = await hashRefreshToken(raw);
  return { raw, hash };
}

export async function hashRefreshToken(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Turn a full name into "KM"-style initials, capped at 2 chars.
 */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return chars.join("").slice(0, 2);
}
