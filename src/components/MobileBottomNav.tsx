import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Dumbbell, BarChart3, Award, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Главная",    url: "/dashboard", icon: LayoutDashboard },
  { title: "Трен.",      url: "/workouts",  icon: Dumbbell },
  { title: "Аналитика",  url: "/analytics", icon: BarChart3 },
  { title: "Рекорды",    url: "/records",   icon: Award },
  { title: "Ещё",        url: "/settings",  icon: Settings },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map((item) => {
        const active = item.url === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.url);

        return (
          <Link
            key={item.url}
            to={item.url}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[60px]"
          >
            <div className={cn(
              "flex items-center justify-center rounded-xl w-10 h-8 transition-all duration-200",
              active ? "bg-primary/15" : "bg-transparent"
            )}>
              <item.icon className={cn(
                "h-5 w-5 transition-colors duration-150",
                active ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-muted-foreground"
            )}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
