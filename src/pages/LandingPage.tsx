import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Calendar, BarChart3,
  Waves, Bike, PersonStanding, Zap, Map,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { icon: Activity, title: "Трекинг тренировок",   accent: "text-primary bg-primary/10 border-primary/20" },
  { icon: Calendar, title: "Умный календарь",       accent: "text-swim bg-swim/10 border-swim/20" },
  { icon: BarChart3, title: "Аналитика формы",      accent: "text-run bg-run/10 border-run/20" },
  { icon: Zap,      title: "Синхронизация Strava",  accent: "text-bike bg-bike/10 border-bike/20" },
  { icon: Map,      title: "Карта активности",      accent: "text-primary bg-primary/10 border-primary/20" },
];

const stats = [
  { value: "10K+", label: "Атлетов" },
  { value: "1M+", label: "Тренировок" },
  { value: "50M+", label: "Километров" },
  { value: "3", label: "Дисциплины" },
];

const sports = [
  { icon: Waves, label: "Плавание", sub: "Open water & бассейн", color: "text-swim", bg: "bg-swim/10 border-swim/20 hover:border-swim/50 hover:bg-swim/15" },
  { icon: Bike, label: "Велосипед", sub: "Шоссе & MTB", color: "text-bike", bg: "bg-bike/10 border-bike/20 hover:border-bike/50 hover:bg-bike/15" },
  { icon: PersonStanding, label: "Бег", sub: "Трейл & асфальт", color: "text-run", bg: "bg-run/10 border-run/20 hover:border-run/50 hover:bg-run/15" },
];

const steps = [
  { num: "01", title: "Создай аккаунт", desc: "Регистрация за 30 секунд — никаких лишних полей" },
  { num: "02", title: "Подключи Strava", desc: "Все прошлые и будущие тренировки появятся автоматически" },
  { num: "03", title: "Анализируй прогресс", desc: "Смотри динамику, планируй пиковую форму к гонке" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" } }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Background glow ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-primary/6 blur-[140px]" />
        <div className="absolute top-[60%] left-[10%] h-[400px] w-[400px] rounded-full bg-swim/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[5%] h-[350px] w-[350px] rounded-full bg-run/5 blur-[90px]" />
      </div>

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
              <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">TriLink</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Войти
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="gap-1.5">
                Начать бесплатно <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section
        className="relative px-6 pt-24 pb-20 text-center lg:pt-36"
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(220 18% 8% / 0.75), hsl(220 18% 8% / 0.85)), url('/bg1.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "scroll" }}
      >
      <div className="mx-auto max-w-5xl">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <Activity className="h-3.5 w-3.5" />
            Будь лучшим
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-5xl font-bold leading-[1.1] tracking-tight lg:text-7xl"
          variants={fadeUp} custom={1} initial="hidden" animate="show"
        >
          Тренируйся{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-swim bg-clip-text text-transparent">
              умнее
            </span>
          </span>
          ,<br className="hidden sm:block" />
          <span className="text-muted-foreground font-medium"> финишируй </span>
          быстрее
        </motion.h1>

        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          variants={fadeUp} custom={3} initial="hidden" animate="show"
        >
          <Link to="/auth/register">
            <Button size="lg" className="gap-2 px-8 h-12 text-base">
              Начать бесплатно <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="h-12 text-base px-8">
              Уже есть аккаунт
            </Button>
          </Link>
        </motion.div>

        {/* Sport cards */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {sports.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200 cursor-default",
                s.bg
              )}
            >
              <s.icon className={cn("h-7 w-7", s.color)} />
              <div>
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section className="border-y border-border/20">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                viewport={{ once: true }}
              >
                <p className="font-display text-4xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section
        className="relative px-6 py-24"
        style={{ backgroundImage: "linear-gradient(to bottom, hsl(220 18% 8% / 0.82), hsl(220 18% 8% / 0.82)), url('/bg1.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "scroll" }}
      >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <motion.p
            className="text-sm font-medium text-primary uppercase tracking-widest mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Возможности
          </motion.p>
          <motion.h2
            className="font-display text-4xl font-bold"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Всё что нужно триатлету
          </motion.h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border hover:shadow-[0_4px_20px_hsl(0_0%_0%/0.4)] hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              viewport={{ once: true }}
            >
              <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl border mb-4", f.accent)}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="border-y border-border/20 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <motion.p
              className="text-sm font-medium text-primary uppercase tracking-widest mb-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Быстрый старт
            </motion.p>
            <motion.h2
              className="font-display text-4xl font-bold"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              Три шага до результата
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                viewport={{ once: true }}
              >
<div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-3xl font-bold text-primary/80">{s.num}</span>
                  <CheckCircle2 className="h-5 w-5 text-primary/50" />
                </div>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-28 text-center md:min-h-[600px] md:flex md:items-center md:justify-center">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover md:object-contain z-0"
          src="/bg3.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-background/75 z-[1]" />
        <div className="relative z-[2] mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden mb-6 shadow-[0_0_40px_hsl(var(--primary)/0.25)]">
            <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4 lg:text-5xl">
            Готов к старту?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Присоединяйся к тысячам триатлетов, которые уже тренируются умнее.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="gap-2 px-10 h-12 text-base shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              Начать бесплатно <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border/20 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TriLink. Created by Piltyayev Vladimir.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/auth/login" className="hover:text-foreground transition-colors">Войти</Link>
            <Link to="/auth/register" className="hover:text-foreground transition-colors">Регистрация</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
