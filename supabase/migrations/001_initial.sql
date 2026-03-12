-- TriLink Database Schema — run this in Supabase SQL Editor
-- Includes: strava_tokens, workouts, calendar_events, profiles

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  email        TEXT,
  hr_max       INTEGER DEFAULT 190,
  hr_rest      INTEGER DEFAULT 48,
  last_seen    TIMESTAMPTZ,
  workout_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── WORKOUTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_id   BIGINT UNIQUE,                   -- NULL for manual entries
  title       TEXT NOT NULL,
  sport       TEXT NOT NULL CHECK (sport IN ('swim','bike','run','strength','rest')),
  date        DATE NOT NULL,
  duration    INTEGER NOT NULL,                -- minutes
  distance    NUMERIC,                         -- km
  avg_hr      INTEGER,
  max_hr      INTEGER,
  avg_pace    TEXT,                            -- "mm:ss" per km
  calories    INTEGER,
  tss         INTEGER,
  rpe         INTEGER,
  notes       TEXT,
  source      TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('strava','manual','planned')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workouts_own" ON public.workouts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_strava_id  ON public.workouts(strava_id);

-- ─── CALENDAR EVENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  sport      TEXT NOT NULL CHECK (sport IN ('swim','bike','run','strength','rest')),
  date       DATE NOT NULL,
  duration   INTEGER NOT NULL DEFAULT 60,      -- minutes
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  rpe        INTEGER,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_own" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON public.calendar_events(user_id, date);

-- ─── STRAVA TOKENS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.strava_tokens (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
  expires_at       BIGINT NOT NULL,            -- Unix timestamp
  athlete_id       BIGINT,
  athlete_name     TEXT,
  last_sync_at     TIMESTAMPTZ,
  activities_count INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.strava_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strava_tokens_own" ON public.strava_tokens FOR ALL USING (auth.uid() = user_id);

-- ─── AUTO UPDATE workout_count IN PROFILES ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_workout_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET workout_count = workout_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET workout_count = GREATEST(0, workout_count - 1) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_workout_count ON public.workouts;
CREATE TRIGGER trg_workout_count
  AFTER INSERT OR DELETE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_workout_count();
