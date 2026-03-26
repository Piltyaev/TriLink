import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AGE_CATEGORIES = [
  { value: 'U15',   label: 'U15',   desc: 'до 15 лет' },
  { value: 'U19',   label: 'U19',   desc: '15–18 лет' },
  { value: 'U23',   label: 'U23',   desc: '19–22 лет' },
  { value: 'Elite', label: 'Elite', desc: '23+ лет' },
];

export default function RegisterPage() {
  usePageTitle('Регистрация');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [weight,      setWeight]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Пароль должен быть не менее 8 символов');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, name, ageCategory || undefined, weight || undefined);
    setLoading(false);
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Этот email уже зарегистрирован');
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success('Регистрация прошла успешно! Войдите в свой аккаунт.');
    navigate('/auth/login');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <video
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="/bg3.MP4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-background/75 z-[1]" />
      <motion.div
        className="relative z-[2] w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden">
            <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Регистрация</h1>
          <p className="mt-1 text-sm text-muted-foreground">TriLink объединяет дисциплины в единую систему подготовки: синхронизация Strava, адаптивное планирование и глубокая аналитика вашей формы.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_4px_24px_hsl(0_0%_0%/0.5)] space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-foreground">Имя</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ваше имя" className="mt-1" required disabled={loading} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="mt-1" required disabled={loading} />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-foreground">Пароль</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 8 символов" className="mt-1" required disabled={loading} minLength={8} />
            </div>

            {/* Age category */}
            <div>
              <Label className="text-foreground">Возрастная категория</Label>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {AGE_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    disabled={loading}
                    onClick={() => setAgeCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-center rounded-xl border py-2.5 transition-all duration-150",
                      ageCategory === cat.value
                        ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className="font-display text-sm font-bold">{cat.label}</span>
                    <span className="text-[10px] opacity-70 leading-tight mt-0.5">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="weight" className="text-foreground">
                Вес (кг) <span className="text-muted-foreground font-normal text-xs">— необязательно</span>
              </Label>
              <Input id="weight" type="number" step="0.1" min={20} max={200}
                value={weight} onChange={e => setWeight(e.target.value)}
                placeholder="70.5" className="mt-1" disabled={loading} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание...</>
                : 'Создать аккаунт'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Уже есть аккаунт?{' '}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">Войти</Link>
        </p>
      </motion.div>
    </div>
  );
}
