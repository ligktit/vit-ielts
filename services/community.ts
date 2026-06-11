/**
 * Community Service — IELTS Prediction
 *
 * Clubs browse + join/leave. Posts/comments are out of scope.
 *
 * All functions receive SupabaseClient as first param (browser / SSR).
 * Types are defined here; do NOT edit services/types/database.ts.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export interface Club {
  id: string;
  name: string;
  tagline: string | null;
  level: string;
  created_at: string;
  /** Total members in this club (derived from club_members count). */
  member_count: number;
  /** Whether the current viewer is already a member. False when unauthenticated. */
  joined: boolean;
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all clubs enriched with member_count and whether `userId` has joined.
 * Pass `userId = null` for unauthenticated visitors (joined will always be false).
 */
export async function getClubs(
  supabase: SupabaseClient,
  userId: string | null
): Promise<Club[]> {
  try {
    // Fetch clubs and their member counts in one query using a left join aggregate.
    const { data: rows, error } = await supabase
      .from("clubs")
      .select(`
        id,
        name,
        tagline,
        level,
        created_at,
        club_members(count)
      `)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // If authenticated, also fetch which clubs the user has joined.
    let joinedSet = new Set<string>();
    if (userId) {
      const { data: memberships, error: mErr } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("user_id", userId);
      if (!mErr && memberships) {
        joinedSet = new Set(memberships.map((m) => m.club_id as string));
      }
    }

    return (rows ?? []).map((row) => {
      // Supabase returns the aggregate count as an array with a single object
      // when using a one-to-many relation count: [{ count: N }]
      const countValue = Array.isArray(row.club_members)
        ? ((row.club_members[0] as { count: number } | undefined)?.count ?? 0)
        : 0;

      return {
        id: row.id as string,
        name: row.name as string,
        tagline: (row.tagline as string | null) ?? null,
        level: (row.level as string) ?? "All levels",
        created_at: row.created_at as string,
        member_count: Number(countValue),
        joined: userId ? joinedSet.has(row.id as string) : false,
      };
    });
  } catch {
    return [];
  }
}

// ============================================================================
// Mutations (browser client only)
// ============================================================================

export async function joinClub(
  supabase: SupabaseClient,
  params: { clubId: string; userId: string }
): Promise<void> {
  const { error } = await supabase
    .from("club_members")
    .insert({ club_id: params.clubId, user_id: params.userId });
  if (error) throw error;
}

export async function leaveClub(
  supabase: SupabaseClient,
  params: { clubId: string; userId: string }
): Promise<void> {
  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", params.clubId)
    .eq("user_id", params.userId);
  if (error) throw error;
}
