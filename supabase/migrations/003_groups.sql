-- TriLink: Groups feature — run in Supabase SQL Editor

-- ─── GROUPS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_read"   ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "groups_insert" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "groups_delete" ON public.groups FOR DELETE USING (auth.uid() = created_by);

-- ─── GROUP MEMBERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'athlete' CHECK (role IN ('coach','athlete')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_read"   ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members_insert" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete" ON public.group_members FOR DELETE USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT created_by FROM public.groups WHERE id = group_id)
);

-- ─── GROUP POSTS (объявления) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read"   ON public.group_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert" ON public.group_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON public.group_posts FOR DELETE USING (auth.uid() = user_id);

-- ─── GROUP PLANS (тренировочные планы) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  sport      TEXT NOT NULL CHECK (sport IN ('swim','bike','run','strength','rest')),
  date       DATE NOT NULL,
  duration   INTEGER NOT NULL DEFAULT 60,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.group_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read"   ON public.group_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_insert" ON public.group_plans FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "plans_delete" ON public.group_plans FOR DELETE USING (auth.uid() = created_by);
