// Local filesystem-backed clip/thumbnail storage with HMAC-signed URLs.
//
// The whole point of this file: give workers a URL to PUT bytes into, and give
// portal/mobile clients a URL to GET them from — both time-limited and signed
// so nothing is publicly enumerable. Same seam as an S3 presigned URL, so
// swapping to B2/R2 in a future week is a one-file change: reimplement
// signPutUrl/signGetUrl/localPath against the S3 SDK and delete the FS code.

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// The signing secret is separate from JWT_ACCESS_SECRET so a leaked clip URL
// can't be turned into a session (and vice versa).
function secret(): string {
  const s = process.env.CLIP_SIGNING_SECRET;
  if (!s) throw new Error("CLIP_SIGNING_SECRET is not set");
  return s;
}

function storageDir(): string {
  return process.env.CLIP_STORAGE_DIR || "/opt/scoout-clips";
}

const enc = new TextEncoder();

async function hmac(secretStr: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time compare for hex signatures.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/**
 * Produce a fresh object key for a new clip. Sharded by first two chars so we
 * don't put 10k files in one directory.
 */
export function newKey(ext: "mp4" | "jpg" = "mp4"): string {
  const id = randomUUID().replace(/-/g, "");
  return `${id.slice(0, 2)}/${id}.${ext}`;
}

/** Absolute path inside CLIP_STORAGE_DIR for the given key. */
export function localPath(key: string): string {
  return path.join(storageDir(), key);
}

/**
 * Sign a one-shot upload token. Encodes { key, expires } and an HMAC over
 * both. Worker PUTs bytes to /api/internal/v1/clip-upload/[token].
 */
export async function signUploadToken(key: string, ttlSeconds: number = 300): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${key}|${expires}`;
  const sig = await hmac(secret(), "put:" + payload);
  return base64url(`${key}\n${expires}\n${sig}`);
}

/** Verify an upload token; returns { key } on success, null on failure. */
export async function verifyUploadToken(
  token: string,
): Promise<{ key: string } | null> {
  let decoded: string;
  try {
    decoded = base64urlDecode(token);
  } catch {
    return null;
  }
  const parts = decoded.split("\n");
  if (parts.length !== 3) return null;
  const [key, expiresStr, sig] = parts;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  const expected = await hmac(secret(), `put:${key}|${expires}`);
  if (!timingSafeEqual(sig, expected)) return null;
  return { key };
}

/**
 * Build a public GET URL for the given key. Signature encodes expiry so the
 * URL becomes worthless after ttlSeconds.
 */
export async function signDownloadUrl(
  key: string,
  ttlSeconds: number = 3600,
  baseUrl?: string,
): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = await hmac(secret(), `get:${key}|${expires}`);
  const path = `/api/v1/clips/${encodeURIComponent(key)}?e=${expires}&s=${sig}`;
  return baseUrl ? baseUrl + path : path;
}

/** Verify a download URL's e+s query params against a key. */
export async function verifyDownload(
  key: string,
  expires: number,
  sig: string,
): Promise<boolean> {
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret(), `get:${key}|${expires}`);
  return timingSafeEqual(sig, expected);
}

/** Write bytes to the clip storage backing store. Creates any parent dirs. */
export async function writeClip(key: string, bytes: Buffer): Promise<void> {
  const abs = localPath(key);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, bytes);
}

/** Read raw bytes for a clip. Throws if missing. */
export async function readClip(key: string): Promise<Buffer> {
  return fs.readFile(localPath(key));
}

/** Delete a clip; best-effort, ignores ENOENT. */
export async function deleteClip(key: string): Promise<void> {
  try {
    await fs.unlink(localPath(key));
  } catch {
    /* ignore */
  }
}

// ── base64url helpers (edge-compat, no node:buffer) ─────────────────────────
function base64url(s: string): string {
  return Buffer.from(s, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): string {
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf-8");
}
