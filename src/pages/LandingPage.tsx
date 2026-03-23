import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Calendar, BarChart3,
  Waves, Bike, PersonStanding, Zap, Map, ChevronDown,
  TrendingUp, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { num: "01", icon: Activity,  title: "Трекинг тренировок",  desc: "Все активности в одном месте — плавание, велосипед, бег и силовые", accent: "text-primary bg-primary/15 border-primary/30",  glowVar: "--primary" },
  { num: "02", icon: Calendar,  title: "Умный календарь",      desc: "Планируй тренировочные блоки и следи за выполнением плана",         accent: "text-swim bg-swim/15 border-swim/30",             glowVar: "--swim"    },
  { num: "03", icon: BarChart3, title: "Аналитика формы",      desc: "Графики нагрузки, пульса и темпа — отслеживай прогресс наглядно",  accent: "text-run bg-run/15 border-run/30",                glowVar: "--run"     },
  { num: "04", icon: Zap,       title: "Синхронизация Strava", desc: "Новые тренировки появляются автоматически сразу после финиша",      accent: "text-bike bg-bike/15 border-bike/30",             glowVar: "--bike"    },
  { num: "05", icon: Map,       title: "Личные рекорды",       desc: "Фиксируй PR на дистанциях и получай значки за достижения",         accent: "text-primary bg-primary/15 border-primary/30",   glowVar: "--primary" },
];

const steps = [
  { num: "01", title: "Создай аккаунт",      desc: "Регистрация за 30 секунд — никаких лишних полей",         color: "text-swim",  border: "border-white/10",  colorVar: "--swim",  icon: Shield     },
  { num: "02", title: "Подключи Strava",     desc: "Все прошлые и будущие тренировки появятся автоматически", color: "text-bike",  border: "border-white/10",  colorVar: "--bike",  icon: Zap        },
  { num: "03", title: "Анализируй прогресс", desc: "Смотри динамику, планируй пиковую форму к гонке",         color: "text-run",   border: "border-white/10",  colorVar: "--run",   icon: TrendingUp },
];

const disciplines = [
  { icon: Waves,          label: "Плавание",  sub: "Open water & бассейн",  color: "text-swim", border: "border-swim/30", colorVar: "--swim" },
  { icon: Bike,           label: "Велосипед", sub: "Шоссе & горные трассы", color: "text-bike", border: "border-bike/30", colorVar: "--bike" },
  { icon: PersonStanding, label: "Бег",       sub: "Трейл & асфальт",       color: "text-run",  border: "border-run/30",  colorVar: "--run"  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/92 backdrop-blur-2xl border-b border-white/8 shadow-[0_2px_32px_hsl(0_0%_0%/0.5)]"
          : "bg-transparent"
      )}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/95 to-white/55 bg-clip-text text-transparent">
            TriLink
          </span>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium">
                Войти
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="gap-1.5 text-sm font-semibold shadow-[0_0_28px_hsl(var(--primary)/0.45)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.65)] transition-all duration-300">
                Зарегистрироваться <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Video */}
        <video className="absolute inset-0 h-full w-full object-cover object-center z-0" src="/bg10.mp4" autoPlay muted loop playsInline preload="metadata" poster="/bg1.jpg" />

        {/* Multi-layer overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, hsl(220 18% 8%/0.65) 0%, hsl(220 18% 8%/0.45) 40%, hsl(220 18% 8%/0.75) 100%)" }} />

        {/* Colored atmosphere orbs */}
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] z-[2] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--swim)/0.14) 0%, transparent 65%)", filter: "blur(48px)" }} />
        <div className="absolute bottom-[15%] right-[5%] w-[500px] h-[500px] z-[2] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--bike)/0.12) 0%, transparent 65%)", filter: "blur(48px)" }} />
        <div className="absolute top-[35%] right-[15%] w-[350px] h-[350px] z-[2] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.1) 0%, transparent 65%)", filter: "blur(56px)" }} />

        {/* Center radial spotlight behind text */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 45% at 50% 48%, hsl(var(--primary)/0.12) 0%, transparent 70%)" }} />

        <div className="relative z-[3] mx-auto max-w-5xl">

          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-primary shadow-[0_0_40px_hsl(var(--primary)/0.25),inset_0_0_20px_hsl(var(--primary)/0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Будь лучшим
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] lg:text-5xl"
            variants={fadeUp} custom={1} initial="hidden" animate="show"
          >
            Тренируйся{" "}
            <span className="bg-gradient-to-r from-primary via-blue-300 to-swim bg-clip-text text-transparent drop-shadow-[0_0_32px_hsl(var(--primary)/0.4)]">
              умнее
            </span>
            ,<br className="hidden sm:block" />
            <span className="text-white/65 font-semibold"> финишируй </span>
            быстрее
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-5 text-sm text-white/65 max-w-lg mx-auto leading-relaxed"
            variants={fadeUp} custom={2} initial="hidden" animate="show"
          >
            Полная платформа для триатлетов — трекинг, аналитика и планирование в одном месте.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            variants={fadeUp} custom={3} initial="hidden" animate="show"
          >
            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-9 h-12 text-base font-semibold shadow-[0_0_48px_hsl(var(--primary)/0.5),0_0_96px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_64px_hsl(var(--primary)/0.7),0_0_120px_hsl(var(--primary)/0.3)] transition-all duration-300">
                Зарегистрироваться <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="h-12 text-base px-8 border-white/18 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.09] hover:border-white/28 transition-all duration-300">
                Уже есть аккаунт
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-1.5 text-white/25"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
        >
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase">Листай</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </section>


      {/* ── Disciplines ─────────────────────────────────── */}
      <section className="relative px-6 py-28 overflow-hidden" style={{ background: "hsl(220 18% 8%)" }}>
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--primary)/0.04) 0%, transparent 70%)" }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Дисциплины
            </motion.p>
            <motion.h2 className="font-display text-2xl font-extrabold lg:text-3xl tracking-tight"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Три дисциплины — одна платформа
            </motion.h2>
            <motion.p className="mt-3 text-white/65 text-sm max-w-xl mx-auto"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
              Глубокая аналитика по каждому виду спорта в триатлоне
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {disciplines.map((d, i) => (
              <motion.div
                key={d.label}
                className={cn("group relative rounded-3xl border overflow-hidden cursor-default transition-all duration-400 hover:-translate-y-3", d.border)}
                style={{ background: `linear-gradient(145deg, hsl(${d.colorVar}/0.16) 0%, hsl(${d.colorVar}/0.05) 50%, hsl(220 18% 10%/1) 100%)` }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.13, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ boxShadow: `0 0 64px hsl(${d.colorVar}/0.3), 0 24px 48px hsl(0 0% 0%/0.4)` }}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${d.colorVar}/0.8), transparent)` }} />

                {/* Watermark icon */}
                <d.icon className={cn("absolute -bottom-4 -right-4 h-36 w-36 pointer-events-none select-none transition-transform duration-500 group-hover:scale-110", d.color)}
                  style={{ opacity: 0.05 }} />

                <div className="relative p-9">
                  {/* Icon */}
                  <div className="mb-7 relative inline-flex">
                    <div className="absolute inset-0 rounded-2xl blur-xl"
                      style={{ background: `hsl(${d.colorVar}/0.35)` }} />
                    <div className={cn("relative h-18 w-18 flex items-center justify-center rounded-2xl border p-4", d.border)}
                      style={{ background: `hsl(${d.colorVar}/0.15)` }}>
                      <d.icon className={cn("h-9 w-9 transition-transform duration-300 group-hover:scale-110", d.color)} />
                    </div>
                  </div>

                  <h3 className={cn("font-display text-xl font-extrabold mb-1 tracking-tight", d.color)}>{d.label}</h3>
                  <p className="text-xs text-white/65 leading-relaxed">{d.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative px-6 py-28 overflow-hidden"
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(220 18% 8%/0.92), hsl(220 18% 8%/0.92)), url('/bg2.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>

        {/* Radial center glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 100% 50% at 50% 100%, hsl(var(--primary)/0.06) 0%, transparent 60%)" }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Возможности
            </motion.p>
            <motion.h2 className="font-display text-2xl font-extrabold lg:text-3xl tracking-tight"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Всё что нужно триатлету
            </motion.h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-start-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group relative rounded-2xl overflow-hidden p-7 transition-all duration-400 hover:-translate-y-1.5 cursor-default"
                style={{
                  background: "hsl(220 20% 12%/0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid hsl(220 22% 22%/0.6)",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{
                  background: "hsl(220 20% 14%/0.85)",
                  borderColor: `hsl(${f.glowVar}/0.4)`,
                  boxShadow: `0 0 40px hsl(${f.glowVar}/0.15), 0 16px 40px hsl(0 0% 0%/0.3)`,
                }}
              >
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${f.glowVar}/0.7), transparent)` }} />

                {/* Corner glow on hover */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle, hsl(${f.glowVar}/0.2) 0%, transparent 70%)`, filter: "blur(12px)" }} />

                <div className="flex items-start justify-between mb-5">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105", f.accent)}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-extrabold tabular-nums" style={{ color: `hsl(${f.glowVar}/0.25)` }}>{f.num}</span>
                </div>
                <h3 className="font-display text-sm font-bold mb-1.5 text-white/90 group-hover:text-white transition-colors duration-300">{f.title}</h3>
                <p className="text-xs text-white/65 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="relative py-28 overflow-hidden" style={{ background: "hsl(220 20% 10%)" }}>
        {/* Background large text decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20vw] font-black text-white/[0.012] tracking-tighter leading-none">START</span>
        </div>

        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <motion.p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Быстрый старт
            </motion.p>
            <motion.h2 className="font-display text-2xl font-extrabold lg:text-3xl tracking-tight"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Три шага до результата
            </motion.h2>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">

            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className={cn("group relative rounded-2xl border p-8 transition-all duration-400 hover:-translate-y-2 cursor-default", s.border)}
                style={{ background: `linear-gradient(160deg, hsl(${s.colorVar}/0.04) 0%, hsl(220 20% 11%/1) 55%)` }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.13, duration: 0.55 }}
                viewport={{ once: true }}
                whileHover={{ boxShadow: `0 0 40px hsl(${s.colorVar}/0.18), 0 20px 40px hsl(0 0% 0%/0.3)` }}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${s.colorVar}/0.15), transparent)` }} />

                {/* Step number */}
                <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold mb-5", s.border, s.color)}
                  style={{ background: `hsl(${s.colorVar}/0.1)` }}>
                  {s.num}
                </div>

                <h3 className="font-display font-bold text-sm mb-1.5 text-white/85">{s.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Footer ────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-8 text-center md:min-h-[680px] md:flex md:flex-col md:justify-between">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg1.jpg')" }} />

        {/* Multi-layer CTA overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, hsl(220 18% 8%/0.8) 0%, hsl(220 18% 8%/0.6) 40%, hsl(220 18% 8%/0.82) 100%)" }} />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, hsl(var(--primary)/0.14) 0%, transparent 70%)" }} />

        <div className="relative z-[2] mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center py-10">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-5">Присоединяйся</p>

            <h2 className="font-display text-3xl font-extrabold mb-4 lg:text-4xl leading-[1.1] tracking-[-0.02em]">
              Готов к{" "}
              <span className="bg-gradient-to-r from-primary via-blue-300 to-swim bg-clip-text text-transparent">
                старту?
              </span>
            </h2>

            <p className="text-sm text-white/65 mb-8 max-w-lg mx-auto leading-relaxed">
              Тысячи атлетов уже становятся легендами.<br className="hidden sm:block" />Начни прямо сейчас.
            </p>

            <Link to="/auth/register">
              <Button size="lg" className="gap-2 px-12 h-12 text-base font-semibold shadow-[0_0_56px_hsl(var(--primary)/0.55),0_0_120px_hsl(var(--primary)/0.25)] hover:shadow-[0_0_72px_hsl(var(--primary)/0.75),0_0_160px_hsl(var(--primary)/0.35)] transition-all duration-300">
                Зарегистрироваться <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-[2] mx-auto w-full max-w-6xl border-t border-white/8 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} TriLink · Created by Piltyayev Vladimir</p>
          <div className="flex items-center gap-5 text-xs text-white/25">
            <Link to="/auth/login" className="hover:text-white/55 transition-colors duration-200">Войти</Link>
            <Link to="/auth/register" className="hover:text-white/55 transition-colors duration-200">Регистрация</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
