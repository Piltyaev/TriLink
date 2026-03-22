import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Calendar, BarChart3,
  Waves, Bike, PersonStanding, Zap, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { icon: Activity, title: "Трекинг тренировок",  desc: "Все активности в одном месте — плавание, велосипед, бег и силовые", accent: "text-primary bg-primary/15 border-primary/30" },
  { icon: Calendar, title: "Умный календарь",      desc: "Планируй тренировочные блоки и следи за выполнением плана",         accent: "text-swim bg-swim/15 border-swim/30" },
  { icon: BarChart3, title: "Аналитика формы",     desc: "Графики нагрузки, пульса и темпа — отслеживай прогресс наглядно",  accent: "text-run bg-run/15 border-run/30" },
  { icon: Zap,      title: "Синхронизация Strava", desc: "Новые тренировки появляются автоматически сразу после финиша",      accent: "text-bike bg-bike/15 border-bike/30" },
  { icon: Map,      title: "Личные рекорды",       desc: "Фиксируй PR на дистанциях и получай значки за достижения",         accent: "text-primary bg-primary/15 border-primary/30" },
];

const stats = [
  { value: "10K+", label: "Атлетов",    color: "text-primary" },
  { value: "1M+",  label: "Тренировок", color: "text-swim" },
  { value: "50M+", label: "Километров", color: "text-bike" },
  { value: "3",    label: "Дисциплины", color: "text-run" },
];

const sports = [
  { icon: Waves,          label: "Плавание",  sub: "Open water & бассейн", color: "text-swim", bg: "bg-swim/10 border-swim/30 hover:bg-swim/20" },
  { icon: Bike,           label: "Велосипед", sub: "Шоссе & горные трассы", color: "text-bike", bg: "bg-bike/10 border-bike/30 hover:bg-bike/20" },
  { icon: PersonStanding, label: "Бег",       sub: "Трейл & асфальт",       color: "text-run",  bg: "bg-run/10 border-run/30 hover:bg-run/20" },
];

const steps = [
  { num: "01", title: "Создай аккаунт",      desc: "Регистрация за 30 секунд — никаких лишних полей",              color: "text-swim",  border: "border-swim/30",  glow: "shadow-[0_0_24px_hsl(var(--swim)/0.12)]" },
  { num: "02", title: "Подключи Strava",     desc: "Все прошлые и будущие тренировки появятся автоматически",      color: "text-bike",  border: "border-bike/30",  glow: "shadow-[0_0_24px_hsl(var(--bike)/0.12)]" },
  { num: "03", title: "Анализируй прогресс", desc: "Смотри динамику, планируй пиковую форму к гонке",              color: "text-run",   border: "border-run/30",   glow: "shadow-[0_0_24px_hsl(var(--run)/0.12)]" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" } }),
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      )}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/75 bg-clip-text text-transparent">
            TriLink
          </span>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Войти
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="gap-1.5 shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
                Начать бесплатно <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 text-center lg:pt-24 lg:pb-32 min-h-screen flex flex-col justify-center">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center z-0"
          src="/bg10.mp4"
          autoPlay muted loop playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/55 to-background/80 z-[1]" />

        <div className="relative z-[2] mx-auto max-w-5xl">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
              <Activity className="h-3.5 w-3.5" />
              Будь лучшим
            </div>
          </motion.div>

          <motion.h1
            className="font-display text-5xl font-bold leading-[1.1] tracking-tight lg:text-7xl"
            variants={fadeUp} custom={1} initial="hidden" animate="show"
          >
            Тренируйся{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-swim bg-clip-text text-transparent">
              умнее
            </span>
            ,<br className="hidden sm:block" />
            <span className="text-white/55 font-medium"> финишируй </span>
            быстрее
          </motion.h1>

          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            variants={fadeUp} custom={2} initial="hidden" animate="show"
          >
            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-[0_0_40px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] transition-shadow">
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="h-12 text-base px-8 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30">
                Уже есть аккаунт
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>


      {/* ── Disciplines ─────────────────────────────────── */}
      <section className="px-6 py-24 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <motion.p
              className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Дисциплины
            </motion.p>
            <motion.h2
              className="font-display text-4xl font-bold lg:text-5xl"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              Три дисциплины — одна платформа
            </motion.h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Waves,
                label: "Плавание",
                sub: "Open water & бассейн",
                desc: "Отслеживай метры и темп в бассейне или на открытой воде. Анализируй каждый заплыв.",
                color: "text-swim",
                border: "border-swim/30",
                bg: "bg-swim/8",
                glow: "hover:shadow-[0_0_32px_hsl(var(--swim)/0.2)]",
                stat: "Плавание",
              },
              {
                icon: Bike,
                label: "Велосипед",
                sub: "Шоссе & горные трассы",
                desc: "Контролируй мощность, каденс и набор высоты. Планируй длинные шоссейные этапы.",
                color: "text-bike",
                border: "border-bike/30",
                bg: "bg-bike/8",
                glow: "hover:shadow-[0_0_32px_hsl(var(--bike)/0.2)]",
                stat: "Велосипед",
              },
              {
                icon: PersonStanding,
                label: "Бег",
                sub: "Трейл & асфальт",
                desc: "Следи за темпом, пульсом и вертикальной нагрузкой. Готовься к финишному этапу.",
                color: "text-run",
                border: "border-run/30",
                bg: "bg-run/8",
                glow: "hover:shadow-[0_0_32px_hsl(var(--run)/0.2)]",
                stat: "Бег",
              },
            ].map((d, i) => (
              <motion.div
                key={d.label}
                className={cn(
                  "group rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 cursor-default",
                  d.border, d.bg, d.glow
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-2xl border mb-6", d.border, d.bg)}>
                  <d.icon className={cn("h-7 w-7", d.color)} />
                </div>
                <h3 className={cn("font-display text-2xl font-bold mb-1", d.color)}>{d.label}</h3>
                <p className="text-sm text-muted-foreground">{d.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section
        className="relative px-6 py-28"
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(220 18% 8% / 0.82), hsl(220 18% 8% / 0.82)), url('/bg2.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "scroll" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.p
              className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Возможности
            </motion.p>
            <motion.h2
              className="font-display text-4xl font-bold lg:text-5xl"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              Всё что нужно триатлету
            </motion.h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-start-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md p-7 transition-all duration-250 hover:bg-white/8 hover:border-white/15 hover:-translate-y-1 hover:shadow-[0_8px_32px_hsl(0_0%_0%/0.3)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                viewport={{ once: true }}
              >
                <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl border mb-5", f.accent)}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="py-28 bg-card/40">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <motion.p
              className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Быстрый старт
            </motion.p>
            <motion.h2
              className="font-display text-4xl font-bold lg:text-5xl"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              Три шага до результата
            </motion.h2>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-swim/40 via-bike/40 to-run/40" />

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className={cn(
                  "relative rounded-2xl border bg-card p-7 transition-all duration-200 hover:-translate-y-1",
                  s.border, s.glow
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                viewport={{ once: true }}
              >
                <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold mb-5", s.border, s.color, "bg-card")}>
                  {s.num}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Footer ────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-28 pb-8 text-center md:min-h-[650px] md:flex md:flex-col md:justify-between">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center z-0"
          src="/bg8.MP4"
          autoPlay muted loop playsInline
          preload="none"
        />
        <div className="absolute inset-0 bg-background/70 z-[1]" />

        <div className="relative z-[2] mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4">Присоединяйся</p>
            <h2 className="font-display text-4xl font-bold mb-5 lg:text-6xl">
              Готов к старту?
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
              Тысячи атлетов уже становятся легендами.<br className="hidden sm:block" />Начни прямо сейчас.
            </p>
            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-10 h-12 text-base shadow-[0_0_40px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] transition-shadow">
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="relative z-[2] mx-auto w-full max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row pt-6">
          <p className="text-xs text-white/35">© {new Date().getFullYear()} TriLink. Created by Piltyayev Vladimir.</p>
          <div className="flex items-center gap-4 text-xs text-white/35">
            <Link to="/auth/login" className="hover:text-white/70 transition-colors">Войти</Link>
            <Link to="/auth/register" className="hover:text-white/70 transition-colors">Регистрация</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
