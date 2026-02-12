import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";
import { db } from "@/app/lib/db";
import { users } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the current user's profile from public.users (role, zoneId, etc.)
 * or null if not logged in or no profile row.
 * Use in Server Components or Server Actions.
 */
export async function getProfile() {
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

  return profile ?? null;
}
