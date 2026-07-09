"use client";

/**
 * ESTRATÉGIA & EXECUÇÃO (M-STRAT) · contexto Empresa investida.
 * Página nativa: herda o DashboardLayout, lê 100% via port @modules/strategy
 * (nunca mocks direto) no escopo da empresa em rota, e compõe KPIs + Mapa
 * Estratégico + Decisões & Ações. Interatividade nos componentes co-locados.
 */
import { useParams } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { getCompanyBySlug } from "@modules/organizations";
import {
  getCompanyStrategyKpis, getStrategicMapByCompany, listDecisionsByCompany,
} from "@modules/strategy";
import { StrategyKpisRow } from "./_components/strategy-kpis";
import { StrategicMapSection } from "./_components/strategic-map";
import { DecisionsTable } from "./_components/decisions-table";

export default function CompanyEstrategiaPage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;

  const kpis = getCompanyStrategyKpis(empresa);
  const map = getStrategicMapByCompany(empresa);
  const decisions = listDecisionsByCompany(empresa);

  return (
    <DashboardLayout spacing="lg">
      <PageHeader
        title="Estratégia & Execução"
        description={`${companyName} — do mapa estratégico à execução das decisões-chave.`}
        badge={<Badge variant="copper">Estratégia</Badge>}
      />
      <StrategyKpisRow kpis={kpis} />
      {map ? (
        <StrategicMapSection map={map} />
      ) : (
        <EmptyState kind="not-configured" title="Mapa estratégico não definido" description="Esta empresa ainda não possui mapa estratégico cadastrado." />
      )}
      <DecisionsTable decisions={decisions} assets={[]} showAssetFilter={false} />
    </DashboardLayout>
  );
}
