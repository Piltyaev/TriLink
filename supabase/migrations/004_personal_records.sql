-- TriLink: Personal Records table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.personal_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport       TEXT NOT NULL CHECK (sport IN ('swim','bike','run','strength','rest')),
  discipline  TEXT NOT NULL,
  result      TEXT NOT NULL,
  date        DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "personal_records_own" ON public.personal_records FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id, sport);
