/**
 * Derivações de APRESENTAÇÃO do módulo (UI only) — não tocam a camada de
 * serviço nem os mocks: apenas transformam os dados já entregues pelo port
 * em rótulos executivos (próximo prazo, atenção, indicadores).
 */
import { isDecisionOverdue } from "@modules/strategy";
import type { Decision } from "@modules/strategy";

const TODAY = "2026-07-09";
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_IDX: Record<string, number> = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };

/** "2026-09-30" → "30 set". */
export function formatDayMonth(iso?: string): string {
  if (!iso) return "—";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]}`;
}

/** Menor prazo futuro entre decisões ainda abertas. */
export function nextDeadline(decisions: Decision[]): string {
  const up = decisions
    .filter((d) => d.dueDateISO && d.dueDateISO >= TODAY && d.status !== "done" && d.status !== "canceled")
    .sort((a, b) => (a.dueDateISO! < b.dueDateISO! ? -1 : 1));
  return up[0] ? formatDayMonth(up[0].dueDateISO) : "—";
}

/** Rótulo de atualização mais recente (ex.: "Abr/2026"). */
export function latestUpdate(decisions: Decision[]): string {
  let best: { rank: number; label: string } | null = null;
  for (const d of decisions) {
    const m = d.lastUpdate.toLowerCase().match(/([a-zç]{3})[/\s]+(\d{4})/);
    if (!m) continue;
    const rank = Number(m[2]) * 12 + (MONTH_IDX[m[1]] ?? 0);
    if (!best || rank > best.rank) best = { rank, label: d.lastUpdate };
  }
  return best?.label ?? "—";
}

/** Estado geral, derivado dos sinais (bloqueios / atrasos / andamento). */
export function overallState(decisions: Decision[]): string {
  if (decisions.some((d) => d.status === "blocked")) return "Requer atenção";
  if (decisions.some(isDecisionOverdue)) return "Prazos em risco";
  if (decisions.some((d) => d.status === "in_progress")) return "Em execução";
  return "No trilho";
}

export interface AttentionPoint { id: string; label: string; tone: "danger" | "warning" }

/** Pontos de atenção derivados: bloqueios (danger) e atrasos (warning). */
export function attentionPoints(decisions: Decision[]): AttentionPoint[] {
  const points: AttentionPoint[] = [];
  for (const d of decisions) {
    if (d.status === "blocked") points.push({ id: `blk-${d.id}`, label: d.title, tone: "danger" });
    else if (isDecisionOverdue(d)) points.push({ id: `ovd-${d.id}`, label: d.title, tone: "warning" });
  }
  return points.slice(0, 4);
}

export interface Indicator { id: string; label: string; value: string }

/** Indicadores relevantes derivados (leituras-chave do monitoramento). */
export function keyIndicators(decisions: Decision[]): Indicator[] {
  const inProgress = decisions.filter((d) => d.status === "in_progress").length;
  const open = decisions.filter((d) => d.status === "open").length;
  const overdue = decisions.filter(isDecisionOverdue).length;
  return [
    { id: "ind-progress", label: "Ações em andamento", value: String(inProgress) },
    { id: "ind-open", label: "Decisões em aberto", value: String(open) },
    { id: "ind-overdue", label: "Prazos vencidos", value: String(overdue) },
  ];
}
