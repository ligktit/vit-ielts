-- ============================================================================
-- Classroom — class image
-- Migration: 023_classroom_image.sql
--
-- Optional class avatar/cover image (public URL stored after VPS upload).
-- The existing "Class teachers update classroom" UPDATE policy covers writing it.
-- ============================================================================

ALTER TABLE classrooms
  ADD COLUMN IF NOT EXISTS image_url TEXT;
