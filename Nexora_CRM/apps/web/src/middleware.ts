import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'nx_session';

const PROTECTED_PREFIXES = ['/app', '/onboarding'];

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const path = request.nextUrl.pathname;

  if (!hasSession && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/onboarding'],
};
