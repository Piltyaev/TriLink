-- TriLink: Replace Strava with Garmin Connect
-- Run this in Supabase SQL Editor AFTER 001_initial.sql

-- ─── 1. Add garmin_activity_id to workouts ────────────────────────────────────
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS garmin_activity_id BIGINT UNIQUE;

-- ─── 2. Update source CHECK constraint ────────────────────────────────────────
-- Drop old constraint and add new one that allows 'garmin'
ALTER TABLE public.workouts
  DROP CONSTRAINT IF EXISTS workouts_source_check;

ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_source_check
  CHECK (source IN ('garmin', 'manual', 'planned'));

-- ─── 3. Create garmin_tokens table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.garmin_tokens (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oauth_token        TEXT NOT NULL,
  oauth_token_secret TEXT NOT NULL,
  garmin_user_id     TEXT,
  display_name       TEXT,
  last_sync_at       TIMESTAMPTZ,
  activities_count   INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.garmin_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "garmin_tokens_own" ON public.garmin_tokens FOR ALL USING (auth.uid() = user_id);

-- ─── 4. Index for garmin_activity_id ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workouts_garmin_id ON public.workouts(garmin_activity_id);
