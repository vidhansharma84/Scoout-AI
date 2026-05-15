import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD;

  if (!pass) {
    return new NextResponse(
      "Admin password is not configured. Set ADMIN_PASSWORD on the server.",
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  const expected = "Basic " + btoa(`${user}:${pass}`);
  if (auth !== expected) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Scoout Admin", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
