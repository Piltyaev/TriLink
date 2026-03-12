import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Calendar, BarChart3, Dumbbell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Главная",    url: "/dashboard", icon: LayoutDashboard },
  { title: "Календарь", url: "/calendar",  icon: Calendar },
  { title: "Аналитика", url: "/analytics", icon: BarChart3 },
  { title: "Трен.",     url: "/workouts",  icon: Dumbbell },
  { title: "Настройки", url: "/settings",  icon: Settings },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card/95 backdrop-blur-md">
      {items.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          end={item.url === "/dashboard"}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium",
            "text-muted-foreground transition-colors duration-150"
          )}
          activeClassName="text-primary"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
