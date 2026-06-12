-- ============================================================================
-- VitIELTS — Personal Vocabulary
-- Migration: 032_vocab_personal.sql
-- Description:
--   Turns the vocabulary feature into a per-student personal word list.
--   * vocab_words gains an owner_id (NULL = legacy shared seed, hidden from the
--     app; set = a student's personal word) plus ipa / audio_url enrichment.
--   * Uniqueness moves from global (word) to per-owner (owner_id, word) so two
--     students can both save the same word.
--   * Owner-scoped write RLS lets a student CRUD only their own words.
--   * vocab_activity logs add/review events to power streaks and charts.
--   All changes are additive / idempotent — safe to run on an existing DB.
-- ============================================================================

-- ===========================
-- vocab_words — ownership + enrichment
-- ===========================

ALTER TABLE public.vocab_words
  ADD COLUMN IF NOT EXISTS owner_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS ipa       TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Replace the global UNIQUE(word) (from 028) with per-owner uniqueness.
ALTER TABLE public.vocab_words DROP CONSTRAINT IF EXISTS vocab_words_word_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vocab_words_owner_word_key'
  ) THEN
    ALTER TABLE public.vocab_words
      ADD CONSTRAINT vocab_words_owner_word_key UNIQUE (owner_id, word);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vocab_words_owner ON public.vocab_words(owner_id);

-- ===========================
-- vocab_words — owner-scoped write RLS
-- (public SELECT policy from 028 is kept; the app filters to owner_id = me)
-- ===========================

DROP POLICY IF EXISTS "Owners insert own vocab_words" ON public.vocab_words;
CREATE POLICY "Owners insert own vocab_words"
  ON public.vocab_words FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners update own vocab_words" ON public.vocab_words;
CREATE POLICY "Owners update own vocab_words"
  ON public.vocab_words FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners delete own vocab_words" ON public.vocab_words;
CREATE POLICY "Owners delete own vocab_words"
  ON public.vocab_words FOR DELETE
  USING (owner_id = auth.uid());

GRANT INSERT, UPDATE, DELETE ON public.vocab_words TO authenticated;

-- ===========================
-- vocab_activity — add / review event log (streaks + charts)
-- ===========================

CREATE TABLE IF NOT EXISTS public.vocab_activity (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id    UUID REFERENCES vocab_words(id) ON DELETE SET NULL,
  action     TEXT NOT NULL CHECK (action IN ('add', 'review')),
  remembered BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vocab_activity_user_created
  ON public.vocab_activity (user_id, created_at);

ALTER TABLE public.vocab_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own vocab activity" ON public.vocab_activity;
CREATE POLICY "Users manage own vocab activity"
  ON public.vocab_activity FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.vocab_activity TO authenticated;
