/**
 * PORT de dados do domínio Governança Corporativa (M-GOV · Sprint 1.3).
 * Dono único no front: componentes consomem APENAS estas funções, nunca
 * @/mocks direto (ADR-017). Derivações executivas (status jurídico, alertas,
 * pontos de atenção) vivem AQUI — nunca no componente.
 *
 * Adaptador vigente: mocks. Futuro (E5 / Data Room): @modules/api ou importador
 * de Excel com as MESMAS assinaturas → troca sem tocar a UI.
 */
import { governanceSnapshots } from "@/mocks/governanca-corporativa";
import type {
  AttentionPoint, GovernanceAlert, GovernanceDerived, GovernanceSnapshot, LegalStatus,
} from "../types";

export type {
  AlertCategory, AlertPriority, AttentionPoint, BodyKind, BodyMember, Contract, ContractEvent,
  ContractStatus, ContractType, GovernanceAlert, GovernanceBody, GovernanceDerived,
  GovernanceSnapshot, LegalArea, LegalEvent, LegalEventKind, LegalEventState, LegalRisk,
  LegalRiskSeverity, LegalStatus, Obligation, ObligationStatus, ComplianceData,
} from "../types";

/** Snapshot de governança de uma empresa investida (por slug). */
export function getGovernanceByCompany(companySlug: string): GovernanceSnapshot | undefined {
  return governanceSnapshots.find((s) => s.companySlug === companySlug);
}

/** Eventos jurídicos (timeline) de uma empresa investida. */
export function getGovernanceTimelineByCompany(companySlug: string) {
  return getGovernanceByCompany(companySlug)?.timeline ?? [];
}

/** Derivados executivos (puros): representantes, contratos ativos, obrigações
 *  críticas, status jurídico, compliance, pontos de atenção e alertas. */
export function deriveGovernance(s: GovernanceSnapshot): GovernanceDerived {
  const representatives = s.bodies.filter((b) => b.kind === "executive").reduce((n, b) => n + b.members.length, 0);
  const activeContracts = s.contracts.filter((c) => c.status !== "closed").length;
  const overdue = s.obligations.filter((o) => o.status === "overdue").length;
  const atRisk = s.contracts.filter((c) => c.status === "at_risk").length;
  const inReview = s.contracts.filter((c) => c.status === "at_risk" || c.status === "pending").length;
  const pending = s.contracts.filter((c) => c.status === "pending").length;
  const criticalRisks = s.risks.filter((r) => r.severity === "critical").length;
  const highRisks = s.risks.filter((r) => r.severity === "high").length;

  const legalStatus: LegalStatus =
    criticalRisks >= 2 || (criticalRisks >= 1 && overdue >= 3) || atRisk >= 2
      ? "critical"
      : criticalRisks >= 1 || overdue >= 1 || atRisk >= 1 || pending >= 1
        ? "attention"
        : "regular";

  const compliancePct = s.compliance.total > 0 ? (s.compliance.fulfilled / s.compliance.total) * 100 : 100;

  const attentionPoints: AttentionPoint[] = [];
  if (overdue > 0) attentionPoints.push({ id: "ap-overdue", label: `${overdue} ${overdue === 1 ? "obrigação vencida" : "obrigações vencidas"}`, tone: "danger" });
  if (inReview > 0) attentionPoints.push({ id: "ap-review", label: `${inReview} ${inReview === 1 ? "contrato em revisão" : "contratos em revisão"}`, tone: "warning" });
  const firstCritical = s.risks.find((r) => r.severity === "critical");
  if (firstCritical) attentionPoints.push({ id: "ap-risk", label: `1 risco ${firstCritical.area} crítico`, tone: "danger" });
  else if (highRisks > 0) attentionPoints.push({ id: "ap-risk-h", label: `${highRisks} risco(s) de atenção`, tone: "warning" });

  const alerts: GovernanceAlert[] = [];
  for (const o of s.obligations.filter((x) => x.status === "overdue")) {
    alerts.push({ id: `al-${o.id}`, priority: "high", category: "compliance", title: o.title, detail: "Obrigação vencida — requer regularização.", owner: o.owner, dueLabel: `Vencida · ${o.dueDate}` });
  }
  for (const c of s.contracts.filter((x) => x.status === "at_risk")) {
    alerts.push({ id: `al-${c.id}`, priority: "high", category: "contractual", title: `${c.name} em risco`, detail: c.executiveSummary, owner: c.responsible });
  }
  for (const r of s.risks.filter((x) => x.severity === "critical")) {
    alerts.push({ id: `al-${r.id}`, priority: "high", category: r.area === "societário" ? "corporate" : "legal", title: r.label });
  }
  for (const c of s.contracts.filter((x) => x.status === "pending")) {
    alerts.push({ id: `al-${c.id}`, priority: "medium", category: "contractual", title: `${c.name} em revisão`, detail: c.executiveSummary, owner: c.responsible });
  }
  for (const r of s.risks.filter((x) => x.severity === "high")) {
    alerts.push({ id: `al-${r.id}`, priority: "medium", category: r.area === "societário" ? "corporate" : "legal", title: r.label });
  }
  const rank = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => rank[a.priority] - rank[b.priority]);

  return {
    representatives,
    activeContracts,
    criticalObligations: overdue,
    legalStatus,
    compliancePct,
    attentionPoints: attentionPoints.slice(0, 3),
    alerts: alerts.slice(0, 6),
  };
}
