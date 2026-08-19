/**
 * Tipos do domínio Strategy (Estratégia & Execução — M-STRAT).
 *
 * Contrato de dados do módulo, isolado por design: nada aqui depende de outros
 * domínios além de referenciar um Ativo do portfólio (@modules/organizations)
 * via `AssetRef`. Os campos marcados como "gancho de evolução" NÃO são usados
 * nesta entrega (só visualização) — existem para que criação, workflow,
 * comentários, timeline, histórico, permissões, auditoria e IA possam ser
 * ligados no Crystal sem refazer o módulo (ver docs/strategy-module-notes.md).
 */
import type { DataStatus, SourceRef } from "@modules/data-source";

/* ─────────────────────────── Enums de domínio ─────────────────────────── */

export type DecisionType = "decision" | "action";
export type Priority = "high" | "medium" | "low";
export type DecisionStatus = "open" | "in_progress" | "done" | "blocked" | "canceled";
export type RiskSeverity = "critical" | "high" | "medium";

/** Referência a um Ativo. `companySlug` liga à investida real quando existe
 *  (Ativos de nível-portfólio, ex. "Fundo 1", não têm empresa). */
export interface AssetRef {
  id: string;
  label: string;
  companySlug?: string;
}

/* ───────────────────────── Entidades principais ───────────────────────── */

export interface KeyRisk {
  label: string;
  severity: RiskSeverity;
}

/** O que está por trás de uma etapa do caminho crítico (drill-down). */
export interface CriticalPathItem {
  id: string;
  title: string;
  /** Responsável como a fonte registra (pessoa, órgão ou empresa). */
  owner: string;
  /** Prazo/alvo — nem sempre é data fechada ("Pós-SBLC"). */
  target: string;
  status: string;
  notes?: string;
}

/** Etapa do caminho crítico (stepper de execução da tese). */
export interface CriticalPathStep {
  label: string;
  /** Concluída (marca o progresso ao longo do stepper). */
  done?: boolean;
  /** Etapa em curso (destaque). */
  current?: boolean;
  /**
   * Sprint 1.4 — marcos reais que sustentam a etapa. Alimenta o drill-down:
   * clicar numa etapa mostra POR QUE ela está nesse estado. Opcional: fontes
   * sem esse detalhe seguem funcionando (a etapa apenas não abre).
   */
  items?: CriticalPathItem[];
}

/** Painel da Estratégia da Investida (bloco HERO). */
export interface StrategicMap {
  id: string;
  asset: AssetRef;
  /** Tese Original (como o investimento nasceu). */
  thesisOriginal?: string;
  /**
   * Sprint 1.4 · item 7 — estado do campo `thesisOriginal` quando ele não tem
   * conteúdo.
   *
   * Existe para que a UI possa EXIBIR a ausência em vez de omitir o bloco.
   * Omitir produzia uma inversão que engana o leitor: a investida com dados
   * reais não mostrava a tese de entrada e as demonstrativas mostravam — quem
   * lê conclui que a real é a menos documentada, quando o que falta é o insumo.
   *
   * Opcional por design: fonte que preenche `thesisOriginal` não declara estado
   * algum e renderiza como sempre.
   */
  thesisOriginalStatus?: DataStatus;
  /**
   * Explicação curta da ausência, para o leitor. Mesmo papel — e mesmo nome —
   * de `unavailableReason` em `CapitalPosition` e `Liquidity`
   * (@modules/performance): a razão da ausência é dado da fonte, não texto
   * fixo de componente. Descreve a INDISPONIBILIDADE, nunca o conteúdo do
   * campo, que seria invenção.
   */
  thesisOriginalUnavailableReason?: string;
  /** Tese Atual (como evoluiu). */
  thesis: string;
  /** Caminho crítico — sequência de etapas até destravar a tese. */
  criticalPath?: CriticalPathStep[];
  /** Objetivos estratégicos do ciclo. */
  objectives?: string[];
  /** Riscos-chave (com severidade — alimenta o KPI "Riscos críticos"). */
  keyRisks: KeyRisk[];
  /** Definição de sucesso 2026. */
  success: string;
  /** Decisão estratégica 2026 (callout). */
  decision: string;
  /**
   * Sprint 1.5 — origem e estado do bloco estratégico.
   *
   * A auditoria mostrou que a Estratégia das cinco investidas "demonstrativas"
   * é, na verdade, transcrição literal do Mapa Estratégico do workbook: tese,
   * riscos, sucesso 2026 e decisão 2026 batem palavra por palavra. Estavam
   * classificadas como demonstrativas por omissão, não por análise.
   * Declarar a origem no próprio contrato encerra a ambiguidade.
   */
  source?: SourceRef;
  dataStatus?: DataStatus;
  /* ── ganchos de evolução (reservados) ── */
  updatedAt?: string;
  updatedBy?: string;
  aiInsights?: AiInsight[];
}

/** Evento da Timeline de execução (bloco próprio, reutilizável). */
export type StrategyEventKind = "milestone" | "decision" | "risk" | "delivery";
export type StrategyEventState = "done" | "current" | "upcoming";

/**
 * Fase 5.2 — detalhe do evento, quando a fonte registra mais do que título e
 * data. Só existe onde há documento por trás: um marco sem responsável, alvo
 * ou observação na fonte NÃO ganha detalhe inventado — e, por não ter detalhe,
 * a interface não o torna clicável. Afordância sem conteúdo é promessa falsa.
 */
export interface StrategyEventDetail {
  /** Responsável, como a fonte nomeia. */
  owner?: string;
  /** Alvo declarado (ex.: "Jan/2026", "Pós-SBLC"). */
  target?: string;
  /** Estado, como a fonte registra (ex.: "Concluído", "Em andamento"). */
  status?: string;
  /** Observação da fonte. */
  notes?: string;
  /** Categoria do marco (ex.: "Licenciamento", "Financiamento"). */
  category?: string;
  /** Rótulo da origem — exibido no rodapé do drill-down. */
  sourceLabel?: string;
  /** Estado do dado deste evento. */
  dataStatus?: DataStatus;
}

export interface StrategyEvent {
  id: string;
  /** Data normalizada (ISO) quando aplicável — ordenação/alertas futuros. */
  dateISO?: string;
  /** Rótulo de exibição da data (ex.: "Abr/2026", "Contínuo"). */
  dateLabel: string;
  title: string;
  kind: StrategyEventKind;
  state: StrategyEventState;
  /** Conteúdo do drill-down. Ausente = evento sem detalhe na fonte. */
  detail?: StrategyEventDetail;
}

/** Plano de Saída da investida (bloco próprio; cresce nas próximas versões). */
export interface ExitStage {
  label: string;
}

export interface ExitPlan {
  id: string;
  asset: AssetRef;
  /** Estratégia de saída (ex.: "Venda estratégica", "Block trade"). */
  strategy: string;
  /** Estágios do processo de saída (stepper). */
  stages: ExitStage[];
  /** Índice do estágio atual dentro de `stages`. */
  currentStageIndex: number;
  /** Próximos passos até avançar de estágio. */
  nextSteps: string[];
  /** Horizonte estimado (ex.: "2027–2028"). */
  horizon: string;
}

/** Linha do log de Decisões & Ações (aba "Decisões e Ações"). */
export interface Decision {
  id: string;
  /** Nº sequencial de origem (rastreabilidade com a planilha). */
  ref: number;
  asset: AssetRef;
  /** Decisão / Ação (título). */
  title: string;
  /** Descrição / Contexto. */
  context: string;
  type: DecisionType;
  priority: Priority;
  /** Responsável. */
  owner: string;
  /** Data Limite — rótulo de exibição (ex.: "30/04/2026", "Contínuo"). */
  dueDate: string;
  /** Data Limite normalizada (ISO) quando aplicável — habilita ordenação/alertas futuros. */
  dueDateISO?: string;
  status: DecisionStatus;
  /** Última Atualização (rótulo). */
  lastUpdate: string;
  /* ── ganchos de evolução (reservados, não populados nesta entrega) ── */
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  workflow?: WorkflowStage;
  comments?: Comment[];
  timeline?: TimelineEvent[];
  history?: HistoryEntry[];
  aiInsights?: AiInsight[];
}

/** Indicadores do topo da página. */
export interface StrategyKpis {
  totalDecisions: number;
  inProgress: number;
  done: number;
  blocked: number;
  overdue: number;
  criticalRisks: number;
}

/** Filtros aplicados à lista de decisões (busca/ordenação/segmentação). */
export interface DecisionFilters {
  search?: string;
  assetId?: string;
  type?: DecisionType;
  priority?: Priority;
  status?: DecisionStatus;
}

/* ───────────── Contratos de evolução (Crystal) — declarados, não usados ─────────────
 * Tipados desde já para que a arquitetura cresça sem breaking changes. Nenhuma
 * funcionalidade abaixo é implementada nesta entrega. */

export type WorkflowStage = "draft" | "review" | "approved" | "archived";

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  kind: string;
  summary: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  field: string;
  from: string;
  to: string;
  by: string;
}

export interface AiInsight {
  id: string;
  severity: "positive" | "info" | "warning" | "critical";
  title: string;
  detail: string;
}
