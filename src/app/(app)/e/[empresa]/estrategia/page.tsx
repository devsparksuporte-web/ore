"use client";

/**
 * ESTRATÉGIA & EXECUÇÃO (M-STRAT) · Sprint 1.1 — experiência executiva.
 * Jornada de leitura (topo→base): situação (header + resumo) → estratégia
 * (hero) → o que vigiar (monitor) → execução no tempo (timeline) → decisões
 * → ações → saída. Lê tudo via port @modules/strategy; derivações de
 * apresentação em ./_components/helpers. Só componentes/tokens do DS.
 */
import { useParams } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { getCompanyBySlug } from "@modules/organizations";
import {
  getCompanyStrategyKpis, getExitPlanByCompany, getStrategicMapByCompany,
  getStrategyTimelineByCompany, listDecisionsByCompany,
} from "@modules/strategy";
import { ExecutiveSummary, type SummaryItem } from "./_components/executive-summary";
import { StrategyHero } from "./_components/strategic-map";
import { StrategicMonitor } from "./_components/strategic-monitor";
import { StrategyTimeline } from "./_components/strategy-timeline";
import { DecisionsTable } from "./_components/decisions-table";
import { CriticalActions } from "./_components/critical-actions";
import { ExitPlanSection } from "./_components/exit-plan";
import { attentionPoints, keyIndicators, latestUpdate, nextDeadline, overallState } from "./_components/helpers";

export default function CompanyEstrategiaPage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;

  const kpis = getCompanyStrategyKpis(empresa);
  const map = getStrategicMapByCompany(empresa);
  const decisions = listDecisionsByCompany(empresa);
  const timeline = getStrategyTimelineByCompany(empresa);
  const exitPlan = getExitPlanByCompany(empresa);

  const decisionRows = decisions.filter((d) => d.type === "decision");
  const actionRows = decisions.filter((d) => d.type === "action");

  // Cada indicador espelha exatamente um bloco da página (rastreabilidade):
  // Decisões → Log de decisões · Ações → Ações críticas · Bloqueados e
  // Riscos → sinais. "Total de decisões" (que somava decisões + ações) foi
  // descontinuado por induzir a leitura errada.
  const summary: SummaryItem[] = [
    { label: "Decisões", value: String(decisionRows.length) },
    { label: "Ações", value: String(actionRows.length) },
    { label: "Bloqueados", value: String(kpis.blocked), alert: kpis.blocked > 0 },
    { label: "Riscos críticos", value: String(kpis.criticalRisks), alert: kpis.criticalRisks > 0 },
  ];

  const context = `Última atualização ${latestUpdate(decisions)} · Próximo marco ${nextDeadline(decisions)} · ${overallState(decisions)}`;

  return (
    <DashboardLayout spacing="xl">
      <PageHeader
        title="Estratégia & Execução"
        description={context}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
        Acompanhe a tese, o caminho crítico, as decisões e o plano de saída da investida.
      </p>

      <ExecutiveSummary items={summary} />

      {map ? (
        <>
          <StrategyHero map={map} />
          <StrategicMonitor
            risks={map.keyRisks}
            attention={attentionPoints(decisions)}
            indicators={keyIndicators(decisions)}
          />
        </>
      ) : (
        <EmptyState kind="not-configured" title="Estratégia não definida" description="Esta empresa ainda não possui estratégia cadastrada." />
      )}

      <StrategyTimeline events={timeline} />

      <DecisionsTable decisions={decisionRows} assets={[]} showAssetFilter={false} title="Log de decisões" />

      <CriticalActions actions={actionRows} />

      {exitPlan && <ExitPlanSection plan={exitPlan} />}
    </DashboardLayout>
  );
}
