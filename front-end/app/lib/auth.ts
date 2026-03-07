import { cache } from "react";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the current user's profile from public.users (role, zoneId, etc.)
 * or null if not logged in or no profile row.
 * Use in Server Components or Server Actions.
 * Wrapped with React cache() so repeated calls within the same request
 * (e.g. layout + dashboard page) share a single Supabase + DB round-trip.
 */
export const getProfile = cache(async function getProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!profile) return null;

  // Inactive users are denied access even if their JWT is still valid.
  // When deactivating a user, also revoke their session via the admin API.
  if (profile.status !== "active") return null;

  return profile;
});
