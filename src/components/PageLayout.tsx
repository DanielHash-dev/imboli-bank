import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Users,
  ArrowRightLeft,
  ScrollText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showNav?: boolean;
  rightAction?: React.ReactNode;
}

const NAV_ITEMS = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/players", label: "Jogadores", icon: Users },
  { to: "/transfer", label: "Pagar", icon: ArrowRightLeft },
  { to: "/history", label: "Histórico", icon: ScrollText },
];

export function PageLayout({
  children,
  title,
  subtitle,
  showBack = false,
  showNav = true,
  rightAction,
}: PageLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isGameActive = useGameStore((s) => s.isGameActive);

  return (
    <div className="min-h-screen bg-bank-pattern flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-2xl px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full -ml-2 shrink-0"
                aria-label="Voltar"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <div className="min-w-0">
              {title && (
                <h1 className="text-lg font-bold tracking-tight truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {rightAction}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-4 pb-32">
        {children}
      </main>

      {/* Bottom nav */}
      {showNav && isGameActive && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-2xl px-4">
            <div className="grid grid-cols-4 gap-1 py-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active =
                  location.pathname === to ||
                  (to === "/players" && location.pathname.startsWith("/players"));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center size-9 rounded-xl transition-colors",
                        active && "bg-primary/10",
                      )}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-semibold">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export function SettingsButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="rounded-full"
      aria-label="Configurações"
    >
      <Settings className="size-5" />
    </Button>
  );
}
