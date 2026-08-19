/**
 * ESTADO E PROVENIÊNCIA DO DADO — conceito do produto Crystal.
 *
 * Sprint 1.4 · Data Truth. Regra que este módulo existe para sustentar:
 *
 *   Nenhum dado é apresentado como factual se a plataforma não consegue
 *   identificar sua ORIGEM e seu ESTADO.
 *
 * Por que aqui e não dentro do adaptador da ORE: a ORE é o primeiro cliente,
 * não o dono do conceito. Estado e proveniência valem para qualquer cliente e
 * qualquer fonte — se morassem em `adapters/ore-workbook/`, o segundo cliente
 * importaria tipos de um diretório com o nome do primeiro.
 *
 * Este módulo NÃO conhece OneDrive, Protheus, Excel ou qualquer integração.
 * Ele descreve o que se sabe sobre um dado; quem preenche é o adaptador.
 */

/* ───────────────────────── Estado do dado ───────────────────────── */

/**
 * Estado de um dado apresentado na interface.
 *
 * `REAL`              — veio de fonte documental identificável e rastreável.
 * `DEMONSTRATIVO`     — existe para demonstrar a estrutura do produto. É
 *                       legítimo: o que não se admite é passar por real.
 * `AGUARDANDO_DADOS`  — o campo existe no modelo, a fonte existe, o conteúdo
 *                       ainda não foi disponibilizado.
 * `NAO_DISPONIVEL`    — a fonte não controla esta informação. Diferente de
 *                       aguardar: aqui não há o que esperar sem mudar a fonte.
 * `PLANEJADO`         — previsto para uma fase futura; nada a exibir hoje.
 *
 * Não acrescentar estados sem necessidade real: cada estado novo é uma
 * distinção que o leitor executivo precisa aprender.
 */
export type DataStatus =
  | "REAL"
  | "DEMONSTRATIVO"
  | "AGUARDANDO_DADOS"
  | "NAO_DISPONIVEL"
  | "PLANEJADO";

/** Rótulos em português para exibição. Únicos textos aceitos na interface. */
export const DATA_STATUS_LABEL: Record<DataStatus, string> = {
  REAL: "Dados reais",
  DEMONSTRATIVO: "Dados demonstrativos",
  AGUARDANDO_DADOS: "Aguardando dados",
  NAO_DISPONIVEL: "Não disponibilizado",
  PLANEJADO: "Planejado",
};

/**
 * Disponibilidade de um MÓDULO — conceito distinto do estado de um dado.
 *
 * Um módulo sem fonte não está quebrado nem desativado: ele existe no produto
 * e ainda não tem de onde ler. A distinção importa porque "desativado" sugere
 * decisão de produto, e o caso aqui é ausência de insumo.
 */
export type ModuleAvailability = "available" | "no_data_source";

export const MODULE_AVAILABILITY_LABEL: Record<ModuleAvailability, string> = {
  available: "Disponível",
  no_data_source: "Sem fonte de dados nesta fase",
};

/* ─────────────────────────── Proveniência ───────────────────────── */

/**
 * Origem de um conjunto de dados — sempre exibível ao usuário.
 *
 * Todos os campos além de `label` são opcionais de propósito: é preferível
 * declarar uma origem incompleta a inventar arquivo, aba ou data para
 * completá-la. Campo vazio é informação; campo preenchido por conveniência é
 * o defeito que esta sprint existe para corrigir.
 */
export interface SourceRef {
  /** Rótulo curto para a UI (rodapé de bloco, tooltip). */
  label: string;
  /** Estado do dado que esta origem sustenta. */
  status?: DataStatus;
  /** Arquivo de origem, quando houver rastreabilidade comprovada. */
  file?: string;
  /** Aba/planilha de origem. */
  sheet?: string;
  /** Natureza da fonte (ex.: "Documento ORE"). Livre por design. */
  category?: string;
  /** Data-base do dado (ISO). Só preencher com data conhecida. */
  asOf?: string;
  /**
   * Sprint 1.5 — rastreabilidade granular até a origem.
   *
   * `cell` para um valor único ("D18"), `range` para uma série ("B28:Y28"),
   * `page` para documento paginado ("p.9"). Opcionais como todo o resto: uma
   * origem sem célula continua sendo uma origem; célula inventada, não.
   *
   * Servem à auditoria — quem conferir a tela consegue abrir o arquivo na
   * posição exata de onde o número saiu.
   */
  cell?: string;
  range?: string;
  page?: string;
}

/**
 * Campo que pode não existir na fonte. `null` NUNCA é 0 nem "vazio": é a
 * declaração de que o dado não foi fornecido, e a UI é obrigada a dizer isso.
 */
export type Fornecido<T> = T | null;

/** Texto padrão quando não há rastreabilidade comprovada para uma origem. */
export const ORIGEM_INDEFINIDA = "Origem aguardando definição" as const;
