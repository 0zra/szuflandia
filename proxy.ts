import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/app/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to /login without authentication
  if (pathname === "/login") {
    // If already authenticated, redirect to home
    const session = request.cookies.get("session")?.value;
    if (session) {
      const payload = await decrypt(session);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // For all other routes, require authentication
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await decrypt(session);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
