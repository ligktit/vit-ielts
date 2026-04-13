import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@supabase/supabase-js";
import { createAdminApiSupabase } from "~supabase/server";
import { supabaseAdmin } from "~supabase/admin";
import { isAdminRole } from "./parseRoles";

/**
 * Require the caller to be an authenticated administrator.
 *
 * Returns the Supabase `User` object when the caller is authorised,
 * or `null` after sending a 401 / 403 JSON response.
 *
 * Usage:
 * ```ts
 * const user = await requireAdmin(req, res);
 * if (!user) return;          // response already sent
 * // … admin-only logic …
 * ```
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  const supabase = createAdminApiSupabase(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return null;
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();

  if (!isAdminRole(profile?.roles)) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return null;
  }

  return user;
}
