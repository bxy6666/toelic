import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "toeic_session";

const publicPrefixes = [
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string) {
  return pathname === "/login" || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
