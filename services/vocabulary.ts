/**
 * Vocabulary Service — IELTS Prediction
 *
 * Manages the shared vocab_words corpus and per-user learning progress
 * stored in user_vocab.
 *
 * Types are defined here — do NOT edit services/types/database.ts for this
 * feature.
 *
 * Usage in getServerSideProps (server-side Supabase client):
 *   const overview = await getVocabularyOverview(supabase, user.id);
 *
 * Usage in browser (optimistic toggle):
 *   await setWordStatus(createClient(), { userId, wordId, status });
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type WordStatus = "learning" | "learned" | "new";

export type VocabWordRow = {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  topic: string | null;
  skill: string | null;
  created_at: string;
};

export type UserVocabRow = {
  id: string;
  user_id: string;
  word_id: string;
  status: "learning" | "learned";
  created_at: string;
};

/** A corpus word enriched with the current user's progress status. */
export type VocabWordWithStatus = VocabWordRow & {
  /** 'new' when the user has no row in user_vocab for this word. */
  userStatus: WordStatus;
};

export type VocabStats = {
  total: number;
  learned: number;
  learning: number;
};

export type VocabularyOverview = {
  words: VocabWordWithStatus[];
  stats: VocabStats;
};

// ============================================================================
// Helpers
// ============================================================================

const EMPTY_OVERVIEW: VocabularyOverview = {
  words: [],
  stats: { total: 0, learned: 0, learning: 0 },
};

// ============================================================================
// Read — getVocabularyOverview
// ============================================================================

/**
 * Fetches every word in vocab_words and merges the user's user_vocab rows to
 * produce a combined list and summary stats.
 *
 * Works for authenticated users; unauthenticated callers get an empty overview
 * (the page guards against that via withAuth, but defensive fallback is kept).
 */
export async function getVocabularyOverview(
  supabase: SupabaseClient,
  userId: string | null | undefined
): Promise<VocabularyOverview> {
  try {
    // 1. Fetch corpus (public read — no auth needed)
    const { data: words, error: wordsError } = await supabase
      .from("vocab_words")
      .select("*")
      .order("created_at", { ascending: true });

    if (wordsError) {
      console.error("[vocabulary] vocab_words fetch error:", wordsError.message);
      return EMPTY_OVERVIEW;
    }

    const corpus: VocabWordRow[] = words ?? [];

    if (corpus.length === 0) {
      return EMPTY_OVERVIEW;
    }

    // 2. Fetch this user's progress (only when authenticated)
    let progressMap = new Map<string, "learning" | "learned">();

    if (userId) {
      const { data: progress, error: progressError } = await supabase
        .from("user_vocab")
        .select("word_id, status")
        .eq("user_id", userId);

      if (progressError) {
        // Non-fatal: show corpus but treat all as 'new'
        console.error(
          "[vocabulary] user_vocab fetch error:",
          progressError.message
        );
      } else {
        for (const row of progress ?? []) {
          progressMap.set(row.word_id, row.status as "learning" | "learned");
        }
      }
    }

    // 3. Merge
    const enriched: VocabWordWithStatus[] = corpus.map((w) => ({
      ...w,
      userStatus: (progressMap.get(w.id) ?? "new") as WordStatus,
    }));

    // 4. Stats
    let learned = 0;
    let learning = 0;
    for (const w of enriched) {
      if (w.userStatus === "learned") learned++;
      else if (w.userStatus === "learning") learning++;
    }

    return {
      words: enriched,
      stats: { total: corpus.length, learned, learning },
    };
  } catch (err) {
    console.error("[vocabulary] unexpected error in getVocabularyOverview:", err);
    return EMPTY_OVERVIEW;
  }
}

// ============================================================================
// Write — setWordStatus
// ============================================================================

export type SetWordStatusArgs = {
  userId: string;
  wordId: string;
  /** Pass null to delete the user_vocab row (reset word back to 'new'). */
  status: "learning" | "learned" | null;
};

/**
 * Upserts or deletes a user_vocab row.
 *
 * Call from the browser using createClient() for optimistic UI updates.
 * The caller should apply optimistic state before awaiting this function.
 */
export async function setWordStatus(
  supabase: SupabaseClient,
  { userId, wordId, status }: SetWordStatusArgs
): Promise<void> {
  if (status === null) {
    // Reset to 'new' — remove the row
    const { error } = await supabase
      .from("user_vocab")
      .delete()
      .eq("user_id", userId)
      .eq("word_id", wordId);

    if (error) {
      throw new Error(`[vocabulary] delete user_vocab failed: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase.from("user_vocab").upsert(
    { user_id: userId, word_id: wordId, status },
    { onConflict: "user_id,word_id" }
  );

  if (error) {
    throw new Error(`[vocabulary] upsert user_vocab failed: ${error.message}`);
  }
}
