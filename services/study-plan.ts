/**
 * Study Plan Service — IELTS Prediction
 *
 * Reads and mutates user study tasks for the Study Plan page.
 *
 * getStudyWeek  — SSR: fetch all tasks for the 7-day window starting weekStartISO,
 *                 grouped by ISO date string (YYYY-MM-DD).
 * toggleStudyTask — browser: flip the `done` flag on a single task (RLS enforced).
 *
 * Both functions degrade gracefully on error — never throw, return safe defaults.
 *
 * NOTE: The StudyTask type is defined here because services/types/database.ts is
 * being edited by another agent this round and must not be touched.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type StudyTask = {
  id: string;
  user_id: string;
  due_date: string;   // ISO date string "YYYY-MM-DD"
  title: string;
  skill: string | null;
  done: boolean;
  created_at: string;
};

/**
 * Tasks for a week keyed by ISO date string (YYYY-MM-DD).
 * Only dates that have ≥1 task are present in the map.
 */
export type StudyWeek = Record<string, StudyTask[]>;

// ============================================================================
// getStudyWeek
// ============================================================================

/**
 * Returns all study_tasks for `userId` whose due_date falls in the 7-day
 * window [weekStartISO … weekStartISO + 6 days], grouped by date.
 *
 * @param supabase     Server or browser Supabase client.
 * @param userId       The authenticated user's UUID.
 * @param weekStartISO The Monday of the target week, e.g. "2026-06-09".
 */
export async function getStudyWeek(
  supabase: SupabaseClient,
  userId: string,
  weekStartISO: string,
): Promise<StudyWeek> {
  try {
    const weekStart = new Date(weekStartISO);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndISO = weekEnd.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("study_tasks")
      .select("id, user_id, due_date, title, skill, done, created_at")
      .eq("user_id", userId)
      .gte("due_date", weekStartISO)
      .lte("due_date", weekEndISO)
      .order("created_at", { ascending: true });

    if (error || !data) {
      return {};
    }

    const grouped: StudyWeek = {};
    for (const task of data as StudyTask[]) {
      const day = task.due_date.slice(0, 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(task);
    }

    return grouped;
  } catch {
    return {};
  }
}

// ============================================================================
// toggleStudyTask
// ============================================================================

/**
 * Flip the `done` flag on a single task.
 * Intended to be called from the browser (browser Supabase client).
 * RLS ensures the user can only update their own rows.
 *
 * Returns the updated task on success, or null on failure.
 */
export async function toggleStudyTask(
  supabase: SupabaseClient,
  taskId: string,
  done: boolean,
): Promise<StudyTask | null> {
  try {
    const { data, error } = await supabase
      .from("study_tasks")
      .update({ done })
      .eq("id", taskId)
      .select("id, user_id, due_date, title, skill, done, created_at")
      .single();

    if (error || !data) {
      return null;
    }

    return data as StudyTask;
  } catch {
    return null;
  }
}
