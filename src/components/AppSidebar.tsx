import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Dumbbell, BarChart3,
  Settings, Shield, ChevronLeft, ChevronRight, LogOut, Award,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { title: "Дэшборд",    url: "/dashboard", icon: LayoutDashboard },
  { title: "Календарь",  url: "/calendar",  icon: Calendar },
  { title: "Тренировки", url: "/workouts",  icon: Dumbbell },
  { title: "Аналитика",  url: "/analytics", icon: BarChart3 },
  { title: "Рекорды",    url: "/records",   icon: Award },
  { title: "Настройки",  url: "/settings",  icon: Settings },
];

export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col",
      "border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center gap-3 border-b border-sidebar-border",
        collapsed ? "justify-center px-0" : "px-5"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
          <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
        </div>
        {!collapsed && (
          <span className="font-display text-base font-semibold text-foreground tracking-tight">
            TriLink
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold [border-left:2px_solid_hsl(var(--sidebar-primary))] pl-[10px]"
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin */}
      <div className="border-t border-sidebar-border p-2">
        <NavLink
          to="/admin"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
        >
          <Shield className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Админ</span>}
        </NavLink>
      </div>

      {/* User + logout */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
              {initials}
            </div>
            <span className="text-xs text-sidebar-foreground truncate leading-tight">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-9 items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
