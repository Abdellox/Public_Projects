import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const protectedRoutes: Record<string, string[]> = {
  candidate: ["/candidate"],
  company: ["/company"],
  admin: ["/admin"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role as keyof typeof protectedRoutes | undefined;

  const isProtected = Object.values(protectedRoutes).some((prefixes) =>
    prefixes.some((p) => nextUrl.pathname.startsWith(p))
  );

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
  }

  if (isLoggedIn && isProtected) {
    const allowed = role ? (protectedRoutes[role] ?? []) : [];
    const hasAccess = allowed.some((p) => nextUrl.pathname.startsWith(p));
    if (!hasAccess) {
      const dashboard = role === "candidate" ? "/candidate" : role === "company" ? "/company" : "/admin";
      return NextResponse.redirect(new URL(dashboard, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/candidate/:path*", "/company/:path*", "/admin/:path*"],
};
