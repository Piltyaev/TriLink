import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden mb-6 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
        <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
      </div>
      <h1 className="mb-2 font-display text-7xl font-bold text-foreground">404</h1>
      <p className="mb-1 text-lg font-semibold text-foreground">Страница не найдена</p>
      <p className="mb-8 text-sm text-muted-foreground max-w-xs">Запрашиваемая страница не существует или была удалена.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {user && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Перейти на дашборд
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
