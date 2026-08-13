/**
 * ADAPTADOR — Ativa Mineração SPE S/A, dados reais do workbook da ORE.
 *
 * Transcrição fiel das abas do workbook de gestão do Fundo 1 e do forecast
 * operacional. Cada bloco declara sua origem (`SOURCES`). Onde a ORE não
 * forneceu o dado, o campo é `null` — jamais um valor plausível (§4 da Sprint 1.4).
 *
 * Unidades: valores de investimento em USD (o fundo reporta em USD milhares);
 * valores operacionais do forecast em BRL. A conversão de apresentação usa o
 * câmbio do próprio workbook e vive no serviço, não aqui.
 *
 * Nomes de veículos de aquisição foram generalizados por decisão do PO
 * (reunião de 27/07/2026) — a plataforma não cita a contraparte.
 */
import { type Fornecido, SOURCES, type SourceRef } from "./provenance";

/* ═════════════════════════ IDENTIFICAÇÃO ═════════════════════════ */

export const ATIVA = {
  assetId: "c-ativa",
  companySlug: "ativa-mineracao",
  /** Razão social como consta no workbook (aba 8). */
  legalName: "Ativa Mineração SPE S/A",
  /** Nome curto usado no portfólio (aba 1 · Composição). */
  displayName: "Ativa Mineração",
  phase: "Licenciamento e engenharia",
  status: "Licenciamento e engenharia — Serrote da Pedra Preta (Ti, FeV)",
  location: "Pernambuco — Floresta e Carnaubeira da Penha",
  source: SOURCES.kpiAtiva,
} as const;

/* ═══════════════════════ VALOR DO INVESTIMENTO ═══════════════════ */
/* Aba "8. KPI Ativa" · SNAPSHOT. Valores em USD (workbook em milhares). */

const K = 1_000;

export const valorInvestimento = {
  costBasisUSD: 9_000 * K,
  fairValueUSD: 11_286 * K,
  unrealizedUSD: 2_286 * K,
  /** TVPI sobre o custo, como o workbook calcula. */
  tvpi: 1.254,
  ownershipPct: 60,
  asOf: "2025-12-31",
  method: "Marcação por fair value",
  source: SOURCES.kpiAtiva,
} as const;

/**
 * Série histórica de marcações. O workbook traz APENAS a marcação Q4'25 para a
 * Ativa — não há histórico por investida. Registrado como um único ponto real
 * em vez de uma curva inventada.
 */
export const historicoValuation: { asOf: string; valueUSD: number; method: string; source: string }[] = [
  { asOf: "2025-12-31", valueUSD: 11_286 * K, method: "Fair value", source: "Workbook de gestão · KPI Ativa" },
];

/* ═════════════════════════ CAPITAL ═══════════════════════════════ */
/**
 * O workbook registra commitments, paid-in e dry powder no nível do FUNDO
 * (aba 4), não por investida. Não existe capital comprometido/chamado da Ativa.
 * Deixar `null` é a única leitura honesta: qualquer rateio seria invenção.
 */
export const capital: {
  committedUSD: Fornecido<number>;
  calledUSD: Fornecido<number>;
  availableBalanceUSD: Fornecido<number>;
  /** O que existe de fato: o custo de aquisição da participação. */
  investedUSD: number;
  nota: string;
  source: SourceRef;
} = {
  committedUSD: null,
  calledUSD: null,
  availableBalanceUSD: null,
  investedUSD: 9_000 * K,
  nota: "O workbook controla commitments e capital chamado no nível do Fundo 1, não por investida.",
  source: SOURCES.capital,
};

/* ═════════════════════════ LIQUIDEZ ══════════════════════════════ */
/**
 * Consumo operacional real vem do forecast (aba "Apresentação", recorte
 * confirmado pelo PO). O SALDO DE CAIXA da Ativa não existe em nenhuma das duas
 * fontes — logo, runway não é calculável e não será estimado.
 *
 * A linha sem classificação do forecast (R$ 1.276.331 em Maio/26) é preservada
 * como "não mapeado", do mesmo modo que o DRE já trata contas sem de-para:
 * o número aparece, e o leitor sabe que ele não está classificado.
 */
export const liquidez = {
  cashBRL: null as Fornecido<number>,
  contingenciesBRL: null as Fornecido<number>,
  /** Maio/2026 — realizado classificado por atividade. */
  burnMonthlyBRL: 616_079.24,
  /** Acumulado do ano até Maio/2026 — realizado classificado. */
  burnYtdBRL: 1_143_244.31,
  /** Parcela do realizado do mês sem classificação de atividade. */
  naoMapeadoMesBRL: 1_276_331.44,
  /** Total do mês incluindo o não mapeado. */
  totalMesBRL: 1_891_410.65,
  orcadoMesBRL: 2_172_636.33,
  asOf: "2026-05-31",
  source: SOURCES.forecast,
} as const;

/** Realizado × orçado por atividade — Maio/2026 (BRL). */
export const atividadesMes: { label: string; realizado: number; orcado: number }[] = [
  { label: "Pessoal", realizado: 360_075.82, orcado: 279_826.39 },
  { label: "Administrativo", realizado: 170_783.18, orcado: 287_775.99 },
  { label: "Operação", realizado: 59_709.1, orcado: 4_800 },
  { label: "Meio ambiente", realizado: 22_511.12, orcado: 121_418.73 },
  { label: "Engenharia", realizado: 2_000, orcado: 15_000 },
  { label: "Geologia", realizado: 0, orcado: 0 },
];

/** Realizado × orçado acumulado do ano até Maio/2026 (BRL). */
export const atividadesAcumulado: { label: string; realizado: number; orcado: number }[] = [
  { label: "Pessoal", realizado: 625_134.96, orcado: 861_764.89 },
  { label: "Administrativo", realizado: 370_360.74, orcado: 651_966.89 },
  { label: "Operação", realizado: 75_059.1, orcado: 27_200 },
  { label: "Meio ambiente", realizado: 73_189.16, orcado: 201_619.29 },
  { label: "Engenharia", realizado: 4_000, orcado: 81_000 },
  { label: "Geologia", realizado: 1_500, orcado: 2_550 },
];

/* ═════════════════════════ ESTRATÉGIA ════════════════════════════ */
/* Aba "5. Mapa Estratégico" — transcrição literal dos campos da Ativa. */

export const tese = {
  atual:
    "Planta Floresta: obter garantia, alocar financiamento BNB, construir e operar. Mina: LP e LI, CAPEX via caixa/equity/dívida. Aquisições complementares por veículo separado. Venda ~50% trader / ~50% mercado.",
  riscos: [
    { label: "Gargalo de garantias na Planta Floresta e/ou funding atrasar cronograma", severity: "critical" as const },
    { label: "Licenciamento, condicionantes e temas fundiários travarem o caminho crítico", severity: "high" as const },
    { label: "Risco técnico-comercial (recuperação / qualidade do produto, demanda / preço)", severity: "high" as const },
  ],
  sucesso2026:
    "Licenças-chave e audiência pública resolvidas. Funding e garantias destravados. CAPEX fase 1 iniciado com cronograma realista. Exit logic definida (quem compra, em que estágio, qual gatilho).",
  decisao2026:
    "Escolher formalmente a arquitetura de implantação (modular vs escala). Definir estratégia de capital (caixa / dívida / equity / M&A). Iniciar racional de saída no longo prazo.",
  /**
   * A ORE não mantém um campo "tese original" no workbook. Não há registro da
   * tese de entrada — não será inventada.
   */
  original: null as Fornecido<string>,
  source: SOURCES.mapa,
};

/* ═══════════════ MILESTONES (licenciamento, engenharia, funding) ═════════ */
/* Aba "8. KPI Ativa". Ordem do workbook: mais recente em cima. */

export type MilestoneStatus = "Concluído" | "Em andamento" | "Agendado" | "Aberto" | "Bloqueado" | "Em avaliação";

export interface Milestone {
  id: string;
  title: string;
  category: "Licenciamento" | "Financiamento" | "Construção" | "Fundiário" | "M&A" | "Estratégica" | "Engenharia";
  /** Responsável como registrado no workbook (órgão, empresa ou função). */
  owner: string;
  /** Prazo/alvo como registrado (nem sempre é uma data fechada). */
  target: string;
  status: MilestoneStatus;
  notes?: string;
}

export const milestones: Milestone[] = [
  { id: "ms-01", title: "Vistoria CPRH no site", category: "Licenciamento", owner: "CPRH", target: "28–29 jan 2026", status: "Agendado" },
  { id: "ms-02", title: "Audiência pública", category: "Licenciamento", owner: "CPRH + Ativa", target: "fev 2026", status: "Em andamento", notes: "Preparativos em curso" },
  { id: "ms-03", title: "SBLC (carta fiança) bancária", category: "Financiamento", owner: "Bancos BR", target: "2º tri 2026", status: "Em andamento", notes: "Roadshow em curso" },
  { id: "ms-04", title: "Início do CAPEX da planta Floresta", category: "Construção", owner: "Ativa", target: "Pós-SBLC", status: "Bloqueado", notes: "Dependência da SBLC" },
  { id: "ms-05", title: "Regularização fundiária Faz. Panamá", category: "Fundiário", owner: "Ativa", target: "1º tri 2026", status: "Bloqueado", notes: "Aguarda definição de limites" },
  { id: "ms-06", title: "Fencing Exu / Panamá", category: "Fundiário", owner: "Ativa", target: "1º tri 2026", status: "Aberto" },
  { id: "ms-07", title: "Aquisições complementares", category: "M&A", owner: "Ore", target: "2026", status: "Em avaliação", notes: "Veículo separado" },
  { id: "ms-08", title: "Decisão da arquitetura de implantação", category: "Estratégica", owner: "BoD Ativa + Ore", target: "1º sem 2026", status: "Aberto", notes: "Modular vs escala" },
  { id: "ms-09", title: "Exit logic — primeiro racional", category: "Estratégica", owner: "Sócios Ore", target: "2º sem 2026", status: "Aberto" },
  { id: "ms-10", title: "Publicação pública do EIA/RIMA", category: "Licenciamento", owner: "Ativa", target: "dez 2025", status: "Concluído", notes: "Publicado em 10/dez/2025" },
  { id: "ms-11", title: "EIA/RIMA — mina completa", category: "Licenciamento", owner: "CPRH", target: "ago–dez 2025", status: "Concluído", notes: "Aceito em dez/2025" },
  { id: "ms-12", title: "RAIPA — arqueológico da mina completa", category: "Licenciamento", owner: "IPHAN", target: "jun 2025", status: "Concluído", notes: "Aprovado" },
  { id: "ms-13", title: "Testes metalúrgicos", category: "Engenharia", owner: "Jupeng / Steinert / Inbras", target: "2025", status: "Concluído", notes: "Process design final" },
  { id: "ms-14", title: "Aprovação de crédito BNB", category: "Financiamento", owner: "BNB", target: "2025", status: "Concluído", notes: "Aguarda SBLC" },
  { id: "ms-15", title: "Engenharia detalhada da planta", category: "Engenharia", owner: "Jupeng + contratados", target: "Em andamento", status: "Em andamento", notes: "Processo Jupeng escolhido" },
  { id: "ms-16", title: "LP + LI Floresta — planta de stockpiles", category: "Licenciamento", owner: "CPRH", target: "2024", status: "Concluído", notes: "Permite 180 kt/ano" },
];

/* ═════════════════════ DECISÕES E AÇÕES (Ativa) ══════════════════ */
/* Aba "2. Decisoes e Acoes" — apenas as linhas do ativo Ativa. */

export interface DecisionRow {
  ref: number;
  title: string;
  context: string;
  type: "decision" | "action";
  priority: "high" | "medium" | "low";
  /** Responsável como registrado no workbook. */
  owner: string;
  dueLabel: string;
  dueISO?: string;
  status: "open" | "in_progress" | "done" | "blocked" | "canceled";
  lastUpdate: string;
}

export const decisoes: DecisionRow[] = [
  {
    ref: 3,
    title: "Destravar SBLC (carta fiança) para desbloquear o BNB",
    context: "Roadshow com bancos brasileiros. Sem SBLC, não sai o desembolso do BNB.",
    type: "action", priority: "high", owner: "CEO Ativa + Ore",
    dueLabel: "30/04/2026", dueISO: "2026-04-30", status: "in_progress", lastUpdate: "Abr/2026",
  },
  {
    ref: 4,
    title: "Audiência pública CPRH (pós EIA/RIMA)",
    context: "Agendada provisoriamente para fev/2026. Vistoria CPRH em 28–29/jan/2026.",
    type: "action", priority: "high", owner: "Ativa + consultores",
    dueLabel: "28/02/2026", dueISO: "2026-02-28", status: "in_progress", lastUpdate: "Abr/2026",
  },
  {
    ref: 11,
    title: "Escolher a arquitetura de implantação (modular vs escala)",
    context: "Definir formalmente, junto com a estratégia de capital (caixa / dívida / equity / M&A).",
    type: "decision", priority: "high", owner: "BoD Ativa",
    dueLabel: "30/06/2026", dueISO: "2026-06-30", status: "open", lastUpdate: "Mar/2026",
  },
  {
    ref: 12,
    title: "Regularização fundiária da Fazenda Panamá",
    context: "Pausado aguardando clarificação de limites. Retomada prevista para o início de 2026.",
    type: "action", priority: "medium", owner: "Ativa",
    dueLabel: "31/03/2026", dueISO: "2026-03-31", status: "blocked", lastUpdate: "Mar/2026",
  },
  {
    ref: 13,
    title: "Iniciar o racional de saída (quem compra, em que estágio, qual gatilho)",
    context: "Lista de potenciais estratégicos, narrativa de venda e timing.",
    type: "decision", priority: "medium", owner: "Sócios Ore",
    dueLabel: "30/09/2026", dueISO: "2026-09-30", status: "open", lastUpdate: "Mar/2026",
  },
];

/* ═════════════════════════ PLANO DE SAÍDA ════════════════════════ */
/* Aba "6. Timeline de Saida" — linha da Ativa. */

export const planoSaida = {
  mechanism: "M&A estratégico após ramp-up; potencial IPO pós-full capacity",
  window: "2028–2030",
  status: "Em andamento",
  buyers: "Majors de Ti/V globais; traders (off-takers); financial sponsors",
  readiness: "Racional a definir em 2026",
  scenariosUSD: { current: 11_286 * K, downside: 8_000 * K, base: 20_000 * K, upside: 40_000 * K },
  source: SOURCES.saida,
} as const;

/* ═══════════════════ PROJETO (visão técnica) ═════════════════════ */
/* Aba "8. KPI Ativa" — VISÃO GERAL DO PROJETO. Texto do workbook. */

export const projeto: { label: string; value: string }[] = [
  { label: "Reservas — stockpiles", value: "542 kt @ 18,7% TiO₂ / 0,37% V₂O₅" },
  { label: "Reservas — in situ", value: "5 Mt @ 11,8% TiO₂ / 0,24% V₂O₅" },
  { label: "Capacidade fase 1 (Floresta)", value: "180 kt/ano" },
  { label: "Capacidade fase 2 (expansão)", value: "600 kt/ano" },
  { label: "Vida útil a plena capacidade", value: "~10 anos" },
  { label: "Receita projetada (full scale)", value: "USD 40 M/ano" },
  { label: "Margem EBITDA projetada", value: "~30%" },
  { label: "CAPEX planta 180 kt/ano", value: "BRL 25 M" },
];
