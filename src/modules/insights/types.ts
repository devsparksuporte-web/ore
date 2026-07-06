/**
 * INSIGHT ENGINE · tipos (ADR-020)
 *
 * Transforma indicadores em linguagem executiva. A análise é 100%
 * independente de layout: regras puras sobre um CONTEXTO tipado produzem
 * Insights; dashboards apenas exibem (via insight widget do Widget Engine).
 *
 * AI-ready: o port InsightProvider é assíncrono — o adaptador v1 é
 * baseado em regras; o adaptador de IA (E5+/P5) implementa a MESMA
 * interface recebendo o mesmo contexto. Consumidores não mudam.
 */

export type InsightTone = "positive" | "neutral" | "attention" | "critical";

export type InsightCategory =
  | "cash" | "revenue" | "ebitda" | "budget" | "capex" | "suppliers" | "operations" | "data-quality";

export interface Insight {
  id: string;
  category: InsightCategory;
  tone: InsightTone;
  /** Destaque inicial da frase (valor/variação) — ex.: "12%" */
  emphasis?: string;
  /** Frase executiva completa (sem o emphasis) — pt-BR, uma linha */
  text: string;
  /** Evidência/origem resumida (auditabilidade da análise) */
  evidence?: string;
  /** Drill para a tela que sustenta o insight */
  href?: string;
  /** 0–100 — ordena a exibição (crítico > atenção > positivo > neutro) */
  priority: number;
}

/**
 * Snapshot de indicadores que as regras consomem — montado pelo
 * composition root a partir dos ports de domínio (nunca pelas regras).
 */
export interface InsightContext {
  companySlug: string;
  periodLabel: string;                 // "jun/26"
  cash: { balanceCompact: string; coverageMonths: number; minimumMonths: number; sparkMi: number[] };
  revenue: { deltaPctVsBudget: number };
  ebitda: { sparkMi: number[]; marginPct: number };
  budget: { linesOverThreshold: number; totalLines: number; pendingJustifications: number };
  capex: { executedPct: number; plannedPct: number };
  suppliers: { topName: string; topConcentrationPct: number; concentrationLimitPct: number };
  dataFreshness: { lastSyncLabel: string; stale: boolean };
  /** Projeção: por quantos meses o fluxo permanece acima do mínimo */
  runway: { positiveMonths: number };
  /** Fila de decisão do usuário */
  approvals: { pending: number; overdueSla: number; valueCompact: string };
  /** Tendência de custos logísticos (Δ% vs orçado; negativo = redução) */
  logistics: { deltaPctVsBudget: number };
}

/** Regra pura: contexto → insight (ou null quando não se aplica). */
export type InsightRule = (ctx: InsightContext) => Insight | null;

/** PORT — a interface que o adaptador de IA implementará no futuro. */
export interface InsightProvider {
  readonly name: string;
  generateInsights(ctx: InsightContext): Promise<Insight[]>;
}
