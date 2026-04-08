import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env.local for credentials
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Service role client — bypasses RLS.
 * Use for test setup, cleanup, and verifying admin-only logic.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Anonymous client — respects RLS.
 * Use to simulate a standard, unauthenticated user.
 */
export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Creates an authenticated client for a specific user ID.
 * Note: This doesn't actually sign in via Supabase Auth (which requires email/pass),
 * but it can be used if you manually generate a JWT or use service role to act as a user.
 */
export function createAuthenticatedClient(jwt: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  );
}
