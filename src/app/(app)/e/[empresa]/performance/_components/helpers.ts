/**
 * Derivações de APRESENTAÇÃO do módulo Performance (UI only) — formatação de
 * rótulos a partir do que o port já entregou. Não tocam serviço nem mocks.
 */
import { formatDate } from "@/lib/format";

/** MOIC como múltiplo pt-BR (ex.: 2.29 → "2,3x"). */
export function moicLabel(moic: number): string {
  return `${moic.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}x`;
}

/** Runway em meses → rótulo curto (ex.: 8.45 → "8,4 meses"). */
export function runwayLabel(months: number): string {
  if (!Number.isFinite(months)) return "—";
  return `${months.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses`;
}

/** Data-base ISO → "30/06/2026". */
export function formatAsOf(iso: string): string {
  return formatDate(iso, "short");
}
