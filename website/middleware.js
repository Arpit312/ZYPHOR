import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("zyphor_session")?.value;
  
  let user = null;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      user = JSON.parse(atob(payloadBase64));
    } catch (e) {
      user = null;
    }
  }

  // Admin routes - requires admin role
  if (pathname.startsWith("/admin") && (!user || user.role !== "admin")) {
    return NextResponse.redirect(new URL("/login?redirect=/admin/dashboard", request.url));
  }
  
  // Dashboard routes - requires authenticated user
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
