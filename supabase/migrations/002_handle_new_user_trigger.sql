-- ============================================================================
-- Migration: 002_handle_new_user_trigger.sql
-- Description: Auto-create public.users profile when a new auth.users record
--              is created (e.g. Google OAuth sign-in, email sign-up).
--              Uses SECURITY DEFINER to bypass RLS.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture',
      NULL
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires AFTER a new row is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
