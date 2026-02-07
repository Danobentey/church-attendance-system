import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is not set");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is not set");
}

// Public client (respects RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client (bypasses RLS — use only in trusted server-side contexts)
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  }

  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
