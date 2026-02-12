import { createSupabaseProxyClient } from "@/app/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

const appPaths = [
  "/dashboard",
  "/services",
  "/check-in",
  "/people",
  "/members",
  "/attendance-log",
  "/import-export",
  "/analytics",
  "/reports",
  "/follow-ups",
  "/settings",
];

function isAppPath(pathname: string) {
  return appPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isProtectedApiPath(pathname: string) {
  return (
    pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")
  );
}

function isProtectedRoute(pathname: string) {
  return isAppPath(pathname) || isProtectedApiPath(pathname);
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { supabase, response: res } = createSupabaseProxyClient(
    request,
    response
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
