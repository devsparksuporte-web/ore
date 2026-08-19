/**
 * Tipos do domínio Performance do Investimento (M-PERF · Sprint 1.2).
 *
 * Modela a saúde financeira da investida em três agregados de negócio —
 * VALOR, CAPITAL e LIQUIDEZ — mais os DERIVADOS calculados no serviço
 * (nunca no componente). Desenhado como contrato normalizado (`PerformanceSnapshot`)
 * por empresa e data-base, para receber, no futuro, dados de API ou de um
 * mapeamento de Excel sem alterar a UI (ver docs/performance-module-notes.md).
 */
import type { DataStatus } from "@modules/data-source";

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
  /**
   * Valuation atual (headline). Sprint 1.5: aceita `null` porque há investida
   * cujos documentos CONFLITAM sobre o fair value (Alvo) — e um valor eleito
   * por conveniência seria pior que a ausência declarada.
   */
  current: number | null;
  /** Data-base da marcação atual (ISO). */
  asOf: string;
  method: string;
  /** Capital investido (base do MOIC). */
  investedCapital: number;
  /** Evolução anual (gráfico do bloco Valor). */
  annualSeries: ValuationPoint[];
  /** Histórico de marcações (tabela, ao final da tela). */
  history: ValuationRecord[];
  /**
   * Fase 5.2 · ORE-51-002 — estado da SÉRIE, distinto do estado do valor atual.
   * Há investida cujo fair value corrente está em conflito documental aberto
   * enquanto a série trimestral segue sendo transcrição literal do que os
   * documentos reportaram. Sem este campo, gráfico e tabela apresentavam as
   * marcações como definitivas e contradiziam o "não disponibilizado" exibido
   * logo acima, no mesmo bloco.
   */
  seriesStatus?: DataStatus;
  /** Ressalva de uma linha sobre a série — exibida junto ao gráfico e à tabela. */
  seriesNote?: string;
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
  /**
   * Sprint 1.4 · item 8 — data-base do CONSUMO (ISO), que não é a data-base do
   * snapshot: o valuation é marcado no fechamento do ano e o consumo vem do
   * forecast operacional, com outra data. Sem este campo o drawer do runway
   * exibiria a data errada com aparência de certeza. `null` quando a fonte não
   * a informa.
   */
  burnAsOf?: string | null;
  /**
   * Sprint 1.4 · item 8 — período de consumo que a FONTE considera (ex.: "Média
   * dos últimos 12 meses"). `null` quando a metodologia ainda não foi definida:
   * a tela diz "Aguardando definição" em vez de assumir um período. Um runway
   * calculado sobre um período arbitrado é um número plausível e falso.
   */
  burnPeriodLabel?: string | null;
  /**
   * Fase 5.2 · ORE-51-004 — data-base do SALDO DE CAIXA (ISO). Distinta da do
   * consumo e da do snapshot: o caixa da Morro Verde vem do relatório do
   * Q1/2026 (31/03/2026) enquanto o valuation dela é de 31/12/2025. Sem este
   * campo o saldo aparecia sob a data-base do snapshot, três meses errada.
   */
  cashAsOf?: string | null;
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
  /** Participação da Ore na investida (%). `null` quando os documentos
   *  conflitam sem explicação (Sprint 1.5 · Alvo). */
  ownershipPct: number | null;
  /** Data-base geral do snapshot (ISO). */
  asOf: string;
  valuation: Valuation;
  capital: CapitalPosition;
  liquidity: Liquidity;
  /** Cenários de saída, quando a fonte os projeta. */
  scenarios?: ReturnScenarios;
  /** Origem exibível do snapshot (rodapé dos blocos). */
  sourceLabel?: string;
  /**
   * Sprint 1.5 — estado do dado POR CAMPO, não por empresa.
   *
   * Uma investida pode ter valuation REAL e caixa AGUARDANDO_DADOS ao mesmo
   * tempo; um `dataStatus` único no nível da empresa faria o selo certificar
   * o que não tem fonte. As chaves são os blocos que a tela exibe.
   */
  fieldStatus?: Partial<Record<
    "valuation" | "ownership" | "capital" | "liquidity" | "runway" | "scenarios",
    DataStatus
  >>;
}

/* ───────────────── Derivados (calculados no serviço) ──────────────────── */

export interface PerformanceDerived {
  /** MOIC = valuation atual ÷ capital investido. `null` sem valuation. */
  moic: number | null;
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
