import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/home", "/departments", "/people", "/settings", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("nexora_session");

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/home/:path*",
    "/departments/:path*",
    "/people/:path*",
    "/settings/:path*",
    "/onboarding"
  ]
};
