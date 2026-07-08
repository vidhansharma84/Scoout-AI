// Shared-secret bearer auth for /api/internal/v1/*. Workers (mock today, real
// GPU tomorrow) present the WORKER_TOKEN env var as an Authorization header.
//
// Not tenant-scoped: a worker sees all shops it's assigned to. Which cameras
// a worker owns is decided by the assignment endpoint (currently "all").

const encoder = new TextEncoder();

/**
 * Constant-time equality on two byte arrays of the same length.
 * Avoids leaking token length via a fast fail.
 */
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

export function authorizeWorker(req: Request): boolean {
  const secret = process.env.WORKER_TOKEN;
  if (!secret) return false; // never allow if unconfigured
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const presented = header.slice("Bearer ".length).trim();
  if (!presented) return false;
  return timingSafeEqualBytes(encoder.encode(secret), encoder.encode(presented));
}
