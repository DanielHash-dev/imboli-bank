import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { Plus, Minus } from "lucide-react";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
  placeholder?: string;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

/**
 * Input de valor monetário com botões de +/- e valores rápidos.
 * O usuário digita em reais (sem formatação) e o componente
 * exibe formatado e propaga o número puro para o pai.
 */
export function AmountInput({
  value,
  onChange,
  max,
  className,
  placeholder = "0",
}: AmountInputProps) {
  const [display, setDisplay] = useState(
    value > 0 ? value.toLocaleString("pt-BR") : "",
  );

  useEffect(() => {
    // Sync externo -> display
    if (value === 0 && display === "") return;
    const formatted = value > 0 ? value.toLocaleString("pt-BR") : "";
    if (formatted !== display) setDisplay(formatted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (raw: string) => {
    // Aceita só dígitos
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDisplay("");
      onChange(0);
      return;
    }
    const num = parseInt(digits, 10);
    setDisplay(num.toLocaleString("pt-BR"));
    onChange(num);
  };

  const adjust = (delta: number) => {
    const next = Math.max(0, value + delta);
    onChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => adjust(-100)}
          className="size-12 rounded-2xl shrink-0"
          aria-label="Diminuir 100"
        >
          <Minus className="size-5" />
        </Button>
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground pointer-events-none">
            R$
          </span>
          <Input
            type="text"
            inputMode="numeric"
            value={display}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="h-14 text-2xl font-bold font-mono-num pl-14 pr-4 rounded-2xl text-right"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => adjust(100)}
          className="size-12 rounded-2xl shrink-0"
          aria-label="Aumentar 100"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((amt) => {
          const active = value === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(amt)}
              className={cn(
                "h-10 rounded-xl text-xs font-bold transition-all border",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50",
              )}
            >
              {formatBRL(amt).replace("R$", "").trim()}
            </button>
          );
        })}
      </div>

      {max !== undefined && (
        <p className="text-xs text-muted-foreground text-center">
          Saldo disponível:{" "}
          <span className="font-bold text-foreground">
            {formatBRL(max)}
          </span>
        </p>
      )}
    </div>
  );
}
