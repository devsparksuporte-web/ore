/**
 * Tipos do domínio Performance do Investimento (M-PERF · Sprint 1.2).
 *
 * Modela a saúde financeira da investida em três agregados de negócio —
 * VALOR, CAPITAL e LIQUIDEZ — mais os DERIVADOS calculados no serviço
 * (nunca no componente). Desenhado como contrato normalizado (`PerformanceSnapshot`)
 * por empresa e data-base, para receber, no futuro, dados de API ou de um
 * mapeamento de Excel sem alterar a UI (ver docs/performance-module-notes.md).
 */

/* ─────────────────────────── Enums de domínio ─────────────────────────── */

/** Zona de risco do runway: quanto menor, pior (crítico → atenção → saudável). */
export type RunwayZone = "critical" | "attention" | "healthy";

/* ───────────────────────── A. VALOR (Valuation) ───────────────────────── */

export interface ValuationPoint {
  /** Ano de referência (evolução anual). */
  year: number;
  value: number;
}

export interface ValuationRecord {
  /** Data-base da marcação (ISO). */
  asOf: string;
  value: number;
  /** Método de marcação (DCF, Múltiplos, Rodada, Custo…). */
  method: string;
  source: string;
}

export interface Valuation {
  /** Valuation atual (headline). */
  current: number;
  /** Data-base da marcação atual (ISO). */
  asOf: string;
  method: string;
  /** Capital investido (base do MOIC). */
  investedCapital: number;
  /** Evolução anual (gráfico do bloco Valor). */
  annualSeries: ValuationPoint[];
  /** Histórico de marcações (tabela, ao final da tela). */
  history: ValuationRecord[];
}

/* ──────────────────── B. CAPITAL (posição de capital) ─────────────────── */

export interface CapitalPosition {
  /** Capital comprometido (committed). */
  committed: number;
  /** Capital chamado (called / drawn). */
  called: number;
  /** Saldo disponível no veículo. */
  availableBalance: number;
}

/* ───────────────────────── C. LIQUIDEZ (caixa) ────────────────────────── */

export interface BurnPoint {
  /** Rótulo do mês (ex.: "jan", "fev"). */
  label: string;
  value: number;
}

export interface Liquidity {
  /** Caixa da investida. */
  cash: number;
  /** Contingências (passivo potencial que ataca o caixa). */
  contingencies: number;
  burnMonthly: number;
  burnQuarterly: number;
  burnAnnual: number;
  /** Série mensal de burn (gráfico do bloco Liquidez). */
  burnSeries: BurnPoint[];
}

/* ─────────────────── Snapshot normalizado (contrato) ──────────────────── */

export interface PerformanceSnapshot {
  assetId: string;
  companySlug: string;
  /** Moeda de apresentação (ex.: "BRL"). */
  currency: string;
  /** Participação da Ore na investida (%). */
  ownershipPct: number;
  /** Data-base geral do snapshot (ISO). */
  asOf: string;
  valuation: Valuation;
  capital: CapitalPosition;
  liquidity: Liquidity;
}

/* ───────────────── Derivados (calculados no serviço) ──────────────────── */

export interface PerformanceDerived {
  /** MOIC = valuation atual ÷ capital investido. */
  moic: number;
  /** Variação anual do valuation (último ano vs anterior), em %. */
  valuationVariationYoY: number;
  /** Capital não chamado = comprometido − chamado (dry powder / obrigação futura). */
  uncalled: number;
  /** % do comprometido já chamado. */
  calledPct: number;
  /** Runway em meses = caixa ÷ burn mensal. */
  runwayMonths: number;
  /** Zona semântica do runway. */
  runwayZone: RunwayZone;
}
