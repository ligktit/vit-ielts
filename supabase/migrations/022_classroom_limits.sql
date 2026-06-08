-- ============================================================================
-- Classroom — testing-phase limits
-- Migration: 022_classroom_limits.sql
--
-- Testing phase: ANY authenticated account can create a class (no global
-- teacher role required), capped at 10 classes per owner and 50 active
-- students per class.
-- ============================================================================

-- Let any signed-in user create a class (was: teacher/admin only).
DROP POLICY IF EXISTS "Teachers create classrooms" ON classrooms;

CREATE POLICY "Anyone creates classrooms"
  ON classrooms FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Max 10 classes per owner.
CREATE OR REPLACE FUNCTION enforce_classroom_owner_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM classrooms WHERE owner_id = NEW.owner_id) >= 10 THEN
    RAISE EXCEPTION 'CLASS_LIMIT_REACHED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_classroom_owner_limit ON classrooms;
CREATE TRIGGER trg_classroom_owner_limit
  BEFORE INSERT ON classrooms
  FOR EACH ROW EXECUTE FUNCTION enforce_classroom_owner_limit();

-- Max 50 active students per class (checked when a row becomes an active
-- student — covers teacher-add and approving a pending request).
CREATE OR REPLACE FUNCTION enforce_classroom_student_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' AND NEW.status = 'active' THEN
    IF (
      SELECT count(*) FROM classroom_members
      WHERE classroom_id = NEW.classroom_id
        AND role = 'student' AND status = 'active'
        AND user_id <> NEW.user_id
    ) >= 50 THEN
      RAISE EXCEPTION 'STUDENT_LIMIT_REACHED';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_classroom_student_limit ON classroom_members;
CREATE TRIGGER trg_classroom_student_limit
  BEFORE INSERT OR UPDATE ON classroom_members
  FOR EACH ROW EXECUTE FUNCTION enforce_classroom_student_limit();
