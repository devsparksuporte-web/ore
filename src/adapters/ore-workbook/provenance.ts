/**
 * PROVENIÊNCIA — de onde veio cada dado real da plataforma.
 *
 * Sprint 1.4. A ORE opera hoje em planilha; o Excel é a fonte operacional. Esta
 * camada é o ADAPTADOR: normaliza o workbook para o modelo de domínio e é o
 * ÚNICO lugar que conhece abas, colunas e unidades da planilha. Serviços e
 * Ports consomem daqui; a UI nunca vê célula, aba nem nome de arquivo.
 *
 * Quando o Protheus (ou uma API) substituir a planilha, troca-se este adaptador
 * e nada acima muda — nem contrato, nem serviço, nem tela (ADR-029).
 *
 * ⚠️ REGRA: nenhum número aqui pode ser estimado, arredondado por conveniência
 * ou completado por inferência. Dado que a ORE não forneceu é `null` — e a tela
 * mostra "não disponibilizado", nunca um valor plausível.
 *
 * Sprint 1.4 · item 2 — os TIPOS de estado e proveniência (`DataStatus`,
 * `SourceRef`, `Fornecido`) foram promovidos para `@modules/data-source`, por
 * serem conceito do produto Crystal e não da ORE. Este arquivo passa a conter
 * apenas o que é específico deste cliente: o catálogo de fontes documentais e
 * o câmbio de referência. Os tipos seguem re-exportados aqui para não quebrar
 * imports existentes.
 */
export type { DataStatus, Fornecido, SourceRef } from "@modules/data-source";
export { DATA_STATUS_LABEL, ORIGEM_INDEFINIDA } from "@modules/data-source";

import type { SourceRef } from "@modules/data-source";

const WORKBOOK = "Workbook de Gestão — Ore Mining PE I FIP";
const FORECAST = "Forecast operacional — Ativa";
/* Sprint 1.5 — relatórios trimestrais e AGM entram como fontes documentais.
   Cada um tem data-base PRÓPRIA: nada aqui é normalizado para uma data única
   (D1). Um valor mais recente não sobrescreve um mais antigo — convivem como
   histórico temporal. */
const Q4_2025 = "Relatório trimestral Q4 2025 — 260310";
const Q1_2026 = "Relatório trimestral Q1 2026 — 260601";
const AGM_2026 = "Assembleia Geral 2026 — 260626";

export const SOURCES = {
  /** Aba "1. Capa" — snapshot do fundo. */
  fundo: { label: "Workbook de gestão · Capa", file: WORKBOOK, sheet: "1. Capa", asOf: "2025-12-31" },
  /** Aba "2. Decisoes e Acoes" — log rolante de decisões e ações. */
  decisoes: { label: "Workbook de gestão · Decisões e Ações", file: WORKBOOK, sheet: "2. Decisões e Ações", asOf: "2026-04-30" },
  /** Aba "4. Capital e Caixa" — commitments, paid-in, dry powder. */
  capital: { label: "Workbook de gestão · Capital e Caixa", file: WORKBOOK, sheet: "4. Capital e Caixa", asOf: "2025-12-31" },
  /** Aba "5. Mapa Estrategico" — tese, riscos, sucesso e decisão por ativo. */
  mapa: { label: "Workbook de gestão · Mapa Estratégico", file: WORKBOOK, sheet: "5. Mapa Estratégico", asOf: "2025-12-31" },
  /** Aba "6. Timeline de Saida" — mecanismo, janela e cenários de saída. */
  saida: { label: "Workbook de gestão · Timeline de Saída", file: WORKBOOK, sheet: "6. Timeline de Saída", asOf: "2025-12-31" },
  /** Aba "8. KPI Ativa" — snapshot, projeto e milestones da investida. */
  kpiAtiva: { label: "Workbook de gestão · KPI Ativa", file: WORKBOOK, sheet: "8. KPI Ativa", asOf: "2025-12-31" },
  /** Forecast operacional — recorte confirmado pelo PO: aba "Apresentação". */
  forecast: { label: "Forecast operacional · Apresentação", file: FORECAST, sheet: "Apresentação", asOf: "2026-05-31" },

  /* ── Sprint 1.5 · fontes acrescentadas ───────────────────────────────── */

  /** Aba "3. Dashboard" — cockpit executivo por ativo + evolução do fair value. */
  dashboard: { label: "Workbook de gestão · Dashboard do portfólio", file: WORKBOOK, sheet: "3. Dashboard", asOf: "2025-12-31" },
  /** Aba "13. Base de Dados" — fonte única do workbook: posição por investida,
   *  série trimestral de fair value e parâmetros do fundo (Q1/2020–Q4/2025). */
  baseDados: { label: "Workbook de gestão · Base de Dados", file: WORKBOOK, sheet: "13. Base de Dados", asOf: "2025-12-31" },
  /** Posição do portfólio Q4 2025 — cost, fair value, ownership, método. */
  posicaoQ4: { label: "Workbook de gestão · Base de Dados · Posição Q4 2025", file: WORKBOOK, sheet: "13. Base de Dados", range: "A16:I22", asOf: "2025-12-31" },
  /** Série trimestral de fair value por ativo (Q1/2020–Q4/2025). */
  serieFV: { label: "Workbook de gestão · Base de Dados · Fair value trimestral", file: WORKBOOK, sheet: "13. Base de Dados", range: "A27:Y33", asOf: "2025-12-31" },
  /** Aba KPI de cada investida (7 a 12). */
  kpiMorroVerde: { label: "Workbook de gestão · KPI Morro Verde", file: WORKBOOK, sheet: "7. KPI Morro Verde", asOf: "2025-12-31" },
  kpiNzr: { label: "Workbook de gestão · KPI NZR Gold", file: WORKBOOK, sheet: "9. KPI NZR Gold", asOf: "2025-12-31" },
  kpiIocg: { label: "Workbook de gestão · KPI IOCG Norte", file: WORKBOOK, sheet: "10. KPI IOCG Norte", asOf: "2025-12-31" },
  kpiAlvo: { label: "Workbook de gestão · KPI Alvo", file: WORKBOOK, sheet: "11. KPI Alvo", asOf: "2025-12-31" },
  kpiNeeo: { label: "Workbook de gestão · KPI Neeo", file: WORKBOOK, sheet: "12. KPI Neeo", asOf: "2025-12-31" },
  /** Relatórios trimestrais e AGM — data-base própria de cada um. */
  q4_2025: { label: "Relatório trimestral Q4 2025", file: Q4_2025, asOf: "2025-12-31", category: "Documento ORE" },
  q1_2026: { label: "Relatório trimestral Q1 2026", file: Q1_2026, asOf: "2026-03-31", category: "Documento ORE" },
  agm_2026: { label: "Assembleia Geral 2026", file: AGM_2026, asOf: "2026-04-30", category: "Documento ORE" },
} as const satisfies Record<string, SourceRef>;

/**
 * Câmbio de referência do próprio workbook (aba "4. Capital e Caixa",
 * linha Q4 2025). Usado APENAS para converter a apresentação entre USD e BRL —
 * nunca para derivar um valor novo. Trocar de moeda não cria dado: reexpressa
 * o mesmo dado na unidade que o leitor pediu.
 */
export const FX_BRL_PER_USD = 5.5024;
export const FX_SOURCE: SourceRef = {
  label: "Câmbio de referência do workbook (Q4 2025)",
  file: WORKBOOK,
  sheet: "4. Capital e Caixa",
  asOf: "2025-12-31",
};

/** Motivo padronizado para dado que a ORE ainda não disponibilizou. */
export const NAO_DISPONIBILIZADO = "Não disponibilizado pela ORE" as const;

/* `Fornecido<T>`, `SourceRef` e `DataStatus` vêm de @modules/data-source
   (re-exportados no topo deste arquivo). */
