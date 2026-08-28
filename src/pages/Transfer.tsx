import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { AmountInput } from "@/components/AmountInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGameStore } from "@/store/gameStore";
import { showSuccess, showError } from "@/utils/toast";
import { ArrowRightLeft, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type TxType = "transfer" | "tax" | "rent" | "salary" | "purchase" | "fine";

const TX_TYPES: { value: TxType; label: string; icon: string }[] = [
  { value: "transfer", label: "Transferência", icon: "↔️" },
  { value: "tax", label: "Imposto / Taxa", icon: "🛡️" },
  { value: "rent", label: "Aluguel", icon: "🏠" },
  { value: "salary", label: "Salário", icon: "💰" },
  { value: "purchase", label: "Compra", icon: "🏪" },
  { value: "fine", label: "Multa", icon: "📋" },
];

export default function Transfer() {
  const navigate = useNavigate();
  const players = useGameStore((s) => s.players);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const { transfer, payTax, payRent, buyProperty } = useGameStore();

  const realPlayers = players.filter((p) => !p.isBank);
  const bank = players.find((p) => p.isBank);
  const myPlayer = players.find((p) => p.id === myPlayerId);

  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [txType, setTxType] = useState<TxType>("transfer");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // "De" é travado: salário sai do Banco, todo o resto sai sempre de você mesmo.
  const isSalary = txType === "salary";
  const fromPlayer = isSalary ? bank : myPlayer;
  const fromId = fromPlayer?.id ?? "";
  const toPlayer = players.find((p) => p.id === toId);

  const canSubmit =
    !!fromId &&
    !!toId &&
    amount > 0 &&
    !!fromPlayer &&
    !!toPlayer &&
    fromPlayer.balance >= amount;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      switch (txType) {
        case "tax":
          payTax(fromId, amount, description || "Imposto / Taxa");
          showSuccess(`Imposto pago: ${description}`);
          break;
        case "rent":
          payRent(fromId, toId, amount, description || "Aluguel");
          showSuccess(`Aluguel pago!`);
          break;
        case "purchase":
          buyProperty(fromId, amount, description || "Compra");
          showSuccess(`Propriedade comprada!`);
          break;
        default:
          transfer(fromId, toId, amount, txType, description || TX_TYPES.find((t) => t.value === txType)?.label || "Transferência");
          showSuccess(`Transferência realizada!`);
      }

      // Reset
      setAmount(0);
      setDescription("");
      setSubmitting(false);
    } catch {
      showError("Erro ao processar transação.");
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="Pagamento" subtitle="Bank Imboliário">
      {/* Quick type selector */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
          Tipo de transação
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TX_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTxType(t.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl border text-xs font-semibold transition-all",
                txType === t.value
                  ? "bg-primary text-primary-foreground border-primary shadow-bank"
                  : "bg-card border-border text-foreground hover:border-primary/50",
              )}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* From / To */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-2">
            De
          </label>
          {fromPlayer ? (
            <div className="h-14 rounded-2xl border border-border bg-muted/50 flex items-center gap-3 px-4">
              <span className="text-lg">{fromPlayer.isBank ? "🏦" : fromPlayer.avatar}</span>
              <span className="font-semibold flex-1">
                {fromPlayer.isBank ? fromPlayer.name : `${fromPlayer.name} (você)`}
              </span>
              <span className="text-xs text-muted-foreground font-mono-num">
                {fromPlayer.balance.toLocaleString("pt-BR")}
              </span>
            </div>
          ) : (
            <div className="h-14 rounded-2xl border border-destructive/40 bg-destructive/5 flex items-center px-4">
              <span className="text-xs text-destructive font-semibold">
                Não identificamos seu jogador nessa sala. Volte em "Novo Jogo" e entre
                de novo com o código, usando o mesmo nome.
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1 pl-1">
            {isSalary
              ? "Salário sempre sai do Banco."
              : "Você só pode pagar a partir do seu próprio saldo."}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft className="size-4 text-primary rotate-90" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-2">
            Para
          </label>
          <Select value={toId} onValueChange={setToId}>
            <SelectTrigger className="h-14 rounded-2xl">
              <SelectValue placeholder="Selecione quem recebe..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {players.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.id === fromId}>
                  <div className="flex items-center gap-2">
                    <span>{p.isBank ? "🏦" : p.avatar}</span>
                    <span>{p.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-5">
        <AmountInput
          value={amount}
          onChange={setAmount}
          max={fromPlayer?.balance}
        />
        {fromPlayer && amount > fromPlayer.balance && (
          <p className="text-xs text-destructive text-center mt-2 font-semibold">
            Saldo insuficiente!
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-2">
          Descrição (opcional)
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            txType === "rent"
              ? "Ex: Apartamento Copacabana"
              : txType === "purchase"
                ? "Ex: Rua Augusta"
                : "Ex: Compra da propriedade"
          }
          className="h-12 rounded-2xl"
          maxLength={50}
        />
      </div>

      {/* Summary */}
      {canSubmit && (
        <div className="mb-5 rounded-2xl bg-muted p-4 space-y-2 animate-slide-up">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">De</span>
            <span className="font-bold">{fromPlayer?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Para</span>
            <span className="font-bold">{toPlayer?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-bold">
              {TX_TYPES.find((t) => t.value === txType)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full h-14 rounded-2xl text-base font-bold shadow-bank-lg"
        size="lg"
      >
        <Send className="size-5 mr-2" />
        {submitting ? "Processando..." : "Confirmar Pagamento"}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="size-3" />
        Transações são registradas no histórico
      </p>
    </PageLayout>
  );
}