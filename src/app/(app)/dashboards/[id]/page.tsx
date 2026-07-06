"use client";

/**
 * Rota de dashboards CONFIGURÁVEIS (Analytics Engine, ADR-019).
 * Nenhum markup fixo: a página carrega uma DashboardSpec (JSON) e o
 * engine monta tudo. F4: specs por tenant vêm do banco.
 */
import { useParams } from "next/navigation";
import { ConfigurableDashboard } from "@modules/analytics";
import { EmptyState } from "@modules/widgets";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@core";
import { getDashboardSpec } from "@/lib/dashboard-specs";
import "@/lib/analytics-datasets"; // composition root: registra os datasets
import { DashboardLayout } from "@/components/layouts";

export default function ConfigurableDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const spec = getDashboardSpec(id);

  if (!spec) {
    return (
      <DashboardLayout spacing="none" padY="tall">
        <EmptyState
          kind="no-results"
          title={`Dashboard "${id}" não encontrado`}
          description="Especificações disponíveis são configuradas por tenant (F4: editor + banco)."
        />
      </DashboardLayout>
    );
  }

  return (
    <>
      <FilterBar />
      <DashboardLayout spacing="lg">
        <PageHeader
          title={spec.title}
          description={spec.description}
          badge={<Badge variant="navy">configurável · JSON</Badge>}
        />
        <ConfigurableDashboard spec={spec} />
      </DashboardLayout>
    </>
  );
}
