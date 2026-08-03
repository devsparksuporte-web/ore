/**
 * Tipos do domínio Governança Corporativa (M-GOV · Sprint 1.3).
 *
 * Módulo executivo (não jurídico): responde "quem governa, quem decide, quais
 * riscos e contratos exigem atenção". Modela cinco agregados — estrutura de
 * governança, contratos, obrigações, risco jurídico e eventos — mais os
 * DERIVADOS executivos (status jurídico, compliance, alertas) calculados no
 * serviço. Contrato normalizado `GovernanceSnapshot` por empresa/data-base,
 * pronto para API ou Excel sem alterar a UI.
 *
 * Nome do módulo é `corporate-governance` para não colidir com o módulo
 * operacional `governance` (Aprovações/Auditoria) já existente.
 */

/* ─────────────────────────── Enums de domínio ─────────────────────────── */

export type LegalStatus = "regular" | "attention" | "critical";

/* ─────────────────── Estrutura de governança (órgãos) ─────────────────── */

export type BodyKind = "executive" | "board" | "committee";

export interface BodyMember {
  name: string;
  role: string;
  /** Mandato (anos, ex.: "2025–2027"). */
  mandate?: string;
  isPresident?: boolean;
}

export interface GovernanceBody {
  id: string;
  kind: BodyKind;
  name: string;
  members: BodyMember[];
}

/* ───────────────────────────── Contratos ──────────────────────────────── */

export type ContractType = "investment" | "divestment" | "shareholders" | "other";
export type ContractStatus = "fulfilled" | "pending" | "at_risk" | "closed";

export interface ContractEvent {
  dateLabel: string;
  title: string;
}

export interface Contract {
  id: string;
  name: string;
  type: ContractType;
  /** Objeto do contrato. */
  object: string;
  parties: string[];
  /** Resumo executivo (protagonista do Drawer). */
  executiveSummary: string;
  keyObligations: string[];
  status: ContractStatus;
  responsible: string;
  updatedAt: string;
  nextEvents: ContractEvent[];
}

/* ───────────────────────── Obrigações & risco ─────────────────────────── */

export type ObligationStatus = "on_track" | "due_soon" | "overdue" | "fulfilled";

export interface Obligation {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  dueDateISO?: string;
  status: ObligationStatus;
  area: string;
  contractRef?: string;
}

export type LegalRiskSeverity = "critical" | "high" | "medium";
export type LegalArea = "societário" | "tributário" | "trabalhista" | "ambiental" | "contratual";

export interface LegalRisk {
  id: string;
  label: string;
  severity: LegalRiskSeverity;
  area: LegalArea;
}

/* ──────────────────────── Eventos (timeline) ──────────────────────────── */

export type LegalEventKind = "assembly" | "amendment" | "termination" | "decision" | "notice";
export type LegalEventState = "done" | "current" | "upcoming";

export interface LegalEvent {
  id: string;
  dateISO?: string;
  dateLabel: string;
  title: string;
  kind: LegalEventKind;
  state: LegalEventState;
}

/* ───────────────────────────── Compliance ─────────────────────────────── */

export interface ComplianceData {
  total: number;
  fulfilled: number;
  pending: number;
  overdue: number;
  updatedAt: string;
  responsible: string;
}

/* ─────────────────── Snapshot normalizado (contrato) ──────────────────── */

export interface GovernanceSnapshot {
  assetId: string;
  companySlug: string;
  /** Tipo societário (ex.: "S.A. de capital fechado"). */
  entityType: string;
  jurisdiction: string;
  asOf: string;
  bodies: GovernanceBody[];
  contracts: Contract[];
  obligations: Obligation[];
  risks: LegalRisk[];
  timeline: LegalEvent[];
  compliance: ComplianceData;
}

/* ───────────────── Derivados (calculados no serviço) ──────────────────── */

export type AlertPriority = "high" | "medium" | "low";
export type AlertCategory = "legal" | "corporate" | "contractual" | "compliance";

export interface GovernanceAlert {
  id: string;
  priority: AlertPriority;
  category: AlertCategory;
  title: string;
  detail?: string;
  owner?: string;
  /** Data limite já formatada (sem prefixo — o estado vai em `dueState`). */
  dueLabel?: string;
  /** Situação do prazo, para a UI decidir o tom sem interpretar texto. */
  dueState?: "overdue" | "due";
}

export interface AttentionPoint {
  id: string;
  label: string;
  tone: "danger" | "warning";
}

export interface GovernanceDerived {
  /** Representantes legais = membros da diretoria estatutária (representam a empresa). */
  representatives: number;
  activeContracts: number;
  /** Obrigações críticas = vencidas. */
  criticalObligations: number;
  legalStatus: LegalStatus;
  /** % de compliance (cumpridas ÷ total). */
  compliancePct: number;
  attentionPoints: AttentionPoint[];
  alerts: GovernanceAlert[];
  nextEvent?: LegalEvent;
}
