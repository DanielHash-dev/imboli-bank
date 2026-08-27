import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PlayerCard, PlayerAvatar } from "@/components/PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGameStore } from "@/store/gameStore";
import { showSuccess, showError } from "@/utils/toast";
import { Plus, Trash2, Search } from "lucide-react";

const MAX_PLAYERS = 8;

export default function Players() {
  const navigate = useNavigate();
  const players = useGameStore((s) => s.players);
  const { addPlayer, removePlayer } = useGameStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const bank = players.find((p) => p.isBank);
  const realPlayers = players.filter((p) => !p.isBank);
  const filtered = realPlayers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!name.trim()) return;
    if (realPlayers.length >= MAX_PLAYERS) {
      showError("Máximo de 8 jogadores.");
      return;
    }
    addPlayer(name.trim());
    showSuccess(`${name.trim()} entrou no jogo! 🎉`);
    setName("");
    setDialogOpen(false);
  };

  const handleRemove = (id: string, playerName: string) => {
    removePlayer(id);
    showSuccess(`${playerName} foi removido.`);
  };

  // Sort by balance descending
  const sorted = [...filtered].sort((a, b) => b.balance - a.balance);

  return (
    <PageLayout
      title="Jogadores"
      subtitle={`${realPlayers.length} participando`}
      rightAction={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-xl h-9 gap-1 font-bold"
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Adicionar Jogador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do jogador"
                className="h-12 rounded-2xl"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                maxLength={20}
                autoFocus
              />
              <Button
                onClick={handleAdd}
                disabled={!name.trim() || realPlayers.length >= MAX_PLAYERS}
                className="w-full h-12 rounded-2xl font-bold"
              >
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Bank card */}
      {bank && (
        <div className="mb-4">
          <PlayerCard player={bank} />
        </div>
      )}

      {/* Search */}
      {realPlayers.length > 3 && (
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogador..."
            className="h-11 pl-11 rounded-2xl bg-card"
          />
        </div>
      )}

      {/* Players list */}
      <div className="space-y-3">
        {sorted.length > 0 ? (
          sorted.map((player, i) => (
            <div key={player.id} className="relative group">
              <PlayerCard player={player} rank={i + 1} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                    aria-label={`Remover ${player.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover {player.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O saldo restante será devolvido ao banco.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemove(player.id, player.name)}
                      className="rounded-xl"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="font-bold">Nenhum jogador ainda</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Adicione jogadores para começar o jogo.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="rounded-2xl font-bold"
            >
              <Plus className="size-4 mr-2" />
              Adicionar jogador
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
