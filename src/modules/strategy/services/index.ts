/**
 * PORT de dados do domínio Strategy (Estratégia & Execução — M-STRAT).
 * Dono único dos dados de estratégia no front: componentes consomem APENAS
 * estas funções, nunca @/mocks direto (mesma regra dos demais domínios, doc 04 §3).
 *
 * Adaptador vigente: mocks (@/mocks/estrategia).
 * Adaptador E5 (Crystal): @modules/api com as MESMAS assinaturas → Promise.
 * A troca mock→API não deve exigir mudança em nenhum componente consumidor.
 */
import { decisions, exitPlans, strategicMaps, strategyTimeline } from "@/mocks/estrategia";
import type {
  AssetRef, Decision, DecisionFilters, ExitPlan, StrategicMap,
  StrategyEvent, StrategyKpis,
} from "../types";

export type {
  AssetRef, CriticalPathStep, Decision, DecisionFilters, DecisionStatus, DecisionType,
  ExitPlan, ExitStage, KeyRisk, Priority, RiskSeverity, StrategicMap, StrategyEvent,
  StrategyEventKind, StrategyEventState, StrategyKpis,
} from "../types";

/** "Hoje" do mock — no E5 vem do relógio/servidor. Base do cálculo de atraso. */
const TODAY_ISO = "2026-07-09";

/** Regra única de atraso (dona no port): tem prazo vencido e ainda está aberta. */
export function isDecisionOverdue(d: Decision): boolean {
  return d.dueDateISO !== undefined && d.dueDateISO < TODAY_ISO
    && d.status !== "done" && d.status !== "canceled";
}

/* ─────────────────────────── Mapa Estratégico ─────────────────────────── */

/** Todos os painéis do Mapa Estratégico (um por Ativo). */
export function listStrategicMaps(): StrategicMap[] {
  return strategicMaps;
}

/** Painel de um Ativo específico. */
export function getStrategicMap(assetId: string): StrategicMap | undefined {
  return strategicMaps.find((m) => m.asset.id === assetId);
}

/** Painel do Mapa Estratégico de uma empresa investida (por slug). */
export function getStrategicMapByCompany(companySlug: string): StrategicMap | undefined {
  return strategicMaps.find((m) => m.asset.companySlug === companySlug);
}

/* ─────────────────────────── Decisões & Ações ─────────────────────────── */

/** Lista de decisões/ações, com filtro opcional (busca + segmentação).
 *  A ordenação por coluna é responsabilidade da tabela (estado de UI). */
export function listDecisions(filters: DecisionFilters = {}): Decision[] {
  const term = filters.search?.trim().toLowerCase();
  return decisions.filter((d) => {
    if (filters.assetId && d.asset.id !== filters.assetId) return false;
    if (filters.type && d.type !== filters.type) return false;
    if (filters.priority && d.priority !== filters.priority) return false;
    if (filters.status && d.status !== filters.status) return false;
    if (term) {
      const haystack = `${d.title} ${d.context} ${d.owner} ${d.asset.label}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

/** Decisões/ações de uma empresa investida (por slug). */
export function listDecisionsByCompany(companySlug: string, filters: DecisionFilters = {}): Decision[] {
  return listDecisions(filters).filter((d) => d.asset.companySlug === companySlug);
}

/** Uma decisão pelo id (detalhe do Drawer). */
export function getDecision(id: string): Decision | undefined {
  return decisions.find((d) => d.id === id);
}

/* ─────────────────────────── Timeline ─────────────────────────── */

/** Eventos de execução (Timeline) de uma empresa investida (por slug). */
export function getStrategyTimelineByCompany(companySlug: string): StrategyEvent[] {
  return strategyTimeline[companySlug] ?? [];
}

/* ────────────────────────── Plano de Saída ────────────────────────── */

/** Plano de saída de uma empresa investida (por slug). */
export function getExitPlanByCompany(companySlug: string): ExitPlan | undefined {
  return exitPlans.find((p) => p.asset.companySlug === companySlug);
}

/** Ativos distintos presentes nas decisões — alimenta os filtros de UI. */
export function listDecisionAssets(): AssetRef[] {
  const seen = new Map<string, AssetRef>();
  for (const d of decisions) if (!seen.has(d.asset.id)) seen.set(d.asset.id, d.asset);
  return Array.from(seen.values());
}

/* ───────────────────────────────── KPIs ───────────────────────────────── */

function computeKpis(list: Decision[], maps: StrategicMap[]): StrategyKpis {
  return {
    totalDecisions: list.length,
    inProgress: list.filter((d) => d.status === "in_progress").length,
    done: list.filter((d) => d.status === "done").length,
    blocked: list.filter((d) => d.status === "blocked").length,
    overdue: list.filter(isDecisionOverdue).length,
    criticalRisks: maps.flatMap((m) => m.keyRisks).filter((r) => r.severity === "critical").length,
  };
}

/** Indicadores do topo — agregado do portfólio (derivados, nunca hard-coded). */
export function getStrategyKpis(): StrategyKpis {
  return computeKpis(decisions, strategicMaps);
}

/** Indicadores do topo — escopo de uma empresa investida. */
export function getCompanyStrategyKpis(companySlug: string): StrategyKpis {
  const map = getStrategicMapByCompany(companySlug);
  return computeKpis(listDecisionsByCompany(companySlug), map ? [map] : []);
}
