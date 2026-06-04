-- 015_posts_skill_tags_featured.sql
-- Adds blog taxonomy fields needed for the /ielts-prediction blog redesign:
--   - skill:       which IELTS skill the article is about (for per-skill sections + filter)
--   - tags:        topic keywords shown as #chips and aggregated into "Popular Keywords"
--   - is_featured: marks the article shown in the "Featured Article" hero
-- All additive and nullable/defaulted — safe to run on a live database.

ALTER TABLE public.posts
    ADD COLUMN IF NOT EXISTS skill TEXT,
    ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Optional helper indexes for filtering.
CREATE INDEX IF NOT EXISTS posts_skill_idx ON public.posts (skill);
CREATE INDEX IF NOT EXISTS posts_is_featured_idx ON public.posts (is_featured);
