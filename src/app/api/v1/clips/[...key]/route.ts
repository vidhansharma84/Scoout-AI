// GET /api/v1/clips/[...key]?e=<epoch>&s=<hmac>
// Serves a clip after verifying the HMAC signature + expiry.
// Signed URLs are handed out by portal + mobile detail views; the raw bytes
// (which may be sensitive) are never publicly indexable.

import { NextResponse } from "next/server";
import { readClip, verifyDownload } from "@/lib/clip-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");
  const url = new URL(req.url);
  const expires = Number(url.searchParams.get("e"));
  const sig = url.searchParams.get("s") ?? "";
  const ok = await verifyDownload(key, expires, sig);
  if (!ok) {
    return NextResponse.json({ error: "Bad signature or expired" }, { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readClip(key);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isJpg = key.endsWith(".jpg");
  const view = new Uint8Array(bytes);
  return new Response(view, {
    status: 200,
    headers: {
      "Content-Type": isJpg ? "image/jpeg" : "video/mp4",
      "Content-Length": String(view.byteLength),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
