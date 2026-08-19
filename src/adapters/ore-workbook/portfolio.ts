/**
 * PORTFÓLIO DA ORE — posição documental das SEIS investidas.
 *
 * Sprint 1.5. Transcrição fiel da aba "13. Base de Dados" do workbook de
 * gestão (fonte única declarada pelo próprio arquivo: "editar aqui, todas as
 * abas atualizam"), complementada pelas abas KPI e pela Timeline de Saída.
 *
 * Por que este arquivo existe: até a Sprint 1.4 o adaptador conhecia apenas a
 * Ativa, e as outras cinco investidas viviam de mocks. O workbook sempre teve
 * abas KPI para todas as seis — a plataforma é que só lia uma. A Ativa não é
 * um caso especial de implementação: é o primeiro dataset que foi lido.
 *
 * ⚠️ REGRAS (Sprint 1.5, decisões D1–D8):
 *  · Cada dado preserva a data-base do documento de onde saiu. Valor mais
 *    recente NÃO sobrescreve o anterior: convivem como histórico temporal.
 *  · Moeda preservada como na fonte. NENHUMA conversão USD↔BRL↔AUD.
 *  · Conflito documental sem explicação NÃO é resolvido por escolha: fica
 *    declarado em `CONFLITOS` e o campo vai a AGUARDANDO_DEFINIÇÃO.
 *  · Dado do FUNDO nunca alimenta tela de investida.
 */
import type { DataStatus, Fornecido, SourceRef } from "@modules/data-source";
import { SOURCES } from "./provenance";

/** Slug da investida na plataforma. Ponte documento → produto. */
export type InvestidaSlug =
  | "ativa-mineracao" | "nazareno-gold" | "morro-verde"
  | "rio-novo" | "alvo-minerals" | "neeo-exploration";

/**
 * Nome da investida NO DOCUMENTO × nome na plataforma. Mapeamento explícito e
 * confirmado pelo conteúdo (commodity, local, cost basis, data do
 * investimento) — nunca por semelhança de nome.
 */
export const NOME_DOCUMENTAL: Record<InvestidaSlug, string> = {
  "ativa-mineracao": "Ativa Mineracao",
  "nazareno-gold": "NZR Gold",
  "morro-verde": "Morro Verde",
  "rio-novo": "IOCG Norte",
  "alvo-minerals": "Alvo Minerals",
  "neeo-exploration": "Neeo Minerals",
};

/** Um ponto da série trimestral de fair value. Moeda da fonte: USD. */
export interface PontoFV {
  /** Rótulo do trimestre como o workbook registra (ex.: "Q4 2025"). */
  trimestre: string;
  /** Data-base do fim do trimestre (ISO). */
  asOf: string;
  /** Fair value em USD '000, como a fonte registra. Sem conversão. */
  valorUSD: number;
}

/** Posição de uma investida na aba "13. Base de Dados", linhas 17 a 22. */
export interface PosicaoInvestida {
  slug: InvestidaSlug;
  /** Custo de aquisição em USD '000. */
  costBasisUSD: number;
  /** Fair value em USD '000 na data-base do workbook. */
  fairValueUSD: Fornecido<number>;
  /** Participação da Ore (0–1). `null` quando os documentos conflitam. */
  ownership: Fornecido<number>;
  /** Estado do ownership — AGUARDANDO_DEFINIÇÃO vira AGUARDANDO_DADOS na UI. */
  ownershipStatus: DataStatus;
  /** Método de marcação, como a fonte nomeia. */
  metodo: string;
  /** Data do investimento (ISO). */
  investidoEm: string;
  /** Commodities, como a fonte lista. */
  commodities: string;
  /** Fase do ativo, como a fonte nomeia. */
  fase: string;
  /** Série trimestral de fair value. Vazia só se a fonte não trouxer. */
  serieFV: PontoFV[];
  /** Origem, com célula/range. */
  source: SourceRef;
  /** Estado do fair value. */
  fairValueStatus: DataStatus;
  /** Estado da SÉRIE trimestral — nem sempre igual ao do fair value atual. */
  serieStatus?: DataStatus;
  /** Ressalva de uma linha sobre a série, quando há conflito documental. */
  serieNota?: string;
}

/* ═══════════ SÉRIE TRIMESTRAL DE FAIR VALUE (Base de Dados A27:Y33) ═══════
 * Transcrição literal. Trimestres sem valor na planilha ficam FORA da série —
 * não são preenchidos com zero nem interpolados. */

const T = (trimestre: string, asOf: string, valorUSD: number): PontoFV => ({ trimestre, asOf, valorUSD });

const SERIE_MORRO_VERDE: PontoFV[] = [
  T("Q4 2023", "2023-12-31", 14151), T("Q1 2024", "2024-03-31", 14151),
  T("Q2 2024", "2024-06-30", 16103), T("Q3 2024", "2024-09-30", 16103),
  T("Q4 2024", "2024-12-31", 17970), T("Q1 2025", "2025-03-31", 22168),
  T("Q2 2025", "2025-06-30", 22168), T("Q3 2025", "2025-09-30", 22168),
  T("Q4 2025", "2025-12-31", 14847),
];

const SERIE_ATIVA: PontoFV[] = [
  T("Q4 2022", "2022-12-31", 1400), T("Q1 2023", "2023-03-31", 1400),
  T("Q2 2023", "2023-06-30", 1400), T("Q3 2023", "2023-09-30", 1400),
  T("Q4 2023", "2023-12-31", 4000), T("Q1 2024", "2024-03-31", 5033),
  T("Q2 2024", "2024-06-30", 5033), T("Q3 2024", "2024-09-30", 5033),
  T("Q4 2024", "2024-12-31", 6829), T("Q1 2025", "2025-03-31", 9329),
  T("Q2 2025", "2025-06-30", 9329), T("Q3 2025", "2025-09-30", 9329),
  T("Q4 2025", "2025-12-31", 11286),
];

const SERIE_NZR: PontoFV[] = [
  T("Q4 2021", "2021-12-31", 1500), T("Q1 2022", "2022-03-31", 1500),
  T("Q2 2022", "2022-06-30", 1500), T("Q3 2022", "2022-09-30", 1500),
  T("Q4 2022", "2022-12-31", 3000), T("Q1 2023", "2023-03-31", 3000),
  T("Q2 2023", "2023-06-30", 3000), T("Q3 2023", "2023-09-30", 3000),
  T("Q4 2023", "2023-12-31", 3000), T("Q1 2024", "2024-03-31", 5250),
  T("Q2 2024", "2024-06-30", 6050), T("Q3 2024", "2024-09-30", 6050),
  T("Q4 2024", "2024-12-31", 7342), T("Q1 2025", "2025-03-31", 7342),
  T("Q2 2025", "2025-06-30", 7342), T("Q3 2025", "2025-09-30", 7342),
  T("Q4 2025", "2025-12-31", 9155),
];

const SERIE_IOCG: PontoFV[] = [
  T("Q2 2021", "2021-06-30", 450), T("Q3 2021", "2021-09-30", 750),
  T("Q4 2021", "2021-12-31", 750), T("Q1 2022", "2022-03-31", 750),
  T("Q2 2022", "2022-06-30", 750), T("Q3 2022", "2022-09-30", 750),
  T("Q4 2022", "2022-12-31", 750), T("Q1 2023", "2023-03-31", 750),
  T("Q2 2023", "2023-06-30", 750), T("Q3 2023", "2023-09-30", 750),
  T("Q4 2023", "2023-12-31", 750), T("Q1 2024", "2024-03-31", 750),
  T("Q2 2024", "2024-06-30", 750), T("Q3 2024", "2024-09-30", 750),
  T("Q4 2024", "2024-12-31", 801), T("Q1 2025", "2025-03-31", 801),
  T("Q2 2025", "2025-06-30", 801), T("Q3 2025", "2025-09-30", 801),
  T("Q4 2025", "2025-12-31", 801),
];

/* Fase 5.2 · ORE-51-003 — o ponto "Q1 2024 · US$ 0" foi REMOVIDO da série.
   CORREÇÃO DE JUSTIFICATIVA (Fase 6): a nota original afirmava que a célula
   estava vazia. Está errado — conferido na planilha, R32 traz 0 EXPLÍCITO.
   A remoção continua correta, mas por outro motivo: a Alvo só foi investida
   em 29/04/2024, já no Q2, e aquele 0 marca "ainda não estava no portfólio",
   não uma marcação a valor zero. Plotá-lo faria o gráfico abrir com uma queda
   a zero que nenhum documento afirma.
   Inconsistência da fonte, registrada: as demais investidas marcam o período
   pré-investimento com célula VAZIA; só a Alvo usa 0. */
const SERIE_ALVO: PontoFV[] = [
  T("Q2 2024", "2024-06-30", 2590),
  T("Q3 2024", "2024-09-30", 2590), T("Q4 2024", "2024-12-31", 721),
  T("Q1 2025", "2025-03-31", 960), T("Q2 2025", "2025-06-30", 337),
  T("Q3 2025", "2025-09-30", 416), T("Q4 2025", "2025-12-31", 1248),
];

const SERIE_NEEO: PontoFV[] = [
  T("Q1 2022", "2022-03-31", 77), T("Q2 2022", "2022-06-30", 77),
  T("Q3 2022", "2022-09-30", 77), T("Q4 2022", "2022-12-31", 77),
  T("Q1 2023", "2023-03-31", 77), T("Q2 2023", "2023-06-30", 77),
  T("Q3 2023", "2023-09-30", 77), T("Q4 2023", "2023-12-31", 77),
  T("Q1 2024", "2024-03-31", 77), T("Q2 2024", "2024-06-30", 77),
  T("Q3 2024", "2024-09-30", 77), T("Q4 2024", "2024-12-31", 77),
  T("Q1 2025", "2025-03-31", 77), T("Q2 2025", "2025-06-30", 77),
  T("Q3 2025", "2025-09-30", 77), T("Q4 2025", "2025-12-31", 153),
];

/* ═══════════════ POSIÇÃO POR INVESTIDA (Base de Dados A16:I22) ═══════════ */

export const POSICOES: Record<InvestidaSlug, PosicaoInvestida> = {
  "morro-verde": {
    slug: "morro-verde", costBasisUSD: 20253, fairValueUSD: 14847,
    ownership: 0.4236, ownershipStatus: "REAL",
    metodo: "Model based", investidoEm: "2023-10-11",
    commodities: "Fosfato, Calcário", fase: "Mine Production",
    serieFV: SERIE_MORRO_VERDE, fairValueStatus: "REAL",
    source: { ...SOURCES.posicaoQ4, cell: "B17:I17" },
  },
  "ativa-mineracao": {
    slug: "ativa-mineracao", costBasisUSD: 9000, fairValueUSD: 11286,
    ownership: 0.6, ownershipStatus: "REAL",
    metodo: "Model based", investidoEm: "2022-07-04",
    commodities: "Titânio, Vanádio", fase: "Licensing and Engineering",
    serieFV: SERIE_ATIVA, fairValueStatus: "REAL",
    source: { ...SOURCES.posicaoQ4, cell: "B18:I18" },
  },
  "nazareno-gold": {
    slug: "nazareno-gold", costBasisUSD: 3850, fairValueUSD: 9155,
    ownership: 0.5298, ownershipStatus: "REAL",
    metodo: "Model based", investidoEm: "2021-07-14",
    commodities: "Ouro", fase: "NI 43-101 + estudos econômicos",
    serieFV: SERIE_NZR, fairValueStatus: "REAL",
    source: { ...SOURCES.posicaoQ4, cell: "B19:I19" },
  },
  "rio-novo": {
    slug: "rio-novo", costBasisUSD: 801, fairValueUSD: 801,
    ownership: 1, ownershipStatus: "REAL",
    metodo: "Investment", investidoEm: "2021-04-26",
    commodities: "Cobre, Ouro, Ferro", fase: "Exploration (Centaurus earn-in)",
    serieFV: SERIE_IOCG, fairValueStatus: "REAL",
    source: { ...SOURCES.posicaoQ4, cell: "B20:I20" },
  },
  "alvo-minerals": {
    slug: "alvo-minerals", costBasisUSD: 2643,
    /* CONFLITO-03 (D4): fair value e ownership da Alvo divergem entre os
       documentos sem explicação, e o próprio Q1/2026 se contradiz internamente
       (tabela p.10 traz 383.063 enquanto a ficha p.24 mantém 1,25 mm). Não há
       base para eleger um valor: ambos vão a `null` e a UI declara a ausência.
       O cost basis, esse sim, é consistente nos três documentos. */
    fairValueUSD: null, ownership: null, ownershipStatus: "NAO_DISPONIVEL",
    metodo: "Market prices", investidoEm: "2024-04-29",
    commodities: "Zinco, Cobre, REE", fase: "Early-Stage Exploration",
    serieFV: SERIE_ALVO, fairValueStatus: "NAO_DISPONIVEL",
    /* A série é transcrição literal do que o workbook registrou trimestre a
       trimestre. O que está em conflito é a marcação de 31/12/2025, sobre a
       qual quatro documentos divergem (CONF-03). A série continua visível
       porque é o que a fonte reportou — mas com a ressalva na tela. */
    serieStatus: "REAL",
    serieNota:
      "Marcações como os documentos as reportaram. A de 31/12/2025 está em conflito documental em aberto — quatro fontes divergem sobre o valor. Nenhuma foi eleita.",
    source: { ...SOURCES.posicaoQ4, cell: "B21:I21" },
  },
  "neeo-exploration": {
    slug: "neeo-exploration", costBasisUSD: 153, fairValueUSD: 153,
    ownership: 1, ownershipStatus: "REAL",
    metodo: "Investment", investidoEm: "2022-05-11",
    commodities: "Ouro, Cobre, Titânio", fase: "Early-Stage Exploration",
    serieFV: SERIE_NEEO, fairValueStatus: "REAL",
    source: { ...SOURCES.posicaoQ4, cell: "B22:I22" },
  },
};

/* ═════════════ CENÁRIOS DE SAÍDA (aba "6. Timeline de Saida") ════════════ */

export interface CenarioSaida {
  mecanismo: string;
  janela: string;
  compradores: string;
  /** USD '000, moeda da fonte. */
  fvAtualUSD: number;
  downsideUSD: number;
  baseUSD: number;
  upsideUSD: number;
  source: SourceRef;
}

const saidaSource = (cell: string): SourceRef => ({ ...SOURCES.saida, cell });

export const CENARIOS_SAIDA: Record<InvestidaSlug, CenarioSaida> = {
  "morro-verde": {
    mecanismo: "M&A estratégico via NewCo Massari; IPO improvável no curto prazo",
    janela: "2029–2030", compradores: "Estratégicos de fertilizantes / agroinsumos; financial sponsors em plataformas",
    fvAtualUSD: 14847, downsideUSD: 10000, baseUSD: 25000, upsideUSD: 40000, source: saidaSource("B6:K6"),
  },
  "ativa-mineracao": {
    mecanismo: "M&A estratégico após ramp-up; potencial IPO pós-full capacity",
    janela: "2028–2030", compradores: "Majors de Ti/V globais; traders (off-takers); financial sponsors",
    fvAtualUSD: 11286, downsideUSD: 8000, baseUSD: 20000, upsideUSD: 40000, source: saidaSource("B7:K7"),
  },
  "nazareno-gold": {
    mecanismo: "Venda de pacote exploratório (cash + earn-outs + royalty)",
    janela: "2026–2027", compradores: "Aura, Jaguar, Cerrado Gold, Goldmining; majors latam",
    fvAtualUSD: 9155, downsideUSD: 4000, baseUSD: 9000, upsideUSD: 18000, source: saidaSource("B8:K8"),
  },
  "rio-novo": {
    mecanismo: "Earn-in Centaurus — pagamentos por milestones + NSR 0,5%",
    janela: "2026–2030", compradores: "Centaurus Metals (acordo ativo)",
    fvAtualUSD: 801, downsideUSD: 0, baseUSD: 800, upsideUSD: 3000, source: saidaSource("B9:K9"),
  },
  "alvo-minerals": {
    mecanismo: "Block trading ou saída gradual via TSX; alternativa estratégica",
    janela: "2026–2029", compradores: "Mercado público (TSX); estratégico em re-rating",
    fvAtualUSD: 1248, downsideUSD: 500, baseUSD: 1500, upsideUSD: 4000, source: saidaSource("B10:K10"),
  },
  "neeo-exploration": {
    mecanismo: "JV / venda / cessão (standalone ou empacotada com NZR)",
    janela: "2026–2027", compradores: "Juniores exploradoras; pacote com NZR para majors",
    fvAtualUSD: 153, downsideUSD: 0, baseUSD: 150, upsideUSD: 500, source: saidaSource("B11:K11"),
  },
};

/* ═══════════ MORRO VERDE — OPERACIONAL (aba 7 + Q1/2026 p.20/21) ═════════
 * Única investida com financeiro por empresa nos documentos. Moeda BRL, como a
 * fonte registra — sem conversão. EBITDA Gerencial e Contábil são métricas
 * DISTINTAS e permanecem separadas (D5). */

export interface AnoOperacionalMV {
  ano: string;
  receitaLiquidaBRLmm: number;
  ebitdaGerencialBRLmm: number;
  ebitdaContabilBRLmm: number;
  margemEbitdaGerencial: Fornecido<number>;
  producaoFosfatoKt: Fornecido<number>;
  producaoCalcarioKt: Fornecido<number>;
  vendasFosfatoKt: Fornecido<number>;
  vendasCalcarioKt: Fornecido<number>;
  /** "Real" ou "Budget" — projeção nunca é apresentada como realizado. */
  natureza: "Realizado" | "Orçado";
}

export const MORRO_VERDE_OPERACIONAL: AnoOperacionalMV[] = [
  { ano: "2025", receitaLiquidaBRLmm: 106.3, ebitdaGerencialBRLmm: 30.5, ebitdaContabilBRLmm: 27.9,
    margemEbitdaGerencial: 0.271, producaoFosfatoKt: 269.9, producaoCalcarioKt: 241.4,
    vendasFosfatoKt: 282.6, vendasCalcarioKt: 241.7, natureza: "Realizado" },
  { ano: "2024", receitaLiquidaBRLmm: 84.1, ebitdaGerencialBRLmm: 24.1, ebitdaContabilBRLmm: 30,
    margemEbitdaGerencial: 0.286, producaoFosfatoKt: 179, producaoCalcarioKt: 253,
    vendasFosfatoKt: 210.8, vendasCalcarioKt: 244.8, natureza: "Realizado" },
  { ano: "2023", receitaLiquidaBRLmm: 81.8, ebitdaGerencialBRLmm: 6.6, ebitdaContabilBRLmm: -35.8,
    margemEbitdaGerencial: 0.09, producaoFosfatoKt: 0, producaoCalcarioKt: 0,
    vendasFosfatoKt: 0, vendasCalcarioKt: 0, natureza: "Realizado" },
  /* Fase 6 — produção e vendas de 2022 estavam como `null` ("a fonte não
     registra"). Conferido na planilha: as células trazem 0 EXPLÍCITO, como em
     2023. Zero é o valor (a mina não produzia), não a ausência dele — e a
     distinção importa, porque `null` some da tela e 0 aparece. */
  { ano: "2022", receitaLiquidaBRLmm: 132.1, ebitdaGerencialBRLmm: 66.2, ebitdaContabilBRLmm: 66.2,
    margemEbitdaGerencial: 0.501, producaoFosfatoKt: 0, producaoCalcarioKt: 0,
    vendasFosfatoKt: 0, vendasCalcarioKt: 0, natureza: "Realizado" },
];

/** Orçamento 2025 — declarado como ORÇADO, nunca como realizado (D18/§18). */
export const MORRO_VERDE_ORCADO_2025 = {
  receitaLiquidaBRLmm: 96.1, ebitdaGerencialBRLmm: 33.5, ebitdaContabilBRLmm: 33.5,
  margemEbitdaGerencial: 0.33, producaoFosfatoKt: 206.7, producaoCalcarioKt: 352.4,
  source: { ...SOURCES.kpiMorroVerde, range: "B16:E24" },
} as const;

/**
 * Caixa e dívida do Morro Verde — Q1/2026. Único caixa POR INVESTIDA
 * encontrado nos documentos. Data-base própria (31/03/2026), distinta da
 * data-base do fair value (31/12/2025): as duas convivem (D1).
 */
export const MORRO_VERDE_Q1_2026 = {
  receitaLiquidaBRLmil: 42368,
  ebitdaGerencialBRLmil: -589,
  ebitdaContabilBRLmil: -589,
  caixaBRLmm: 14.03,
  caixaAberturaBRLmm: 37.01,
  dividaBrutaBRLmm: 271.7,
  dividaLiquidaBRLmm: 257.7,
  alavancagem: 3.2,
  asOf: "2026-03-31",
  source: { ...SOURCES.q1_2026, page: "p.20–21" },
} as const;

/* ════════════════════════ CONFLITOS DOCUMENTAIS ═════════════════════════
 * Registrados, não resolvidos (D2, D3, D4, D5 e §15). A plataforma pode
 * exibi-los; o que ela não pode é escolher em silêncio. */

export interface ConflitoDocumental {
  id: string;
  slug: InvestidaSlug | "fundo";
  dado: string;
  /** Divergência explicada pela data-base (histórico) ou sem explicação. */
  natureza: "evolucao-temporal" | "sem-explicacao";
  valores: { valor: string; asOf: string; documento: string; referencia?: string }[];
  nota: string;
}

export const CONFLITOS: ConflitoDocumental[] = [
  {
    id: "CONF-01", slug: "ativa-mineracao", dado: "Fair value", natureza: "evolucao-temporal",
    valores: [
      { valor: "USD 11.286.377", asOf: "2025-12-31", documento: "Workbook · Base de Dados / Q4 2025 / Q1 2026", referencia: "C18 · p.9 · p.10" },
      { valor: "USD 11.140.961", asOf: "2026-04-30", documento: "AGM 2026", referencia: "p.67" },
    ],
    nota: "Datas-base distintas — tratado como histórico temporal (D2). O valor de 31/12/2025 permanece como marcação da sua data-base; o de 30/04/2026 é a observação mais recente. Nenhum documento comenta a variação de USD 145.416.",
  },
  {
    id: "CONF-02", slug: "nazareno-gold", dado: "Cost basis", natureza: "sem-explicacao",
    valores: [
      { valor: "USD 3.850.000", asOf: "2025-12-31", documento: "Workbook / Q4 2025 / Q1 2026", referencia: "B19 · p.9 · p.10" },
      { valor: "USD 4.050.000", asOf: "2026-04-30", documento: "AGM 2026", referencia: "p.67" },
    ],
    nota: "Valor principal adotado: USD 3.850.000 (D3), por constar em três fontes independentes. A diferença de USD 200.000 não tem explicação nos documentos — a reserva da Phase 3.2/3.3 (USD 1,15 mm) segue descrita como pendente. Conflito mantido em aberto.",
  },
  {
    id: "CONF-03", slug: "alvo-minerals", dado: "Fair value e ownership", natureza: "sem-explicacao",
    valores: [
      { valor: "FV USD 1.247.594 · ownership 9,56%", asOf: "2025-12-31", documento: "Q4 2025", referencia: "p.9 · p.11" },
      { valor: "FV USD 383.063 · ownership 9,56%", asOf: "2026-03-31", documento: "Q1 2026 (tabela)", referencia: "p.10 · p.12" },
      { valor: "FV USD 1.250.000 · unrealized (47%)", asOf: "2026-03-31", documento: "Q1 2026 (ficha)", referencia: "p.24" },
      { valor: "FV USD 503.589 · ownership 19,9%", asOf: "2026-04-30", documento: "AGM 2026", referencia: "p.49 · p.67" },
    ],
    nota: "O Q1/2026 se contradiz internamente (tabela × ficha) e a AGM traz um ownership incompatível com os dois trimestrais, comparando-se a um trimestre corrente/futuro ('8,2% no 2Q26'). Sem base para eleger um valor: fair value e ownership ficam em AGUARDANDO_DEFINIÇÃO (D4). O cost basis, consistente nos três, é preservado.",
  },
  {
    id: "CONF-04", slug: "morro-verde", dado: "Receita líquida 2025", natureza: "sem-explicacao",
    valores: [
      { valor: "R$ 106,262 mm", asOf: "2025-12-31", documento: "Q4 2025 · DRE gerencial", referencia: "p.19" },
      { valor: "R$ 112 mm", asOf: "2025-12-31", documento: "Q4 2025 · texto", referencia: "p.18" },
      { valor: "R$ 108,1 mm", asOf: "2025-12-31", documento: "Q4/Q1/AGM · gráfico da fusão", referencia: "p.21 · p.22 · p.62" },
    ],
    nota: "Valor adotado: R$ 106,262 mm, da DRE, fonte primária por decisão (D5). O R$ 112 mm do texto corresponde à receita BRUTA (112.526 na DRE) e NÃO deve ser lido como líquida. O R$ 108,1 mm dos gráficos permanece como conflito.",
  },
  {
    id: "CONF-05", slug: "morro-verde", dado: "EBITDA 2025", natureza: "sem-explicacao",
    valores: [
      { valor: "R$ 30,5 mm (gerencial) · R$ 27,9 mm (contábil)", asOf: "2025-12-31", documento: "Q4 2025 · DRE", referencia: "p.19" },
      { valor: "R$ 29,0 mm", asOf: "2025-12-31", documento: "Q4/Q1 · gráfico da fusão", referencia: "p.21 · p.22" },
      { valor: "R$ 28,1 mm", asOf: "2025-12-31", documento: "AGM 2026", referencia: "p.62" },
    ],
    nota: "Adotados os dois valores da DRE, preservados como métricas DISTINTAS (D5): EBITDA Gerencial ≠ EBITDA Contábil. Os valores dos gráficos não são atribuíveis a nenhuma das duas definições e ficam registrados como conflito.",
  },
  {
    /* Fase 6 — encontrado ao transcrever a aba 3. Não é divergência entre
       documentos diferentes: é o MESMO arquivo discordando de si mesmo. */
    id: "CONF-07", slug: "morro-verde", dado: "Receita líquida e EBITDA (série anual)", natureza: "sem-explicacao",
    valores: [
      { valor: "2024: BRL 84,1 mm · 2025: BRL 106,3 mm", asOf: "2025-12-31", documento: "Workbook · KPI Morro Verde", referencia: "aba 7 · D17:H17" },
      { valor: "2024: BRL 92,4 mm · 2025: BRL 112,5 mm", asOf: "2025-12-31", documento: "Workbook · Dashboard (tabela de gráfico)", referencia: "aba 3 · N99:P103" },
      { valor: "2023 EBITDA: BRL 6,6 mm (gerencial) / −35,8 mm (contábil)", asOf: "2023-12-31", documento: "Workbook · KPI Morro Verde", referencia: "aba 7 · G18:G19" },
      { valor: "2023 EBITDA: BRL −36 mm", asOf: "2023-12-31", documento: "Workbook · Dashboard (tabela de gráfico)", referencia: "aba 3 · P101" },
    ],
    nota: "A aba de KPI e a tabela que alimenta o gráfico do Dashboard, dentro do MESMO workbook, registram receitas e EBITDA diferentes para os mesmos exercícios. A plataforma adota a aba de KPI (7), que distingue realizado de orçado e separa EBITDA gerencial de contábil — mas o conflito NÃO está resolvido: nenhuma das duas foi declarada correta, e a divergência precisa ser esclarecida pela Ore.",
  },
  {
    id: "CONF-06", slug: "ativa-mineracao", dado: "Recursos minerais", natureza: "sem-explicacao",
    valores: [
      { valor: "542 kt de pilhas @ 18,7% TiO₂ + 5 Mt in situ @ 11,8% TiO₂", asOf: "2025-12-31", documento: "Workbook · KPI Ativa / Q4 / Q1", referencia: "C17:C18 · p.16 · p.17" },
      { valor: "58 Mt @ 13,95% TiO₂", asOf: "2026-04-30", documento: "AGM 2026", referencia: "p.9" },
      { valor: "3,4 Mt @ 13,95% TiO₂", asOf: "2026-04-30", documento: "AGM 2026", referencia: "p.22 · p.25" },
    ],
    nota: "Quatro bases distintas e teores divergentes, inclusive dentro da própria AGM. Não incorporado à plataforma até definição da ORE.",
  },
];

/** Conflitos de uma investida — alimenta a exibição de origem. */
export function conflitosDe(slug: InvestidaSlug): ConflitoDocumental[] {
  return CONFLITOS.filter((c) => c.slug === slug);
}

/* ═══════════ COBERTURA DOCUMENTAL POR MÓDULO (Fase 5.2 · ORE-51-001) ═════
 *
 * `Company.dataStatus` responde "existe fonte documental rastreável nesta
 * investida?" — e, desde a Sprint 1.5, a resposta é SIM para as seis: o
 * workbook cobre cost basis, fair value, ownership, série trimestral, cenários
 * de saída, mapa estratégico e milestones de todas elas.
 *
 * O que NÃO é uniforme é a cobertura POR MÓDULO. Esta tabela existe para que a
 * interface possa dizer exatamente onde há fonte e onde não há, em vez de
 * reduzir a investida a um único selo — que era o defeito apontado por
 * ORE-51-001: cinco investidas descritas como "sem fonte documental" quando
 * cinco módulos delas já vinham de documento.
 */
export type ModuloCrystal = "estrategia" | "performance" | "valuation" | "financeiro" | "caixa";

export const MODULO_LABEL: Record<ModuloCrystal, string> = {
  estrategia: "Estratégia",
  performance: "Performance",
  valuation: "Valuation",
  financeiro: "Financeiro",
  caixa: "Caixa",
};

export type CoberturaInvestida = Record<ModuloCrystal, DataStatus>;

/** Base comum: workbook sustenta estratégia, performance e valuation. */
const COBERTURA_PADRAO: CoberturaInvestida = {
  estrategia: "REAL",
  performance: "REAL",
  valuation: "REAL",
  financeiro: "AGUARDANDO_DADOS",
  caixa: "AGUARDANDO_DADOS",
};

export const COBERTURA: Record<InvestidaSlug, CoberturaInvestida> = {
  "ativa-mineracao": { ...COBERTURA_PADRAO, financeiro: "DEMONSTRATIVO" },
  "nazareno-gold": { ...COBERTURA_PADRAO },
  /* Morro Verde é a única com financeiro e caixa documentados (DRE do Q4/2025
     e relatório do Q1/2026, este com data-base própria de 31/03/2026). */
  "morro-verde": { ...COBERTURA_PADRAO, financeiro: "REAL", caixa: "REAL" },
  "rio-novo": { ...COBERTURA_PADRAO },
  /* Alvo: CONFLITO-03 em aberto — performance e valuation não podem ser
     afirmados. `NAO_DISPONIVEL` é o estado do vocabulário que a UI traduz
     como indefinição documental; nenhum valor foi eleito. */
  "alvo-minerals": { ...COBERTURA_PADRAO, performance: "NAO_DISPONIVEL", valuation: "NAO_DISPONIVEL" },
  "neeo-exploration": { ...COBERTURA_PADRAO },
};

/** Resumo legível da cobertura — usado nos cards de investida. */
export function resumoCobertura(slug: InvestidaSlug): string {
  const c = COBERTURA[slug];
  const reais = (Object.keys(c) as ModuloCrystal[]).filter((m) => c[m] === "REAL").map((m) => MODULO_LABEL[m]);
  const pendentes = (Object.keys(c) as ModuloCrystal[]).filter((m) => c[m] === "AGUARDANDO_DADOS").map((m) => MODULO_LABEL[m]);
  const partes: string[] = [];
  if (reais.length) partes.push(`${reais.join(", ")} com fonte documental da Ore`);
  if (pendentes.length) partes.push(`${pendentes.join(" e ")} aguardando dados`);
  return partes.join(" · ") + ".";
}

/** Lookup seguro por slug — a interface trabalha com `string`. */
export function coberturaDe(slug: string): CoberturaInvestida | undefined {
  return COBERTURA[slug as InvestidaSlug];
}

/**
 * Contagem de investidas por estado em um módulo. Serve aos resumos de
 * portfólio, que antes contavam investidas "com fonte" como se a fonte fosse
 * tudo-ou-nada.
 */
export function coberturaPorModulo(modulo: ModuloCrystal): Record<DataStatus, number> {
  const base: Record<DataStatus, number> = {
    REAL: 0, DEMONSTRATIVO: 0, AGUARDANDO_DADOS: 0, NAO_DISPONIVEL: 0, PLANEJADO: 0,
  };
  for (const slug of Object.keys(COBERTURA) as InvestidaSlug[]) base[COBERTURA[slug][modulo]] += 1;
  return base;
}
