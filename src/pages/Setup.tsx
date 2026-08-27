import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useGameStore } from "@/store/gameStore";
import { formatBRL } from "@/lib/format";
import { showSuccess, showError } from "@/utils/toast";
import { Plus, Trash2, Play, ChevronRight, Users, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_BALANCE = 150_000;
const MAX_PLAYERS = 8;

const SUGGESTED_NAMES = [
  "Rico", "Magnata", "Dono", "Chefe", "Mestre",
  "Barão", "Lord", "Rei", "CEO", "Gênio",
];

export default function Setup() {
  const navigate = useNavigate();
  const { createGame, joinGame, addPlayer, resetGame, isLoading } = useGameStore();
  const isGameActive = useGameStore((s) => s.isGameActive);
  const roomCode = useGameStore((s) => s.roomCode);

  const [mode, setMode] = useState<"create" | "join">("create");

  // Modo "criar sala"
  const [tempPlayers, setTempPlayers] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  // Modo "entrar em sala"
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  const handleAddTemp = (name: string) => {
    if (!name.trim() || tempPlayers.length >= MAX_PLAYERS) return;
    setTempPlayers((prev) => [...prev, name.trim()]);
    setNewName("");
  };

  const handleRemoveTemp = (index: number) => {
    setTempPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateRoom = async () => {
    try {
      const code = await createGame();
      for (const name of tempPlayers) {
        await addPlayer(name);
      }
      showSuccess(`Sala ${code} criada! Compartilhe o código com os outros jogadores 🎉`);
      navigate("/home");
    } catch {
      showError("Não foi possível criar a sala. Verifique sua conexão e tente novamente.");
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim() || !joinName.trim()) return;
    const ok = await joinGame(joinCode);
    if (!ok) {
      showError("Sala não encontrada. Confira o código com quem criou o jogo.");
      return;
    }
    await addPlayer(joinName);
    showSuccess("Você entrou na sala! 🎉");
    navigate("/home");
  };

  const totalDistributed = tempPlayers.length * INITIAL_BALANCE;

  return (
    <PageLayout title="Novo Jogo" subtitle="Bank Imboliário" showNav={false}>
      {/* Logo / hero */}
      <div className="flex flex-col items-center pt-8 pb-6 text-center">
        <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 shadow-bank">
          <span className="text-4xl">🏦</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Imboli<span className="text-primary">Bank</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Crie uma sala nova ou entre em uma existente
        </p>
      </div>

      {/* Current game banner */}
      {isGameActive && (
        <div className="mb-4 rounded-2xl p-4 border border-border bg-card shadow-bank">
          <p className="text-sm font-semibold text-center">
            Já existe um jogo activo{roomCode ? ` (sala ${roomCode})` : ""}.{" "}
            <button
              onClick={() => {
                resetGame();
                showSuccess("Jogo anterior encerrado.");
              }}
              className="text-primary underline underline-offset-2"
            >
              Encerrar
            </button>
          </p>
        </div>
      )}

      {/* Tabs: criar vs entrar */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-2xl">
        <button
          onClick={() => setMode("create")}
          className={cn(
            "flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
            mode === "create" ? "bg-card shadow-bank text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="size-4" />
          Criar sala
        </button>
        <button
          onClick={() => setMode("join")}
          className={cn(
            "flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
            mode === "join" ? "bg-card shadow-bank text-primary" : "text-muted-foreground"
          )}
        >
          <KeyRound className="size-4" />
          Entrar com código
        </button>
      </div>

      {mode === "create" ? (
        <>
          {/* Add player */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Jogadores ({tempPlayers.length}/{MAX_PLAYERS})
              </h3>
              <span className="text-xs text-muted-foreground font-semibold">
                {formatBRL(INITIAL_BALANCE)} cada
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Adicione os jogadores que já vão começar na sala, ou deixe em branco
              e cada um entra depois com o código da sala.
            </p>

            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do jogador"
                className="h-12 rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTemp(newName);
                }}
                maxLength={20}
              />
              <Button
                onClick={() => handleAddTemp(newName)}
                disabled={!newName.trim() || tempPlayers.length >= MAX_PLAYERS}
                size="icon"
                className="size-12 rounded-2xl shrink-0"
              >
                <Plus className="size-5" />
              </Button>
            </div>

            {/* Quick-add suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_NAMES.filter(
                (n) => !tempPlayers.includes(n),
              ).slice(0, 6).map((name) => (
                <button
                  key={name}
                  onClick={() => handleAddTemp(name)}
                  className="h-8 px-3 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30 transition-all"
                >
                  + {name}
                </button>
              ))}
            </div>

            {/* Preview players */}
            {tempPlayers.length > 0 && (
              <div className="space-y-2 pt-1">
                {tempPlayers.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border animate-slide-up"
                  >
                    <PlayerAvatar
                      player={{
                        id: `temp-${i}`,
                        name,
                        avatar: "🧑",
                        balance: INITIAL_BALANCE,
                        color: [
                          "#EF4444", "#3B82F6", "#22C55E", "#F59E0B",
                          "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
                        ][i % 8],
                        isBank: false,
                        createdAt: new Date(),
                      }}
                      size="md"
                    />
                    <span className="flex-1 font-semibold text-sm">{name}</span>
                    <span className="text-xs text-muted-foreground font-mono-num">
                      {formatBRL(INITIAL_BALANCE)}
                    </span>
                    <button
                      onClick={() => handleRemoveTemp(i)}
                      className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Remover ${name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {tempPlayers.length > 0 && (
            <div className="mb-6 rounded-2xl bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distribuído aos jogadores</span>
                <span className="font-bold font-mono-num">
                  {formatBRL(totalDistributed)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banco restante</span>
                <span className="font-bold text-primary font-mono-num">
                  {formatBRL(1_000_000 - totalDistributed)}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-base font-bold shadow-bank-lg"
              size="lg"
            >
              <Play className="size-5 mr-2" />
              {isLoading ? "Criando sala..." : "Criar Sala"}
              {!isLoading && <ChevronRight className="size-5 ml-2" />}
            </Button>

            {isGameActive && (
              <Button
                variant="outline"
                onClick={() => navigate("/home")}
                className="w-full h-12 rounded-2xl"
              >
                Continuar jogo actual →
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Entrar em sala existente */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Código da sala</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ex: AB3X9"
                className="h-12 rounded-2xl text-center text-lg font-mono tracking-widest"
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Peça o código a quem criou a sala.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Seu nome</label>
              <Input
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Como quer aparecer no jogo"
                className="h-12 rounded-2xl"
                maxLength={20}
              />
            </div>
          </div>

          <Button
            onClick={handleJoinRoom}
            disabled={isLoading || !joinCode.trim() || !joinName.trim()}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-bank-lg"
            size="lg"
          >
            <KeyRound className="size-5 mr-2" />
            {isLoading ? "Entrando..." : "Entrar na Sala"}
          </Button>
        </>
      )}
    </PageLayout>
  );
}
