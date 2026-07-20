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

/** Etapa do caminho crítico (stepper de execução da tese). */
export interface CriticalPathStep {
  label: string;
  /** Concluída (marca o progresso ao longo do stepper). */
  done?: boolean;
  /** Etapa em curso (destaque). */
  current?: boolean;
}

/** Painel da Estratégia da Investida (bloco HERO). */
export interface StrategicMap {
  id: string;
  asset: AssetRef;
  /** Tese Original (como o investimento nasceu). */
  thesisOriginal?: string;
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
  /* ── ganchos de evolução (reservados) ── */
  updatedAt?: string;
  updatedBy?: string;
  aiInsights?: AiInsight[];
}

/** Evento da Timeline de execução (bloco próprio, reutilizável). */
export type StrategyEventKind = "milestone" | "decision" | "risk" | "delivery";
export type StrategyEventState = "done" | "current" | "upcoming";

export interface StrategyEvent {
  id: string;
  /** Data normalizada (ISO) quando aplicável — ordenação/alertas futuros. */
  dateISO?: string;
  /** Rótulo de exibição da data (ex.: "Abr/2026", "Contínuo"). */
  dateLabel: string;
  title: string;
  kind: StrategyEventKind;
  state: StrategyEventState;
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
