import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login page, auth endpoints, static assets, and favicon
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("zyphor_session")?.value;
  let user = null;

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      user = JSON.parse(atob(payloadBase64));
    } catch {
      user = null;
    }
  }

  // Guard: if not authenticated as admin, redirect to /login
  if (!user || user.role !== "admin") {
    if (pathname.startsWith("/api")) {
      // In development, allow API calls or require session
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
