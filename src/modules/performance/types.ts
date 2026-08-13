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

/**
 * Posição de capital. Sprint 1.4: os campos aceitam `null` porque nem toda
 * fonte controla capital POR INVESTIDA — o workbook da ORE, por exemplo,
 * controla commitments e capital chamado apenas no nível do Fundo. `null`
 * significa "a fonte não fornece", nunca zero: a UI é obrigada a dizer isso.
 */
export interface CapitalPosition {
  /** Capital comprometido (committed). */
  committed: number | null;
  /** Capital chamado (called / drawn). */
  called: number | null;
  /** Saldo disponível no veículo. */
  availableBalance: number | null;
  /** Capital efetivamente investido na participação (cost basis). */
  invested?: number | null;
  /** Por que os campos acima estão vazios, quando estiverem. */
  unavailableReason?: string;
}

/* ───────────────────────── C. LIQUIDEZ (caixa) ────────────────────────── */

export interface BurnPoint {
  /** Rótulo do mês (ex.: "jan", "fev"). */
  label: string;
  value: number;
}

export interface Liquidity {
  /** Caixa da investida. `null` quando a fonte não informa. */
  cash: number | null;
  /** Contingências (passivo potencial que ataca o caixa). */
  contingencies: number | null;
  burnMonthly: number | null;
  burnQuarterly: number | null;
  burnAnnual: number | null;
  /** Série mensal de burn (gráfico do bloco Liquidez). */
  burnSeries: BurnPoint[];
  /** Parcela do realizado sem classificação na fonte (ver DRE · não mapeadas). */
  unclassified?: number | null;
  /** Moeda do consumo operacional — pode diferir da moeda do investimento
   *  (o fundo marca em USD; a operação da investida gasta em BRL). */
  currency?: string;
  unavailableReason?: string;
}

/**
 * Cenários de retorno na saída — o que a ORE efetivamente projeta por ativo
 * (workbook, aba "Timeline de Saída"). Ocupa, com dado real, o espaço que a
 * posição de capital por investida não tem como preencher.
 */
export interface ReturnScenarios {
  current: number;
  downside: number;
  base: number;
  upside: number;
  /** Mecanismo de saída e janela-alvo. */
  mechanism: string;
  window: string;
  buyers?: string;
}

/* ─────────────────── Snapshot normalizado (contrato) ──────────────────── */

export interface PerformanceSnapshot {
  assetId: string;
  companySlug: string;
  /** Moeda em que a FONTE registra os valores (ex.: "USD", "BRL"). */
  currency: string;
  /** Câmbio para converter a apresentação, quando a fonte não é BRL. */
  fxToBRL?: number;
  /** Participação da Ore na investida (%). */
  ownershipPct: number;
  /** Data-base geral do snapshot (ISO). */
  asOf: string;
  valuation: Valuation;
  capital: CapitalPosition;
  liquidity: Liquidity;
  /** Cenários de saída, quando a fonte os projeta. */
  scenarios?: ReturnScenarios;
  /** Origem exibível do snapshot (rodapé dos blocos). */
  sourceLabel?: string;
}

/* ───────────────── Derivados (calculados no serviço) ──────────────────── */

export interface PerformanceDerived {
  /** MOIC = valuation atual ÷ capital investido. */
  moic: number;
  /** Variação anual do valuation (último ano vs anterior), em %. */
  valuationVariationYoY: number;
  /** Capital não chamado = comprometido − chamado. `null` sem os dois insumos. */
  uncalled: number | null;
  /** % do comprometido já chamado. `null` sem os insumos. */
  calledPct: number | null;
  /** Runway em meses = caixa ÷ burn mensal. `null` sem caixa ou sem burn. */
  runwayMonths: number | null;
  /** Zona semântica do runway. `null` quando não há runway. */
  runwayZone: RunwayZone | null;
  /** Múltiplo do cenário base sobre o capital investido, quando há cenários. */
  baseCaseMultiple?: number | null;
}
