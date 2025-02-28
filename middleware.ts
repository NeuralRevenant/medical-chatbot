// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // If user is trying to access /login or /register, allow
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check for session token using next-auth/jwt
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    // Not logged in => redirect to /login
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // Authenticated => continue
  return NextResponse.next();
}

// paths to match
export const config = {
  matcher: ["/", "/((?!_next|.*\\..*).*)"], // Protect all routes except static files
};
