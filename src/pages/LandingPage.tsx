import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Calendar, BarChart3,
  Waves, Bike, PersonStanding, Zap, Map, ChevronDown,
  TrendingUp, Shield, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { num: "01", icon: Activity,  title: "Трекинг тренировок",  desc: "Все активности в одном месте — плавание, велосипед, бег и силовые", accent: "text-primary bg-primary/15 border-primary/30",  bar: "bg-primary" },
  { num: "02", icon: Calendar,  title: "Умный календарь",      desc: "Планируй тренировочные блоки и следи за выполнением плана",         accent: "text-swim bg-swim/15 border-swim/30",             bar: "bg-swim" },
  { num: "03", icon: BarChart3, title: "Аналитика формы",      desc: "Графики нагрузки, пульса и темпа — отслеживай прогресс наглядно",  accent: "text-run bg-run/15 border-run/30",                bar: "bg-run" },
  { num: "04", icon: Zap,       title: "Синхронизация Strava", desc: "Новые тренировки появляются автоматически сразу после финиша",      accent: "text-bike bg-bike/15 border-bike/30",             bar: "bg-bike" },
  { num: "05", icon: Map,       title: "Личные рекорды",       desc: "Фиксируй PR на дистанциях и получай значки за достижения",         accent: "text-primary bg-primary/15 border-primary/30",   bar: "bg-primary" },
];

const steps = [
  { num: "01", title: "Создай аккаунт",      desc: "Регистрация за 30 секунд — никаких лишних полей",         color: "text-swim",  border: "border-swim/40",  bg: "bg-swim/10",  glow: "shadow-[0_0_32px_hsl(var(--swim)/0.15)]",  icon: Shield },
  { num: "02", title: "Подключи Strava",     desc: "Все прошлые и будущие тренировки появятся автоматически", color: "text-bike",  border: "border-bike/40",  bg: "bg-bike/10",  glow: "shadow-[0_0_32px_hsl(var(--bike)/0.15)]",  icon: Zap },
  { num: "03", title: "Анализируй прогресс", desc: "Смотри динамику, планируй пиковую форму к гонке",         color: "text-run",   border: "border-run/40",   bg: "bg-run/10",   glow: "shadow-[0_0_32px_hsl(var(--run)/0.15)]",   icon: TrendingUp },
];

const disciplines = [
  {
    icon: Waves,
    label: "Плавание",
    sub: "Open water & бассейн",
    color: "text-swim",
    border: "border-swim/30",
    bg: "bg-swim/8",
    glow: "hover:shadow-[0_0_48px_hsl(var(--swim)/0.25)]",
    metrics: ["Темп / 100м", "Объём (км)", "SWOLF"],
    accent: "from-swim/20 to-transparent",
  },
  {
    icon: Bike,
    label: "Велосипед",
    sub: "Шоссе & горные трассы",
    color: "text-bike",
    border: "border-bike/30",
    bg: "bg-bike/8",
    glow: "hover:shadow-[0_0_48px_hsl(var(--bike)/0.25)]",
    metrics: ["Мощность (Вт)", "Каденс", "Набор (м)"],
    accent: "from-bike/20 to-transparent",
  },
  {
    icon: PersonStanding,
    label: "Бег",
    sub: "Трейл & асфальт",
    color: "text-run",
    border: "border-run/30",
    bg: "bg-run/8",
    glow: "hover:shadow-[0_0_48px_hsl(var(--run)/0.25)]",
    metrics: ["Темп (мин/км)", "ЧСС", "Шаг"],
    accent: "from-run/20 to-transparent",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
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
        scrolled ? "bg-background/90 backdrop-blur-2xl border-b border-white/8 shadow-[0_1px_24px_hsl(0_0%_0%/0.4)]" : "bg-transparent"
      )}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            TriLink
          </span>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/65 hover:text-white hover:bg-white/10 text-sm">
                Войти
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="gap-1.5 text-sm shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_32px_hsl(var(--primary)/0.55)] transition-shadow">
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/85 z-[1]" />

        <div className="relative z-[2] mx-auto max-w-5xl">

          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Будь лучшим
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-5xl font-bold leading-[1.1] tracking-tight lg:text-7xl"
            variants={fadeUp} custom={1} initial="hidden" animate="show"
          >
            Тренируйся{" "}
            <span className="bg-gradient-to-r from-primary via-blue-400 to-swim bg-clip-text text-transparent">
              умнее
            </span>
            ,<br className="hidden sm:block" />
            <span className="text-white/50 font-medium"> финишируй </span>
            быстрее
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="mt-6 text-lg text-white/55 max-w-xl mx-auto leading-relaxed"
            variants={fadeUp} custom={2} initial="hidden" animate="show"
          >
            Полная платформа для триатлетов — трекинг, аналитика и планирование в одном месте.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            variants={fadeUp} custom={3} initial="hidden" animate="show"
          >
            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-[0_0_40px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_56px_hsl(var(--primary)/0.65)] transition-shadow">
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="h-12 text-base px-8 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30">
                Уже есть аккаунт
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
            variants={fadeUp} custom={4} initial="hidden" animate="show"
          >
            <div className="flex items-center gap-2 text-white/45 text-sm">
              <div className="flex -space-x-2">
                {["bg-swim/60","bg-bike/60","bg-run/60","bg-primary/60"].map((c,i) => (
                  <div key={i} className={cn("h-7 w-7 rounded-full border-2 border-background/80 flex items-center justify-center", c)}>
                    <span className="text-[9px] font-bold text-white">{["А","В","И","М"][i]}</span>
                  </div>
                ))}
              </div>
              <span>10,000+ атлетов уже тренируются</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/15" />
            <div className="flex items-center gap-1 text-white/45 text-sm">
              {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-yellow-400/70 text-yellow-400/70" />)}
              <span className="ml-1">4.9 рейтинг</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-1 text-white/30"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        >
          <span className="text-xs tracking-widest uppercase">Листай</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </section>


      {/* ── Disciplines ─────────────────────────────────── */}
      <section className="px-6 py-28 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.p
              className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-3"
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
            <motion.p
              className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
            >
              Глубокая аналитика по каждому виду спорта в триатлоне
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {disciplines.map((d, i) => (
              <motion.div
                key={d.label}
                className={cn(
                  "group relative rounded-2xl border overflow-hidden p-8 transition-all duration-300 hover:-translate-y-2 cursor-default",
                  d.border, d.bg, d.glow
                )}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                {/* Top gradient accent */}
                <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r", d.accent)} />

                <div className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl border mb-6 transition-transform duration-300 group-hover:scale-110", d.border, d.bg)}>
                  <d.icon className={cn("h-8 w-8", d.color)} />
                </div>

                <h3 className={cn("font-display text-2xl font-bold mb-1", d.color)}>{d.label}</h3>
                <p className="text-sm text-muted-foreground mb-6">{d.sub}</p>

                {/* Metric chips */}
                <div className="flex flex-wrap gap-2">
                  {d.metrics.map(m => (
                    <span key={m} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", d.border, d.bg, d.color)}>
                      {m}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section
        className="relative px-6 py-28"
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(220 18% 8% / 0.88), hsl(220 18% 8% / 0.88)), url('/bg2.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.p
              className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-3"
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

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-start-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md p-7 transition-all duration-300 hover:bg-white/7 hover:border-white/14 hover:-translate-y-1 hover:shadow-[0_12px_40px_hsl(0_0%_0%/0.35)] overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {/* Top accent bar */}
                <div className={cn("absolute top-0 left-6 right-6 h-px opacity-60", f.bar)} />

                <div className="flex items-start justify-between mb-5">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl border", f.accent)}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-white/15 tabular-nums">{f.num}</span>
                </div>
                <h3 className="font-display text-base font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="py-28 bg-card/30">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <motion.p
              className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-3"
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
            {/* Connecting line */}
            <div className="hidden md:block absolute top-11 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-gradient-to-r from-swim/50 via-bike/50 to-run/50" />

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className={cn(
                  "relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 overflow-hidden",
                  s.border, s.glow
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.13, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {/* Step number circle */}
                <div className={cn("relative inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-extrabold mb-6 z-[1]", s.border, s.color, s.bg)}>
                  {s.num}
                </div>

                {/* Step icon (background watermark) */}
                <s.icon className={cn("absolute top-5 right-5 h-8 w-8 opacity-8", s.color)} />

                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Footer ────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-8 text-center md:min-h-[680px] md:flex md:flex-col md:justify-between">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center z-0"
          src="/bg11.mp4"
          autoPlay muted loop playsInline
          preload="none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/65 to-background/80 z-[1]" />

        <div className="relative z-[2] mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center py-10">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            {/* Trust chip */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-1.5 text-sm text-white/65">
              <div className="flex -space-x-1.5">
                {["bg-swim/70","bg-bike/70","bg-run/70"].map((c,i) => (
                  <div key={i} className={cn("h-5 w-5 rounded-full border border-background/60", c)} />
                ))}
              </div>
              10,000+ атлетов уже на борту
            </div>

            <p className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-4">Присоединяйся</p>
            <h2 className="font-display text-5xl font-bold mb-5 lg:text-6xl leading-[1.1]">
              Готов к старту?
            </h2>
            <p className="text-lg text-white/55 mb-10 max-w-lg mx-auto leading-relaxed">
              Тысячи атлетов уже становятся легендами.<br className="hidden sm:block" />Начни прямо сейчас.
            </p>

            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-12 h-13 text-base shadow-[0_0_48px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_64px_hsl(var(--primary)/0.7)] transition-shadow">
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <p className="mt-4 text-xs text-white/30">Бесплатно · Без карты · Отмена в любой момент</p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-[2] mx-auto w-full max-w-6xl border-t border-white/8 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} TriLink · Created by Piltyayev Vladimir</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link to="/auth/login" className="hover:text-white/60 transition-colors">Войти</Link>
            <Link to="/auth/register" className="hover:text-white/60 transition-colors">Регистрация</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
