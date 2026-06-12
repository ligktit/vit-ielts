-- ============================================================================
-- Community — Posts feature
-- Migration: 031_community_posts.sql
-- Description:
--   General-purpose community post feed. Posts may be scoped to a club
--   (club_id NOT NULL) or posted to the general feed (club_id NULL).
--   Author name/initials are resolved at query time by joining public.users.
-- ============================================================================

-- ===========================
-- TABLE
-- ===========================

CREATE TABLE public.community_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id    UUID          REFERENCES clubs(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_club ON community_posts(club_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Public read — anyone (even anon) can read posts
CREATE POLICY "Community posts are publicly readable"
  ON community_posts FOR SELECT
  USING (true);

-- Authenticated users can insert their own posts
CREATE POLICY "Users can create their own posts"
  ON community_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON community_posts TO anon, authenticated;
GRANT INSERT, DELETE ON community_posts TO authenticated;

-- ============================================================================
-- SEED DATA (idempotent via created_at uniqueness — no natural unique key,
-- so we skip ON CONFLICT and rely on a guard: only insert when table is empty)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM community_posts LIMIT 1) THEN
    INSERT INTO community_posts (user_id, club_id, title, body)
    SELECT
      u.id,
      NULL,
      seed.title,
      seed.body
    FROM (
      VALUES
        ('How do you paraphrase the question fast?',
         'I usually read the question twice and try to swap key nouns with synonyms. Any faster tricks?'),
        ('Best resources for Part 3 ideas?',
         'I struggle with abstract questions in Part 3. What sources do you use to build vocabulary of ideas?'),
        ('Got 8.0 — here''s my 30-day routine',
         'Sharing my study schedule that got me from 6.5 to 8.0 in a single month. Happy to answer questions!'),
        ('Listening Section 4 always trips me up',
         'Section 4 monologue is brutal. Anyone have a strategy for keeping up with academic lectures?')
    ) AS seed(title, body)
    CROSS JOIN (SELECT id FROM users ORDER BY created_at LIMIT 1) u;
  END IF;
END;
$$;
