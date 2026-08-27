import { useState, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { TransactionItem, EmptyTransactions } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { formatBRL, timeAgo } from "@/lib/format";
import { ArrowRightLeft, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "transfer" | "tax" | "rent" | "salary" | "purchase" | "fine";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "transfer", label: "Transferências" },
  { value: "tax", label: "Impostos" },
  { value: "rent", label: "Aluguéis" },
  { value: "salary", label: "Salários" },
  { value: "purchase", label: "Compras" },
  { value: "fine", label: "Multas" },
];

export default function History() {
  const transactions = useGameStore((s) => s.transactions);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((tx) => {
      const date = new Date(tx.timestamp);
      const key = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups);
  }, [filtered]);

  const totalFiltered = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <PageLayout
      title="Histórico"
      subtitle={`${filtered.length} transacções`}
      rightAction={
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => {
            // Export simple text log
            const log = transactions
              .slice()
              .reverse()
              .map((tx) => {
                const date = new Date(tx.timestamp).toLocaleString("pt-BR");
                return `${date} | ${tx.type} | R$ ${tx.amount.toLocaleString("pt-BR")} | ${tx.description}`;
              })
              .join("\n");
            navigator.clipboard.writeText(log);
          }}
          aria-label="Exportar histórico"
        >
          <Download className="size-5" />
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Filtrar
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 px-4 h-9 rounded-full text-xs font-bold transition-all border",
                filter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="mb-4 rounded-2xl bg-card border border-border shadow-bank p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total movimentado
            </p>
            <p className="text-lg font-extrabold font-mono-num text-primary">
              {formatBRL(totalFiltered)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Transações
            </p>
            <p className="text-lg font-extrabold font-mono-num">
              {filtered.length}
            </p>
          </div>
        </div>
      )}

      {/* Transactions by date */}
      {grouped.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 sticky top-16 bg-background/80 backdrop-blur-sm py-1">
                {date}
              </h3>
              <div className="bg-card rounded-2xl border border-border shadow-bank overflow-hidden">
                <div className="px-4 pt-2 pb-1">
                  {txs.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyTransactions
          title="Nenhuma transação"
          description={
            filter === "all"
              ? "As transações aparecerão aqui quando você fizer pagamentos."
              : `Não há transações do tipo "${FILTERS.find((f) => f.value === filter)?.label}".`
          }
        />
      )}
    </PageLayout>
  );
}
