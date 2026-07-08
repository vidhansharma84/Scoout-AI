import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import {
  ACCESS_COOKIE,
  verifyAccess,
} from "@/lib/portal-auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── /admin/* — lead-capture admin (HMAC cookie) ──────────────────────
  if (path.startsWith("/admin")) {
    const isLogin = path === "/admin/login";
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await verifySession(cookie);
    if (isLogin && valid) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (!isLogin && !valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── /portal/* — surveillance portal (JWT cookie) ─────────────────────
  if (path.startsWith("/portal")) {
    const publicPortalPaths = ["/portal/login", "/portal/signup"];
    const isPublic = publicPortalPaths.includes(path);
    const access = req.cookies.get(ACCESS_COOKIE)?.value;
    const payload = await verifyAccess(access);

    if (isPublic && payload) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
    if (!isPublic && !payload) {
      const url = new URL("/portal/login", req.url);
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
