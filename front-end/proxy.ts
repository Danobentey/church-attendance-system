import { createSupabaseProxyClient } from "@/app/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths that are explicitly public — no authentication required.
 * Everything else is protected by default (denylist approach).
 * This means new routes added to the app are automatically protected
 * without needing to update any allowlist.
 */
const PUBLIC_PATHS = ["/login", "/api/auth/"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

function redirectWithCookies(
  url: URL,
  sourceResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { supabase, response: res } = createSupabaseProxyClient(
    request,
    response
  );

  // getUser() cryptographically verifies the JWT server-side and
  // refreshes the session token if it has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Root redirect: send to dashboard if authenticated, login if not
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/login";
    return redirectWithCookies(url, res);
  }

  // Authenticated users visiting login are sent to the dashboard
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url, res);
  }

  // Unauthenticated requests to any non-public path are blocked
  if (!user && !isPublicPath(pathname)) {
    // API routes get a JSON 401; page routes get a redirect to /login
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return redirectWithCookies(url, res);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
