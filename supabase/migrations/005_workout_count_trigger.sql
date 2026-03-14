-- Триггер для автоматического подсчёта workout_count в profiles
CREATE OR REPLACE FUNCTION public.update_workout_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET workout_count = (
      SELECT COUNT(*) FROM public.workouts WHERE user_id = NEW.user_id
    ) WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET workout_count = (
      SELECT COUNT(*) FROM public.workouts WHERE user_id = OLD.user_id
    ) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_workout_count ON public.workouts;
CREATE TRIGGER trg_workout_count
  AFTER INSERT OR DELETE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_workout_count();
