-- ============================================================================
-- Community — Clubs (Speaking / Study Groups) feature
-- Migration: 029_community_clubs.sql
-- Description:
--   Public club catalogue that any authenticated user can browse and join/leave.
--   Member counts are derived from club_members rows.
-- ============================================================================

-- ===========================
-- TABLES
-- ===========================

CREATE TABLE public.clubs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  tagline    TEXT,
  level      TEXT NOT NULL DEFAULT 'All levels',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.club_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (club_id, user_id)
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_user ON club_members(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- -----------------------------------------------
-- CLUBS — public read, no direct write by users
-- -----------------------------------------------
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubs are publicly readable"
  ON clubs FOR SELECT
  USING (true);

-- -----------------------------------------------
-- CLUB MEMBERS — public read of membership counts;
-- INSERT/DELETE limited to own rows
-- -----------------------------------------------
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club memberships are publicly readable"
  ON club_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join clubs"
  ON club_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave clubs"
  ON club_members FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON clubs TO anon, authenticated;
GRANT SELECT ON club_members TO anon, authenticated;
GRANT INSERT, DELETE ON club_members TO authenticated;

-- ============================================================================
-- SEED DATA (idempotent)
-- ============================================================================

INSERT INTO clubs (name, tagline, level) VALUES
  ('Daily Speaking Club',      'Open practice every evening',    'All levels'),
  ('Band 7+ Circle',           'Advanced fluency & ideas',       'Advanced'),
  ('Pronunciation Lab',        'Sounds, stress & intonation',    'Intermediate'),
  ('Writing Feedback Group',   'Peer-review essays together',    'All levels')
ON CONFLICT (name) DO NOTHING;
