import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/format";

/**
 * DeltaIndicator — semântica financeira (DS §1.5):
 * cor segue FAVORÁVEL/DESFAVORÁVEL ao resultado, nunca o sinal aritmético.
 * Seta + cor = redundância para daltônicos.
 */
export function DeltaIndicator({
  value,
  favorable,
  label,
  className,
  unit = "%",
}: {
  value: number;
  favorable: boolean;
  label?: string;
  className?: string;
  unit?: string;
}) {
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap text-body-sm font-semibold tnum",
        value === 0 ? "text-gray-500" : favorable ? "text-success" : "text-danger",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {unit === "%" ? formatPct(Math.abs(value)) : `${Math.abs(value).toLocaleString("pt-BR")}${unit}`}
      {label && <span className="ml-1 font-normal text-muted-foreground">{label}</span>}
    </span>
  );
}
