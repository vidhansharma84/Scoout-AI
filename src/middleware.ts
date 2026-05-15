import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const isLogin = req.nextUrl.pathname === "/admin/login";
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifySession(cookie);

  if (isLogin && valid) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (!isLogin && !valid) {
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
