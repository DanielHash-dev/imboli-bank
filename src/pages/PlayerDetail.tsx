import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TransactionItem, EmptyTransactions } from "@/components/TransactionItem";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { formatBRL } from "@/lib/format";
import { ArrowRightLeft } from "lucide-react";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const players = useGameStore((s) => s.players);
  const transactions = useGameStore((s) => s.transactions);

  const player = players.find((p) => p.id === id);

  if (!player || player.isBank) {
    return (
      <PageLayout title="Jogador" showBack showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h3 className="font-bold text-lg">Jogador não encontrado</h3>
          <Button
            variant="outline"
            onClick={() => navigate("/players")}
            className="mt-4 rounded-2xl"
          >
            Voltar aos jogadores
          </Button>
        </div>
      </PageLayout>
    );
  }

  const myTxs = transactions.filter(
    (tx) => tx.fromId === id || tx.toId === id,
  );

  return (
    <PageLayout
      title={player.name}
      showBack
      rightAction={
        <Button
          size="sm"
          onClick={() => navigate("/transfer")}
          className="rounded-xl h-9 gap-1 font-bold"
        >
          <ArrowRightLeft className="size-4" />
          Pagar
        </Button>
      }
    >
      {/* Profile card */}
      <div className="bg-card rounded-3xl border border-border shadow-bank-lg p-6 mb-6 flex flex-col items-center text-center animate-pop-in">
        <div className="relative mb-4">
          <PlayerAvatar player={player} size="xl" />
        </div>
        <h2 className="text-2xl font-extrabold">{player.name}</h2>
        <p
          className="text-sm font-semibold mt-1 px-3 py-1 rounded-full inline-block"
          style={{
            backgroundColor: `${player.color}1A`,
            color: player.color,
          }}
        >
          Jogador
        </p>

        <div className="mt-5 w-full">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Saldo disponível
          </p>
          <p
            className="text-4xl font-extrabold font-mono-num"
            style={{ color: player.color }}
          >
            {formatBRL(player.balance)}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mt-5 w-full">
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold font-mono-num">
              {myTxs.length}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Transações
            </p>
          </div>
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold font-mono-num">
              {myTxs.filter((tx) => tx.toId === id).length}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Recebidos
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="font-bold text-sm mb-3">Histórico</h3>
        {myTxs.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-bank overflow-hidden">
            <div className="px-4 pt-2 pb-1">
              {myTxs.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyTransactions
            title="Sem movimentações"
            description={`${player.name} ainda não teve nenhuma transação.`}
          />
        )}
      </div>
    </PageLayout>
  );
}
