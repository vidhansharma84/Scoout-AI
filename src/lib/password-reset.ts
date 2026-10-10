// Shared bits for "forgot password": 6-digit codes sent by SMS (phone
// accounts) or email. Only a hash is stored; codes live 10 minutes and allow
// 5 guesses.

import { createHash, randomInt } from "crypto";

export const RESET_TTL_MS = 10 * 60 * 1000;
export const RESET_MAX_ATTEMPTS = 5;

export function newResetCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

// Salted with the user id so the same code for two users hashes differently.
export function hashResetCode(userId: string, code: string): string {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}
