import { NextResponse } from "next/server";
import { COOKIE_NAME, createSession, timingSafeEqualString } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let username = "";
  let password = "";

  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const body = await request.json();
      username = String(body.username ?? "");
      password = String(body.password ?? "");
    } else {
      const fd = await request.formData();
      username = String(fd.get("username") ?? "");
      password = String(fd.get("password") ?? "");
    }
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) {
    return NextResponse.json(
      { error: "Admin is not configured on the server." },
      { status: 500 },
    );
  }

  const ok =
    timingSafeEqualString(username, expectedUser) &&
    timingSafeEqualString(password, expectedPass);

  if (!ok) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const session = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: session.expires,
    path: "/",
  });
  return res;
}
