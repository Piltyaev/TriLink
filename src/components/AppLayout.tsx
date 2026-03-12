import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { useStravaAutoSync } from "@/hooks/useStravaAutoSync";
import { cn } from "@/lib/utils";

function AppLayoutInner() {
  const { collapsed } = useSidebar();
  useStravaAutoSync();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar — only on md+ */}
      <AppSidebar />

      {/* Mobile top header */}
      <MobileHeader />

      {/* Main content: margin tracks sidebar width, top/bottom padding for mobile nav */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300 pt-14 md:pt-0 pb-20 md:pb-0",
          collapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        <Outlet />
      </main>

      {/* Bottom nav — only on mobile */}
      <MobileBottomNav />
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutInner />
    </SidebarProvider>
  );
}
