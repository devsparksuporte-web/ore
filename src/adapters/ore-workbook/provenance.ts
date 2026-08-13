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
 */

/** Origem de um conjunto de campos — sempre exibível ao usuário. */
export interface SourceRef {
  /** Rótulo curto para a UI (rodapé de bloco, tooltip). */
  label: string;
  /** Arquivo de origem. */
  file: string;
  /** Aba/planilha de origem. */
  sheet?: string;
  /** Data-base do dado (ISO). */
  asOf: string;
}

const WORKBOOK = "Workbook de Gestão — Ore Mining PE I FIP";
const FORECAST = "Forecast operacional — Ativa";

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

/**
 * Campo que pode não existir na fonte. `null` NUNCA é 0 nem "vazio": é uma
 * declaração de que o dado não foi fornecido, e a UI é obrigada a dizer isso.
 */
export type Fornecido<T> = T | null;
