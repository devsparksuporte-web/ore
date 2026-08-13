/**
 * PORT de dados do domínio Performance do Investimento (M-PERF · Sprint 1.2).
 * Dono único dos dados no front: componentes consomem APENAS estas funções,
 * nunca @/mocks direto (mesma regra dos demais domínios, doc 04 §3).
 *
 * Adaptador vigente: mocks (@/mocks/performance).
 * Adaptador futuro (E5 / Data Room): @modules/api ou importador de Excel com as
 * MESMAS assinaturas → a troca não exige mudança em nenhum componente.
 *
 * Regras de derivação (MOIC, uncalled, runway) vivem AQUI — nunca no componente.
 */
import { performanceSnapshots } from "@/mocks/performance";
import type { PerformanceDerived, PerformanceSnapshot, RunwayZone } from "../types";

export type {
  BurnPoint, CapitalPosition, Liquidity, PerformanceDerived, PerformanceSnapshot,
  ReturnScenarios, RunwayZone, Valuation, ValuationPoint, ValuationRecord,
} from "../types";

/**
 * Sprint 1.4 — ausência de dado é dado. Quando a fonte não fornece um insumo,
 * o derivado correspondente é `null` e a tela DIZ que não foi disponibilizado.
 * Nunca substituir por 0, Infinity ou média: um runway estimado numa tela de
 * investimento é pior que runway nenhum.
 */
function ratio(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a === null || a === undefined || b === null || b === undefined || b <= 0) return null;
  return a / b;
}

/** Limiares de runway (meses) — donos da regra no port. */
export const RUNWAY_CRITICAL_MONTHS = 6;
export const RUNWAY_ATTENTION_MONTHS = 12;

/** Zona semântica do runway a partir dos meses. */
export function runwayZone(months: number): RunwayZone {
  if (months < RUNWAY_CRITICAL_MONTHS) return "critical";
  if (months < RUNWAY_ATTENTION_MONTHS) return "attention";
  return "healthy";
}

/** Snapshot de performance de uma empresa investida (por slug). */
export function getPerformanceByCompany(companySlug: string): PerformanceSnapshot | undefined {
  return performanceSnapshots.find((s) => s.companySlug === companySlug);
}

/** Derivados de negócio (puros) — MOIC, variação anual, não chamado, runway. */
export function derivePerformance(s: PerformanceSnapshot): PerformanceDerived {
  const { valuation: v, capital: c, liquidity: l } = s;
  const series = v.annualSeries;
  const last = series[series.length - 1]?.value ?? v.current;
  const prev = series[series.length - 2]?.value ?? last;
  const runwayMonths = ratio(l.cash, l.burnMonthly);
  const calledRatio = ratio(c.called, c.committed);
  return {
    moic: v.investedCapital > 0 ? v.current / v.investedCapital : 0,
    valuationVariationYoY: prev > 0 ? ((last - prev) / prev) * 100 : 0,
    uncalled: c.committed !== null && c.called !== null ? c.committed - c.called : null,
    calledPct: calledRatio === null ? null : calledRatio * 100,
    runwayMonths,
    runwayZone: runwayMonths === null ? null : runwayZone(runwayMonths),
    baseCaseMultiple: s.scenarios ? ratio(s.scenarios.base, v.investedCapital) : null,
  };
}
