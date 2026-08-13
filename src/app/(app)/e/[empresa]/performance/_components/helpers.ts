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
export function runwayLabel(months: number | null): string {
  if (months === null || !Number.isFinite(months)) return "Não disponibilizado";
  return `${months.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses`;
}

/** Data-base ISO → "30/06/2026". */
export function formatAsOf(iso: string): string {
  return formatDate(iso, "short");
}

/* ── Sprint 1.4 · ausência de dado é dado ─────────────────────────────
 * Um traço no lugar de um número precisa dizer POR QUE está ali. Estes
 * helpers garantem que a tela nunca invente e nunca finja normalidade. */

/** Rótulo padrão quando a fonte não fornece o dado. */
export const SEM_DADO = "Não disponibilizado";

/** Formata um valor que pode não existir, sem nunca virar 0. */
export function opcional(v: number | null | undefined, fmt: (n: number) => string): string {
  return v === null || v === undefined ? SEM_DADO : fmt(v);
}
