import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase server client for use in Next.js 16 proxy (proxy.ts).
 * Uses request/response cookies since next/headers cookies are unavailable in the proxy.
 * Returns both the supabase instance and the response so the proxy can return the
 * same response (with any cookie updates from session refresh).
 */
export function createSupabaseProxyClient(
  request: NextRequest,
  response: NextResponse
) {
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options as object)
      );
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  return { supabase, response };
}
