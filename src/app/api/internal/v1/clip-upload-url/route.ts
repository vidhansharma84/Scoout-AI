// POST /api/internal/v1/clip-upload-url
// Worker calls this to reserve a fresh key + get a one-shot signed PUT URL.
// Body: { kind?: "mp4" | "jpg" } — default mp4.

import { NextResponse } from "next/server";
import { authorizeWorker } from "@/lib/worker-auth";
import { newKey, signUploadToken } from "@/lib/clip-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!authorizeWorker(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let kind: "mp4" | "jpg" = "mp4";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.kind === "jpg") kind = "jpg";
  } catch {
    /* body is optional */
  }
  const key = newKey(kind);
  const token = await signUploadToken(key);
  return NextResponse.json({
    key,
    uploadUrl: `/api/internal/v1/clip-upload/${token}`,
    expiresIn: 300,
  });
}
