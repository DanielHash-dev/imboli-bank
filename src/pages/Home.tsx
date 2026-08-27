import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PlayerCard } from "@/components/PlayerAvatar";
import { TransactionItem, EmptyTransactions } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { formatBRL } from "@/lib/format";
import { ArrowRightLeft, TrendingUp, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/AnimatedNumber";

export default function Home() {
  const navigate = useNavigate();
  const players = useGameStore((s) => s.players);
  const transactions = useGameStore((s) => s.transactions);
  const isGameActive = useGameStore((s) => s.isGameActive);
  const roomCode = useGameStore((s) => s.roomCode);

  if (!isGameActive) {
    return (
      <PageLayout title="Início" showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-bank">
            <span className="text-5xl">🏦</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-2">
            Nenhum jogo activo
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Inicie um novo jogo para começar a gerenciar as finanças do Bank
            Imboliário.
          </p>
          <Button
            onClick={() => navigate("/setup")}
            className="h-14 px-8 rounded-2xl font-bold shadow-bank-lg"
          >
            Criar Novo Jogo
          </Button>
        </div>
      </PageLayout>
    );
  }

  const bank = players.find((p) => p.isBank)!;
  const realPlayers = players.filter((p) => !p.isBank);
  const recentTxs = transactions.slice(0, 5);
  const totalInCirculation = realPlayers.reduce((s, p) => s + p.balance, 0);

  return (
    <PageLayout
      title="Início"
      subtitle="Bank Imboliário"
      showNav={true}
      rightAction={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/setup")}
          className="rounded-xl h-9 text-xs font-bold"
        >
          Novo Jogo
        </Button>
      }
    >
      {/* Room code */}
      {roomCode && (
        <div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Código da sala — compartilhe com os jogadores
          </span>
          <span className="font-mono text-lg font-extrabold tracking-widest text-primary">
            {roomCode}
          </span>
        </div>
      )}

      {/* Bank card */}
      <div className="mb-4">
        <PlayerCard player={bank} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Em circulação"
          value={totalInCirculation}
          className="text-primary"
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Jogadores"
          value={realPlayers.length}
        />
        <StatCard
          icon={<Activity className="size-4" />}
          label="Transações"
          value={transactions.length}
        />
      </div>

      {/* Quick transfer CTA */}
      <Button
        onClick={() => navigate("/transfer")}
        className="w-full h-12 rounded-2xl mb-6 font-bold shadow-bank"
        size="lg"
      >
        <ArrowRightLeft className="size-5 mr-2" />
        Fazer Pagamento
      </Button>

      {/* Players preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Jogadores</h3>
          <button
            onClick={() => navigate("/players")}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            Ver todos →
          </button>
        </div>
        <div className="space-y-2">
          {realPlayers.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-bank cursor-pointer hover:shadow-bank-lg transition-all"
              onClick={() => navigate(`/players/${p.id}`)}
            >
              <PlayerCard player={p} />
            </div>
          ))}
          {realPlayers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum jogador ainda.
            </p>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Actividade Recente</h3>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            Ver histórico →
          </button>
        </div>
        {recentTxs.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-bank overflow-hidden">
            <div className="px-4 pt-2 pb-1">
              {recentTxs.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyTransactions
            description="Nenhuma transação ainda. Clique em Fazer Pagamento para começar!"
          />
        )}
      </div>
    </PageLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-bank p-3 flex flex-col items-center text-center gap-1">
      <div className={cn("text-muted-foreground", className)}>{icon}</div>
      <AnimatedNumber
        value={value}
        className={cn("text-xl font-extrabold font-mono-num", className)}
      />
      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
