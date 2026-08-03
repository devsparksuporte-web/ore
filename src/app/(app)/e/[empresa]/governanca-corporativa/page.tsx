"use client";

/**
 * GOVERNANÇA CORPORATIVA (M-GOV · Sprint 1.3) — módulo executivo, não jurídico.
 * Jornada: situação (header + resumo) → Estrutura de governança (hero) +
 * Situação jurídica (rail) → Compliance → Contratos → Timeline → Alertas.
 * Lê tudo via port @modules/corporate-governance; status/compliance/alertas
 * derivados no serviço. Só componentes/tokens do DS. Aditivo.
 */
import { useParams } from "next/navigation";
import { Badge, EmptyState, MetricStrip, type MetricItem } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { getCompanyBySlug } from "@modules/organizations";
import { deriveGovernance, getGovernanceByCompany } from "@modules/corporate-governance";
import { formatDate } from "@/lib/format";
import { GovernanceHero } from "./_components/governance-hero";
import { LegalStatusCard } from "./_components/legal-status";
import { ComplianceBlock } from "./_components/compliance-block";
import { ContractsBlock } from "./_components/contracts-block";
import { LegalTimeline } from "./_components/legal-timeline";
import { AlertsBlock } from "./_components/alerts-block";
import { legalStatusMeta } from "./_components/helpers";

export default function CompanyGovernancePage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;
  const snap = getGovernanceByCompany(empresa);

  if (!snap) {
    return (
      <DashboardLayout spacing="xl">
        <PageHeader
          title="Governança Corporativa"
          description={`Estrutura, contratos e conformidade — ${companyName}`}
          badge={<Badge variant="outline">{companyName}</Badge>}
        />
        <EmptyState kind="not-configured" title="Governança não disponível" description="Esta empresa ainda não possui snapshot de governança cadastrado." />
      </DashboardLayout>
    );
  }

  const d = deriveGovernance(snap);
  const status = legalStatusMeta[d.legalStatus];

  const kpis: MetricItem[] = [
    { label: "Representantes legais", value: String(d.representatives) },
    { label: "Documentos ativos", value: String(d.activeContracts) },
    { label: "Obrigações críticas", value: String(d.criticalObligations), tone: d.criticalObligations > 0 ? "danger" : "default" },
    { label: "Status jurídico geral", value: status.label, tone: status.tone },
  ];

  const context = `${snap.entityType} · ${snap.jurisdiction} · data-base ${formatDate(snap.asOf, "short")}`;

  return (
    <DashboardLayout spacing="xl">
      <PageHeader
        title="Governança Corporativa"
        description={context}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
        Acompanhe a estrutura societária, os documentos, as obrigações legais e o nível de conformidade da investida.
      </p>

      <MetricStrip items={kpis} />

      <GovernanceHero bodies={snap.bodies} />

      <LegalStatusCard status={d.legalStatus} points={d.attentionPoints} />

      <ComplianceBlock compliance={snap.compliance} pct={d.compliancePct} />

      <ContractsBlock contracts={snap.contracts} />

      <LegalTimeline events={snap.timeline} />

      <AlertsBlock alerts={d.alerts} />
    </DashboardLayout>
  );
}
