import {
  ArrowRightLeft,
  Receipt,
  Home as HomeIcon,
  Coins,
  HandHeart,
  ShieldAlert,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, timeAgo } from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import type { Transaction } from "@/types/game";
import { useGameStore } from "@/store/gameStore";

const ICONS = {
  transfer: ArrowRightLeft,
  tax: ShieldAlert,
  rent: HomeIcon,
  salary: Coins,
  purchase: HomeIcon,
  loan: HandHeart,
  fine: Receipt,
};

const LABELS = {
  transfer: "Transferência",
  tax: "Imposto / Taxa",
  rent: "Aluguel",
  salary: "Salário",
  purchase: "Compra",
  loan: "Empréstimo",
  fine: "Multa",
};

const COLORS = {
  transfer: "text-primary bg-primary/10",
  tax: "text-destructive bg-destructive/10",
  rent: "text-accent-foreground bg-accent/30",
  salary: "text-success bg-success/10",
  purchase: "text-accent-foreground bg-accent/30",
  loan: "text-secondary bg-secondary/10",
  fine: "text-destructive bg-destructive/10",
};

interface TransactionItemProps {
  tx: Transaction;
  showDate?: boolean;
  className?: string;
}

export function TransactionItem({ tx, className }: TransactionItemProps) {
  const players = useGameStore((s) => s.players);
  const from = players.find((p) => p.id === tx.fromId);
  const to = players.find((p) => p.id === tx.toId);
  const Icon = ICONS[tx.type];

  // For bank-side transactions, show the other party
  const counterparty = from?.isBank ? to : from;
  const isIncoming = to?.id === counterparty?.id && !from?.isBank;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-1 animate-slide-up",
        className,
      )}
    >
      <div
        className={cn(
          "size-10 rounded-2xl flex items-center justify-center shrink-0",
          COLORS[tx.type],
        )}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {tx.description || LABELS[tx.type]}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {from && `${from.name} → ${to?.name}`} · {timeAgo(tx.timestamp)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <AnimatedNumber
          value={tx.amount}
          className={cn(
            "text-sm font-bold font-mono-num",
            isIncoming ? "text-success" : "text-foreground",
          )}
        />
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          {formatBRL(tx.amount).replace(/[\d.,\s]/g, "")}
        </p>
      </div>
    </div>
  );
}

interface EmptyTransactionsProps {
  title?: string;
  description?: string;
}

export function EmptyTransactions({
  title = "Nenhuma transação ainda",
  description = "Faça uma transferência para começar a registrar o jogo.",
}: EmptyTransactionsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="size-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
        <Banknote className="size-10 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {description}
      </p>
    </div>
  );
}
