/**
 * PORT de dados do domínio Governance (M06 workflow · M13 auditoria/alertas/períodos).
 * O motor de aprovações é genérico e polimórfico (ADR-014) — este port
 * expõe a fila e as consultas; a DECISÃO (E5) será mutation idempotente aqui.
 */
import { approvalQueue } from "@/mocks/operacoes";
import { alerts, auditEvents, feed, fiscalPeriods, milestones, pipelineMini } from "@/mocks/governanca";
import type { Alert, ApprovalItem, AuditEvent, FeedItem, FiscalPeriod, Severity } from "@/types/domain";

export type { Alert, ApprovalItem, AuditEvent, FeedItem, FiscalPeriod, Severity };

/* Aprovações (M06) */
export const getApprovalQueue = (): ApprovalItem[] => approvalQueue;

/* Alertas (M13c) */
export const listAlerts = (): Alert[] => alerts;
export const listCriticalAlerts = (companySlug?: string): Alert[] =>
  alerts.filter((a) => a.severity === "critical" && (!companySlug || a.companySlug === companySlug));

/* Auditoria (M13a) */
export const listAuditEvents = (): AuditEvent[] => auditEvents;

/* Períodos (M13b) */
export const listFiscalPeriods = (): FiscalPeriod[] => fiscalPeriods;

/* Feed e marcos do portfólio (M14 consome via barrel) */
export const getActivityFeed = (): FeedItem[] => feed;
export const getMilestones = () => milestones;
export const getPipelineMini = () => pipelineMini;
