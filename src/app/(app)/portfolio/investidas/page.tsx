"use client";

import * as React from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/data/entity-card";
import { DataTable, type Column } from "@/components/data/data-table";
import { IntegrationBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/data/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companies } from "@/mocks/companies";
import { formatMoney } from "@/lib/format";
import type { Company } from "@/types/domain";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts";

export default function InvestidasPage() {
  const router = useRouter();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = companies.filter((c) => statusFilter === "all" || c.integrationStatus === statusFilter);

  const columns: Column<Company>[] = [
    { key: "name", header: "Empresa", render: (c) => <span className="font-medium text-navy-900">{c.name}</span> },
    { key: "commodity", header: "Commodity", render: (c) => <Badge variant="navy">{c.commodity}</Badge> },
    { key: "region", header: "Região", render: (c) => c.region },
    { key: "ownership", header: "Participação", align: "right", render: (c) => `${c.ownershipPct}%` },
    { key: "status", header: "Integração", render: (c) => <IntegrationBadge status={c.integrationStatus} /> },
    { key: "cash", header: "Caixa", align: "right", render: (c) => (c.kpis ? formatMoney(c.kpis.cash, { compact: true }) : "—") },
    { key: "alerts", header: "Alertas", align: "center", render: (c) => (c.alerts > 0 ? <Badge variant="warning">{c.alerts}</Badge> : "—") },
  ];

  return (
    <DashboardLayout spacing="md">
      <PageHeader
        title="Investidas"
        description="6 empresas · 1 integrada · 2 em implantação"
        actions={
          <>
            <div className="flex rounded-md border">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-gray-100 text-navy-900" : "text-gray-400"}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-gray-100 text-navy-900" : "text-gray-400"}`}><List className="h-4 w-4" /></button>
            </div>
            <Button onClick={() => toast.info("Onboarding de nova investida", { description: "Assistente de 6 passos — disponível na v1.1 (fluxo F4)." })}>
              <Plus /> Nova investida
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger chip><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: Todos</SelectItem>
            <SelectItem value="integrated">Integradas</SelectItem>
            <SelectItem value="implementing">Em implantação</SelectItem>
            <SelectItem value="not_integrated">Sem integração</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState kind="no-results" title="Nenhuma investida para o filtro aplicado" actionLabel="Limpar filtros" onAction={() => setStatusFilter("all")} />
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => <EntityCard key={c.id} company={c} />)}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(c) => {
            if (c.integrationStatus === "integrated") router.push(`/e/${c.slug}/overview`);
            else toast.info(`${c.shortName} ainda não está integrada`, { description: "Dados disponíveis após o go-live da integração." });
          }}
        />
      )}
    </DashboardLayout>
  );
}
