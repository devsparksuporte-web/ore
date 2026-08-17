import type { DataStatus } from "@modules/data-source";

/** Tipos de domínio — espelham o Data Dictionary (doc 11), versão mock. */

export type IntegrationStatus = "integrated" | "implementing" | "not_integrated";

export interface Company {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  commodity: string;
  region: string;
  ownershipPct: number;
  investedSince: string;
  /**
   * Estado TÉCNICO da integração — se existe pipeline de dados montado.
   * Independente de `dataStatus`: uma investida pode ter dados reais vindos de
   * documento sem que exista qualquer integração automática.
   */
  integrationStatus: IntegrationStatus;
  /**
   * Estado GERAL de disponibilidade de dados da investida (Sprint 1.4 · item 4).
   *
   * `REAL` NÃO significa que todos os módulos são reais — significa que existem
   * dados sustentados por fonte documental rastreável nesta investida. O estado
   * por módulo/bloco é assunto do SourceCaption, não deste campo.
   *
   * Deliberadamente separado de `integrationStatus`: um responde "existe
   * pipeline?", o outro "o que está na tela é verdade?". Fundir os dois faria a
   * plataforma tratar ausência de integração como ausência de dado.
   */
  dataStatus: DataStatus;
  onboardingStep?: { current: number; total: number; label: string; goLiveEstimate: string };
  alerts: number;
  kpis?: { cash: number; revenueMonth: number; revenueDelta: number; oxrDeviation: number };
  cashSpark?: number[];
}

export type Severity = "critical" | "warning" | "info";
export interface Alert {
  id: string;
  severity: Severity;
  title: string;
  company: string;
  companySlug?: string;
  timeAgo: string;
  action: { label: string; href: string };
  status: "active" | "silenced" | "resolved";
}

export interface FeedItem {
  id: string;
  time: string;
  kind: "sync" | "publish" | "justification" | "document" | "deal" | "approval";
  text: string;
  company: string;
}

export interface KpiData {
  key: string;
  label: string;
  value: string;
  subMetric?: string;
  delta?: { value: number; label: string; favorable: boolean };
  spark?: number[];
  href?: string;
  badge?: string;
  source: string;
}

export interface CashPoint {
  label: string;
  inflow: number;
  outflow: number;
  balance: number;
  projected?: boolean;
}

export interface CashTitle {
  id: string;
  kind: "payable" | "receivable";
  counterparty: string;
  document: string;
  dueDate: string;
  amount: number;
  bankAccount: string;
  status: "open" | "settled" | "partially_paid";
  nature: string;
  orderRef?: string;
}

export interface DreLine {
  id: string;
  label: string;
  level: number;
  isTotal?: boolean;
  actual: number;
  budget: number;
  children?: DreLine[];
}

export interface OxrLine {
  id: string;
  label: string;
  costCenter: string;
  budget: number;
  actual: number;
  justification: "accepted" | "submitted" | "pending" | null;
  assignee?: string;
  monthly: number[]; // desvio % por mês (heatmap)
}

export type OrderStatus = "pending_approval" | "approved" | "issued" | "partially_received" | "received" | "canceled";
export interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  requester: string;
  supplier: string;
  category: string;
  costCenter: string;
  amount: number;
  status: OrderStatus;
  agingDays: number;
  currentApprover?: string;
  items: { description: string; qty: number; unitPrice: number }[];
  timeline: { step: string; who: string; when?: string; status: "done" | "current" | "waiting" }[];
  budgetBalance?: { account: string; available: number; committed: number };
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  category: string;
  volume12m: number;
  concentrationPct: number;
  lastOrder: string;
  rating?: number;
}

export type ApprovalType = "purchase" | "capex" | "justification" | "document";
export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  description: string;
  requester: string;
  costCenter: string;
  amount: number;
  waitingDays: number;
  slaStatus: "ok" | "warning" | "overdue";
  withinAuthority: boolean;
  orderId?: string;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actor: string;
  action: string;
  entity: string;
  company: string;
  origin: "ui" | "sync" | "api" | "system";
  before?: string;
  after?: string;
}

/**
 * FONTE DE DADOS do Crystal (Sprint 1.4 · item 3).
 *
 * Este contrato descrevia uma INTEGRAÇÃO técnica (conector, saúde, última
 * sincronização, registros importados). Nenhuma integração existe — a ORE
 * fornece documentos. O contrato passa a descrever PROVENIÊNCIA.
 *
 * Nome do tipo e do campo `connector` preservados de propósito: `listConnections`
 * é consumido pela Home e pelo Analytics Engine, e renomear tudo agora seria
 * refatoração ampla sem ganho para o usuário. O que mudou é o SIGNIFICADO e,
 * principalmente, os dados — nenhum campo de sincronização é mais preenchido.
 *
 * ⚠️ `lastSync`, `nextSync` e `recordsImported` permanecem no tipo apenas como
 * compatibilidade e NÃO devem voltar a ser preenchidos enquanto não existir
 * ingestão real. Preenchê-los é reintroduzir a ficção que esta sprint removeu.
 */
export interface Connection {
  id: string;
  /** Nome da fonte (documento, sistema ou canal). */
  connector: string;
  companyName: string;
  /** Estado do dado que a fonte sustenta — vocabulário de @modules/data-source. */
  dataStatus: DataStatus;
  detail: string;
  /** Módulos do Crystal que consomem esta fonte, quando a relação é comprovada. */
  usedBy?: string[];
  /** @deprecated sem ingestão real. Ver nota acima. */
  status?: "healthy" | "error" | "configuring" | "not_started";
  /** @deprecated sem ingestão real. */
  lastSync?: string;
  /** @deprecated sem ingestão real. */
  nextSync?: string;
  /** @deprecated sem ingestão real. */
  recordsImported?: number;
}

export interface SyncRun {
  id: string;
  startedAt: string;
  duration: string;
  records: number;
  status: "success" | "failed" | "partial";
  error?: string;
}

export interface AccountMapping {
  id: string;
  erpCode: string;
  erpName: string;
  canonical: string | null;
  status: "confirmed" | "suggested" | "unmapped";
  score?: number;
}

export interface FiscalPeriod {
  month: string;
  status: "open" | "closing" | "published";
  publishedBy?: string;
  publishedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  companies: string[];
  lastAccess: string;
  status: "active" | "invited" | "deactivated";
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}
