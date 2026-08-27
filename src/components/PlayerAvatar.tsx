import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Player } from "@/types/game";
import { AnimatedNumber } from "./AnimatedNumber";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg" | "xl";
  showBalance?: boolean;
  className?: string;
}

const SIZES = {
  sm: "size-9 text-lg",
  md: "size-12 text-2xl",
  lg: "size-16 text-3xl",
  xl: "size-20 text-4xl",
};

export function PlayerAvatar({
  player,
  size = "md",
  className,
}: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center shrink-0 select-none",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: `${player.color}1A`,
        boxShadow: `inset 0 0 0 2px ${player.color}33`,
      }}
      aria-label={player.name}
    >
      <span className="leading-none">{player.isBank ? "🏦" : player.avatar}</span>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  rank?: number;
  onClick?: () => void;
  className?: string;
}

export function PlayerCard({ player, rank, className }: PlayerCardProps) {
  if (player.isBank) {
    return <BankCard bank={player} className={className} />;
  }

  return (
    <Link
      to={`/players/${player.id}`}
      className={cn(
        "group block rounded-3xl bg-card p-4 shadow-bank border border-border/60",
        "transition-all hover:shadow-bank-lg hover:-translate-y-0.5 active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <PlayerAvatar player={player} size="lg" />
          {rank !== undefined && (
            <div
              className="absolute -top-1 -right-1 size-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-sm"
              aria-label={`Posição ${rank}`}
            >
              {rank}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{player.name}</p>
          <p className="text-xs text-muted-foreground">Toque para detalhes</p>
        </div>
        <div className="text-right">
          <AnimatedNumber
            value={player.balance}
            className="text-xl font-bold text-foreground"
          />
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {formatBRL(player.balance).replace(/[\d.,\s]/g, "")}
          </p>
        </div>
      </div>
    </Link>
  );
}

function BankCard({ bank, className }: { bank: Player; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-bank-lg",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
      }}
    >
      {/* Decorative */}
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 size-32 rounded-full bg-accent/30 blur-2xl" />
      <div className="absolute inset-0 bg-bank-grid opacity-30" />

      <div className="relative flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Building2 className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {bank.name}
          </p>
          <p className="text-[10px] opacity-70">Reserva do jogo</p>
        </div>
        <div className="text-right">
          <AnimatedNumber
            value={bank.balance}
            className="text-2xl font-extrabold"
          />
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            BRL
          </p>
        </div>
      </div>
    </div>
  );
}
