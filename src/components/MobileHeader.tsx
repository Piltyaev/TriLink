import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils";

export function MobileHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden shrink-0">
          <img src="/logo.jpg" alt="TriLink" className="h-full w-full object-cover" />
        </div>
        <span className="font-display text-base font-semibold tracking-tight">TriLink</span>
      </div>

      <button
        onClick={() => navigate('/settings')}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold transition-colors active:bg-primary/30"
      >
        {initials}
      </button>
    </header>
  );
}
