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
  integrationStatus: IntegrationStatus;
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

export interface Connection {
  id: string;
  connector: string;
  companyName: string;
  status: "healthy" | "error" | "configuring" | "not_started";
  lastSync?: string;
  nextSync?: string;
  recordsImported?: number;
  detail: string;
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
