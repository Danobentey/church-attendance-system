import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptionsWithName,
} from "@supabase/ssr";
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

/** Options for createServerClient using getAll/setAll (non-deprecated API). */
type ServerClientCookieOptions = {
  cookies: CookieMethodsServer;
  cookieOptions?: CookieOptionsWithName;
  cookieEncoding?: "raw" | "base64url";
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
    },
  };

  const options: ServerClientCookieOptions = { cookies: cookieMethods };
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!session && isAppPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
