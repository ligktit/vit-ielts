-- ============================================================================
-- Classroom — per-class member display name (teacher-editable)
-- Migration: 021_classroom_member_display_name.sql
--
-- Lets a teacher set a name for a member shown only inside this class, without
-- changing the member's account name. Falls back to users.name when null.
-- The existing "Teacher updates member roles" UPDATE policy already covers
-- writing this column (is_classroom_teacher), so no new policy is needed.
-- ============================================================================

ALTER TABLE classroom_members
  ADD COLUMN IF NOT EXISTS display_name TEXT;
