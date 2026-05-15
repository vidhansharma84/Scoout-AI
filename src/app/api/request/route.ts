import { NextResponse } from "next/server";
import { saveSubmission } from "@/lib/submissions";

export const runtime = "nodejs";

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n).trim();

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = clip(body.name, 200);
  const phone = clip(body.phone, 50);
  const email = clip(body.email, 200);

  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "name, phone, and email are required" },
      { status: 400 }
    );
  }

  const rec = await saveSubmission({
    name,
    phone,
    email,
    city: clip(body.city, 100),
    businessName: clip(body.businessName, 200),
    businessType: clip(body.businessType, 200),
  });

  return NextResponse.json({ ok: true, id: rec.id });
}
