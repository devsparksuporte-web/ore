/**
 * ADAPTADOR ORE WORKBOOK — porta de saída para o domínio.
 *
 * Traduz a transcrição da planilha (`./ativa`) para os CONTRATOS dos módulos.
 * Só os Services importam daqui. Trocar a planilha por Protheus/API significa
 * reescrever este arquivo e mais nada (ADR-029).
 */
import type {
  CriticalPathStep, Decision, ExitPlan, StrategicMap, StrategyEvent,
} from "@modules/strategy/types";
import type { PerformanceSnapshot } from "@modules/performance/types";
import * as ativa from "./ativa";
import { FX_BRL_PER_USD, SOURCES } from "./provenance";
import {
  CENARIOS_SAIDA, MORRO_VERDE_Q1_2026, POSICOES, type InvestidaSlug,
} from "./portfolio";

export * from "./provenance";
export * from "./kpis";
export * from "./dashboards";
export * from "./portfolio";
export { ativa };

const ASSET = { id: ativa.ATIVA.assetId, label: ativa.ATIVA.displayName, companySlug: ativa.ATIVA.companySlug };

/* ─────────────────────────── Estratégia ─────────────────────────── */

/**
 * Caminho crítico — derivado dos milestones reais, na sequência que destrava a
 * tese (licenciamento → funding → construção → operação). Não é uma narrativa
 * inventada: cada etapa aponta para milestones existentes no workbook, e o
 * estado vem do status registrado lá.
 */
const CAMINHO: { label: string; milestones: string[] }[] = [
  { label: "EIA/RIMA e vistoria CPRH", milestones: ["ms-11", "ms-10", "ms-01"] },
  { label: "Audiência pública", milestones: ["ms-02"] },
  { label: "SBLC → desembolso BNB", milestones: ["ms-03", "ms-14"] },
  { label: "CAPEX fase 1 (construção)", milestones: ["ms-04"] },
  { label: "Operação e ramp-up", milestones: [] },
];

/** Etapa concluída = TODOS os seus milestones concluídos no workbook. */
function concluida(ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => ativa.milestones.find((m) => m.id === id)?.status === "Concluído");
}

/**
 * Caminho crítico tem UMA etapa atual por definição: a primeira que ainda não
 * fechou. Vários milestones podem estar em curso em paralelo (o workbook mostra
 * audiência e SBLC andando juntas), mas o gargalo do caminho é o primeiro elo
 * aberto — marcar três etapas como "atual" destruiria a leitura do stepper.
 */
const primeiraAberta = CAMINHO.findIndex((e) => !concluida(e.milestones));

const criticalPath: CriticalPathStep[] = CAMINHO.map((e, i) => ({
  label: e.label,
  done: concluida(e.milestones),
  current: i === primeiraAberta,
  /* Drill-down: os marcos reais que sustentam a etapa, com responsável, alvo e
     status como o workbook registra. É o que responde "por que está assim?". */
  items: e.milestones.flatMap((id) => {
    const m = ativa.milestones.find((x) => x.id === id);
    return m ? [{ id: m.id, title: m.title, owner: m.owner, target: m.target, status: m.status, notes: m.notes }] : [];
  }),
}));

/**
 * Objetivos do ciclo — as cláusulas da "Definição de sucesso 2026" do workbook,
 * separadas para leitura. Texto real, apenas segmentado; nada acrescentado.
 */
const objectives = ativa.tese.sucesso2026
  .split(". ")
  .map((s) => s.replace(/\.$/, "").trim())
  .filter(Boolean);

/**
 * Sprint 1.4 · item 7 — a tese de entrada não está no workbook. O adaptador
 * traduz esse `null` em ausência DECLARADA (estado + motivo), e não em campo
 * silenciosamente vazio: a tela precisa de algo para mostrar no lugar do texto.
 *
 * `AGUARDANDO_DADOS` e não `NAO_DISPONIVEL` porque a pendência é de entrega,
 * não de natureza da fonte — o campo existe no modelo e há a quem pedir.
 *
 * Sem `SourceRef` aqui de propósito: não há fonte documental para este campo.
 * Declarar uma seria inventar origem — exatamente o que a sprint corrige.
 * Quando a ORE disponibilizar a tese de entrada (desta ou de qualquer outra
 * investida), o adaptador preenche `thesisOriginal` e estes dois campos somem
 * do objeto; nenhum componente muda.
 */
const teseOriginalAusente = ativa.tese.original === null;

export const ativaStrategicMap: StrategicMap = {
  id: "map-ativa",
  asset: ASSET,
  thesisOriginal: ativa.tese.original ?? undefined,
  thesisOriginalStatus: teseOriginalAusente ? "AGUARDANDO_DADOS" : undefined,
  thesisOriginalUnavailableReason: teseOriginalAusente ? ativa.tese.originalMotivo : undefined,
  thesis: ativa.tese.atual,
  criticalPath,
  objectives,
  keyRisks: ativa.tese.riscos.map((r) => ({ label: r.label, severity: r.severity })),
  success: ativa.tese.sucesso2026,
  decision: ativa.tese.decisao2026,
  source: { ...SOURCES.mapa, cell: "B7:F7" },
  dataStatus: "REAL",
  updatedAt: ativa.tese.source.asOf,
};

export const ativaDecisions: Decision[] = ativa.decisoes.map((d) => ({
  id: `dec-ativa-${d.ref}`,
  ref: d.ref,
  asset: ASSET,
  title: d.title,
  context: d.context,
  type: d.type,
  priority: d.priority,
  owner: d.owner,
  dueDate: d.dueLabel,
  dueDateISO: d.dueISO,
  status: d.status,
  lastUpdate: d.lastUpdate,
}));

/**
 * Timeline de execução — milestones com alvo datável, do mais antigo ao mais
 * recente. Milestones sem data fechada ("Pós-SBLC", "Em andamento") ficam fora
 * da linha do tempo e seguem visíveis no caminho crítico e no drill-down.
 */
const ORDEM: { id: string; label: string; iso: string }[] = [
  { id: "ms-16", label: "2024", iso: "2024-12-31" },
  { id: "ms-12", label: "Jun/2025", iso: "2025-06-30" },
  { id: "ms-13", label: "2025", iso: "2025-12-31" },
  { id: "ms-14", label: "2025", iso: "2025-12-31" },
  { id: "ms-11", label: "Dez/2025", iso: "2025-12-31" },
  { id: "ms-10", label: "Dez/2025", iso: "2025-12-10" },
  { id: "ms-01", label: "Jan/2026", iso: "2026-01-28" },
  { id: "ms-02", label: "Fev/2026", iso: "2026-02-28" },
  { id: "ms-05", label: "1º tri/2026", iso: "2026-03-31" },
  { id: "ms-03", label: "2º tri/2026", iso: "2026-06-30" },
  { id: "ms-08", label: "1º sem/2026", iso: "2026-06-30" },
  { id: "ms-09", label: "2º sem/2026", iso: "2026-12-31" },
];

const KIND: Record<string, StrategyEvent["kind"]> = {
  Licenciamento: "milestone", Financiamento: "milestone", Construção: "milestone",
  Fundiário: "milestone", "M&A": "decision", Estratégica: "decision", Engenharia: "delivery",
};

export const ativaTimeline: StrategyEvent[] = ORDEM.flatMap((o) => {
  const m = ativa.milestones.find((x) => x.id === o.id);
  if (!m) return [];
  const state: StrategyEvent["state"] =
    m.status === "Concluído" ? "done"
      : m.status === "Em andamento" || m.status === "Agendado" ? "current"
        : "upcoming";
  return [{
    id: `ev-${m.id}`, dateISO: o.iso, dateLabel: o.label, title: m.title,
    kind: KIND[m.category] ?? "milestone", state,
    /* Fase 5.2 — drill-down do marco. Responsável, alvo, estado e observação
       saem do workbook exatamente como registrados; nada é acrescentado. */
    detail: {
      owner: m.owner, target: m.target, status: m.status, notes: m.notes,
      category: m.category, sourceLabel: SOURCES.kpiAtiva.label, dataStatus: "REAL",
    },
  }];
});

export const ativaExitPlan: ExitPlan = {
  id: "exit-ativa",
  asset: ASSET,
  strategy: ativa.planoSaida.mechanism,
  stages: [
    { label: "Licenciamento" }, { label: "Funding" }, { label: "Construção" },
    { label: "Operação" }, { label: "Saída" },
  ],
  /* Estágio atual: licenciamento resolvido, funding é o gargalo declarado. */
  currentStageIndex: 1,
  nextSteps: [
    "Resolver audiência pública e condicionantes",
    "Destravar SBLC e desembolso do BNB",
    "Definir arquitetura de implantação e racional de saída",
  ],
  horizon: ativa.planoSaida.window,
};

/* ─────────────────────────── Performance ────────────────────────── */

/* ══════════ PERFORMANCE DAS SEIS INVESTIDAS (Sprint 1.5) ═════════════════
 *
 * Gerado da posição documental (`./portfolio`). Regras aplicadas:
 *  · Moeda USD, como o workbook registra. NENHUMA conversão (D6).
 *  · O workbook grava em USD '000; aqui vira USD absoluto (×1.000) — mudança
 *    de UNIDADE, não de moeda nem de valor.
 *  · Caixa, burn, contingências e capital por investida NÃO EXISTEM nos
 *    documentos (exceto Morro Verde) → `null`, com o motivo declarado.
 *  · Runway só é calculável com caixa e consumo reais → ausente para todas.
 *  · O caixa do FUNDO nunca preenche o caixa de uma investida.
 */

const K = 1_000;

const CAPITAL_SEM_FONTE =
  "Os documentos da ORE controlam commitments e capital chamado no nível do Fundo, não por investida.";
const LIQUIDEZ_SEM_FONTE =
  "Nenhum documento disponibilizado informa saldo de caixa desta investida — sem ele, o runway não é calculável.";

/** Série anual: última marcação de cada ano da série documental. */
function serieAnual(pontos: readonly { trimestre: string; asOf: string; valorUSD: number }[]) {
  const porAno = new Map<number, number>();
  for (const p of pontos) porAno.set(Number(p.asOf.slice(0, 4)), p.valorUSD * K);
  return Array.from(porAno.entries()).sort((a, b) => a[0] - b[0]).map(([year, value]) => ({ year, value }));
}

function snapshotDe(slug: InvestidaSlug, assetId: string): PerformanceSnapshot {
  const pos = POSICOES[slug];
  const cen = CENARIOS_SAIDA[slug];
  const asOf = pos.source.asOf ?? "2025-12-31";
  return {
    assetId,
    companySlug: slug,
    currency: "USD",
    ownershipPct: pos.ownership === null ? null : Math.round(pos.ownership * 10000) / 100,
    asOf,
    sourceLabel: pos.source.label,
    valuation: {
      current: pos.fairValueUSD === null ? null : pos.fairValueUSD * K,
      asOf,
      method: pos.metodo,
      investedCapital: pos.costBasisUSD * K,
      annualSeries: serieAnual(pos.serieFV),
      /* Histórico = a série trimestral inteira, do mais recente ao mais antigo.
         Cada marcação preserva a SUA data-base (D1).
         Fase 5.2 · ORE-51-008 — a fonte de cada linha vinha de `pos.source`,
         cujo rótulo já termina em "Posição Q4 2025"; somado ao trimestre da
         linha, produzia "Posição Q4 2025 · Q4 2025". A série tem origem
         própria na planilha (range A27:Y33) e é ela que deve ser citada. */
      history: [...pos.serieFV].reverse().map((p) => ({
        asOf: p.asOf, value: p.valorUSD * K, method: pos.metodo,
        source: `${SOURCES.serieFV.label} · ${p.trimestre}`,
      })),
      seriesStatus: pos.serieStatus ?? pos.fairValueStatus,
      seriesNote: pos.serieNota,
    },
    capital: {
      committed: null, called: null, availableBalance: null,
      invested: pos.costBasisUSD * K,
      unavailableReason: CAPITAL_SEM_FONTE,
    },
    liquidity: {
      cash: null, contingencies: null,
      burnMonthly: null, burnQuarterly: null, burnAnnual: null, burnSeries: [],
      currency: "USD", burnAsOf: null, burnPeriodLabel: null, cashAsOf: null,
      unavailableReason: LIQUIDEZ_SEM_FONTE,
    },
    scenarios: {
      current: cen.fvAtualUSD * K, downside: cen.downsideUSD * K,
      base: cen.baseUSD * K, upside: cen.upsideUSD * K,
      mechanism: cen.mecanismo, window: cen.janela, buyers: cen.compradores,
    },
    fieldStatus: {
      valuation: pos.fairValueStatus,
      ownership: pos.ownershipStatus,
      capital: "AGUARDANDO_DADOS",
      liquidity: "AGUARDANDO_DADOS",
      runway: "AGUARDANDO_DADOS",
      scenarios: "REAL",
    },
  };
}

const ASSET_ID: Record<InvestidaSlug, string> = {
  "ativa-mineracao": "c-ativa", "nazareno-gold": "c-nazareno", "morro-verde": "c-morroverde",
  "rio-novo": "c-rionovo", "alvo-minerals": "c-alvo", "neeo-exploration": "c-neeo",
};

/**
 * Ativa. Base documental do workbook + o consumo mensal REAL do forecast
 * operacional — única investida com burn documentado.
 */
export const ativaPerformance: PerformanceSnapshot = {
  ...snapshotDe("ativa-mineracao", ASSET_ID["ativa-mineracao"]),
  fxToBRL: FX_BRL_PER_USD,
  liquidity: {
    cash: null, contingencies: null,
    burnMonthly: ativa.liquidez.burnMonthlyBRL,
    burnQuarterly: null, burnAnnual: null, burnSeries: [],
    /* Consumo em BRL — moeda do forecast; o valuation é USD. Moedas distintas
       para dados distintos, nunca misturadas no mesmo indicador (D6). */
    currency: "BRL",
    unclassified: ativa.liquidez.naoMapeadoMesBRL,
    burnAsOf: ativa.liquidez.asOf,
    burnPeriodLabel: null,
    unavailableReason: LIQUIDEZ_SEM_FONTE,
  },
};

/**
 * Morro Verde — única investida com caixa documentado (Q1/2026, 31/03/2026).
 * Essa data-base é DIFERENTE da do fair value (31/12/2025): as duas convivem,
 * cada uma declarando a sua (D1). Moeda BRL, como a fonte registra.
 */
export const morroVerdePerformance: PerformanceSnapshot = {
  ...snapshotDe("morro-verde", ASSET_ID["morro-verde"]),
  liquidity: {
    cash: MORRO_VERDE_Q1_2026.caixaBRLmm * 1_000_000,
    contingencies: null,
    burnMonthly: null, burnQuarterly: null, burnAnnual: null, burnSeries: [],
    currency: "BRL",
    burnAsOf: null,
    burnPeriodLabel: null,
    cashAsOf: MORRO_VERDE_Q1_2026.asOf,
    unavailableReason:
      "O caixa vem do relatório Q1/2026 (data-base 31/03/2026). O consumo mensal não é publicado por investida — sem ele, o runway não é calculável.",
  },
  fieldStatus: {
    valuation: "REAL", ownership: "REAL", capital: "AGUARDANDO_DADOS",
    liquidity: "REAL", runway: "AGUARDANDO_DADOS", scenarios: "REAL",
  },
};

export const nazarenoPerformance = snapshotDe("nazareno-gold", ASSET_ID["nazareno-gold"]);
export const rioNovoPerformance = snapshotDe("rio-novo", ASSET_ID["rio-novo"]);
export const alvoPerformance = snapshotDe("alvo-minerals", ASSET_ID["alvo-minerals"]);
export const neeoPerformance = snapshotDe("neeo-exploration", ASSET_ID["neeo-exploration"]);

/** As seis — consumido pelo port de Performance. */
export const portfolioPerformance: PerformanceSnapshot[] = [
  ativaPerformance, morroVerdePerformance, nazarenoPerformance,
  rioNovoPerformance, alvoPerformance, neeoPerformance,
];
