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

export default function LoginPage() {
  usePageTitle('Войти');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Неверный email или пароль');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Подтвердите email — проверьте почту');
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success('Добро пожаловать!');
    navigate('/dashboard');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg1.jpg')" }} aria-hidden="true"
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
          <h1 className="font-display text-2xl font-bold text-foreground">Вход в TriLink</h1>
          <p className="mt-1 text-sm text-muted-foreground">Войдите в свой аккаунт</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_4px_24px_hsl(0_0%_0%/0.5)] space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Вход...</> : 'Войти'}
          </Button>
        </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Нет аккаунта?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  );
}
