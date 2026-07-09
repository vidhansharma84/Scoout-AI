// PUT /api/internal/v1/clip-upload/[token]
// One-shot uploader for clips + thumbnails. Token binds this URL to a
// specific key + expiry; body is the raw bytes.

import { NextResponse } from "next/server";
import { authorizeWorker } from "@/lib/worker-auth";
import { verifyUploadToken, writeClip } from "@/lib/clip-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Allow big bodies for MP4s. Next 15 default is 1MB; we bump per-route.
export const maxDuration = 60;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  // Worker bearer auth still required, in addition to the URL signature.
  if (!authorizeWorker(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await params;
  const verified = await verifyUploadToken(token);
  if (!verified) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const arrayBuf = await req.arrayBuffer();
  if (arrayBuf.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }
  // Sanity cap so a bogus worker can't fill the disk.
  const MAX = 50 * 1024 * 1024;
  if (arrayBuf.byteLength > MAX) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  await writeClip(verified.key, Buffer.from(arrayBuf));
  return NextResponse.json({
    key: verified.key,
    bytes: arrayBuf.byteLength,
  });
}
