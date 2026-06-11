-- Migration: 026_user_settings.sql
-- Adds a JSONB settings column to the users table for persisting per-user
-- preferences (notifications, language, timezone, appearance).
-- Additive only — existing rows default to an empty object.
-- RLS: "Users can update own profile" on the users table already covers
-- UPDATE where id = auth.uid(), so no new policy is needed.

ALTER TABLE users ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;
