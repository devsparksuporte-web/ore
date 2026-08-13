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
import { FX_BRL_PER_USD } from "./provenance";

export * from "./provenance";
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

export const ativaStrategicMap: StrategicMap = {
  id: "map-ativa",
  asset: ASSET,
  thesisOriginal: ativa.tese.original ?? undefined,
  thesis: ativa.tese.atual,
  criticalPath,
  objectives,
  keyRisks: ativa.tese.riscos.map((r) => ({ label: r.label, severity: r.severity })),
  success: ativa.tese.sucesso2026,
  decision: ativa.tese.decisao2026,
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
  return [{ id: `ev-${m.id}`, dateISO: o.iso, dateLabel: o.label, title: m.title, kind: KIND[m.category] ?? "milestone", state }];
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

/**
 * Snapshot de performance da Ativa. Valores em USD, como o fundo registra.
 *
 * O que NÃO existe na fonte e por isso vai `null`:
 *  · capital comprometido / chamado / saldo — o workbook controla isso no nível
 *    do Fundo 1, não por investida;
 *  · saldo de caixa e contingências da investida — nenhuma das duas fontes traz;
 *    sem caixa não há runway, e runway estimado seria invenção.
 * O que ENTRA no lugar: os cenários de saída projetados pela própria ORE.
 *
 * O burn é real (forecast, Maio/2026, em BRL) mas só existe para UM mês —
 * não há série mensal, então `burnSeries` fica vazia em vez de interpolada.
 */
export const ativaPerformance: PerformanceSnapshot = {
  assetId: ativa.ATIVA.assetId,
  companySlug: ativa.ATIVA.companySlug,
  currency: "USD",
  fxToBRL: FX_BRL_PER_USD,
  ownershipPct: ativa.valorInvestimento.ownershipPct,
  asOf: ativa.valorInvestimento.asOf,
  sourceLabel: ativa.valorInvestimento.source.label,
  valuation: {
    current: ativa.valorInvestimento.fairValueUSD,
    asOf: ativa.valorInvestimento.asOf,
    method: ativa.valorInvestimento.method,
    investedCapital: ativa.valorInvestimento.costBasisUSD,
    annualSeries: [{ year: 2025, value: ativa.valorInvestimento.fairValueUSD }],
    history: ativa.historicoValuation.map((h) => ({
      asOf: h.asOf, value: h.valueUSD, method: h.method, source: h.source,
    })),
  },
  capital: {
    committed: ativa.capital.committedUSD,
    called: ativa.capital.calledUSD,
    availableBalance: ativa.capital.availableBalanceUSD,
    invested: ativa.capital.investedUSD,
    unavailableReason: ativa.capital.nota,
  },
  liquidity: {
    cash: ativa.liquidez.cashBRL,
    contingencies: ativa.liquidez.contingenciesBRL,
    burnMonthly: ativa.liquidez.burnMonthlyBRL,
    burnQuarterly: null,
    burnAnnual: null,
    burnSeries: [],
    currency: "BRL",
    unclassified: ativa.liquidez.naoMapeadoMesBRL,
    unavailableReason:
      "O saldo de caixa da investida não consta no workbook nem no forecast — sem ele, o runway não é calculável.",
  },
  scenarios: {
    current: ativa.planoSaida.scenariosUSD.current,
    downside: ativa.planoSaida.scenariosUSD.downside,
    base: ativa.planoSaida.scenariosUSD.base,
    upside: ativa.planoSaida.scenariosUSD.upside,
    mechanism: ativa.planoSaida.mechanism,
    window: ativa.planoSaida.window,
    buyers: ativa.planoSaida.buyers,
  },
};
