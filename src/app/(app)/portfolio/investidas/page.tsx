"use client";

import * as React from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/data/entity-card";
import { DataTable, type Column } from "@/components/data/data-table";
import { EmptyState } from "@/components/data/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCompanies, getCobertura, MODULO_LABEL, type ModuloCrystal } from "@modules/organizations";
import { DATA_STATUS_LABEL, type DataStatus } from "@modules/data-source";
import type { Company } from "@/types/domain";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts";

/* Fase 5.2 · ORE-51-001 — o filtro e o cabeçalho tratavam a fonte como
   tudo-ou-nada ("1 com fonte documental · 5 com dados demonstrativos"), o que
   se lia como "só a Ativa tem dados reais". As seis têm. O que varia é o
   MÓDULO: por isso o filtro passa a ser por módulo com fonte documental. */
const MODULOS: ModuloCrystal[] = ["estrategia", "performance", "valuation", "financeiro", "caixa"];

export default function InvestidasPage() {
  const router = useRouter();
  const companies = listCompanies();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = React.useState("all");

  /* Sprint 1.4 · B-01 — a lista filtrava e rotulava por estado de INTEGRAÇÃO
     ("Integradas", "Em implantação", "Sem integração"), afirmando pipelines que
     não existem. Passa a filtrar e rotular por estado do DADO.
     Fase 5.2 — o estado do dado é por módulo: o filtro seleciona o módulo e
     mostra quem já tem fonte documental nele. */
  const filtered =
    statusFilter === "all"
      ? companies
      : companies.filter((c) => getCobertura(c.slug)?.[statusFilter as ModuloCrystal] === "REAL");

  const comFinanceiro = companies.filter((c) => getCobertura(c.slug)?.financeiro === "REAL").length;

  const columns: Column<Company>[] = [
    { key: "name", header: "Empresa", render: (c) => <span className="font-medium text-navy-900">{c.name}</span> },
    { key: "commodity", header: "Commodity", render: (c) => <Badge variant="navy">{c.commodity}</Badge> },
    { key: "region", header: "Região", render: (c) => c.region },
    { key: "ownership", header: "Participação", align: "right", render: (c) => (c.ownershipPct === null ? "—" : `${c.ownershipPct}%`) },
    /* Colunas por módulo: uma linha da tabela responde "onde há fonte nesta
       investida?" sem precisar abrir o card. */
    ...MODULOS.map<Column<Company>>((m) => ({
      key: `mod-${m}`, header: MODULO_LABEL[m], align: "center",
      render: (c) => <ModuloDot status={getCobertura(c.slug)?.[m]} />,
    })),
    { key: "alerts", header: "Alertas", align: "center", render: (c) => (c.alerts > 0 ? <Badge variant="warning">{c.alerts}</Badge> : "—") },
  ];

  return (
    <DashboardLayout spacing="md">
      <PageHeader
        title="Investidas"
        description={`${companies.length} investidas · Estratégia, Performance e Valuation com fonte documental da Ore · Financeiro e Caixa em ${comFinanceiro} delas`}
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
            <SelectItem value="all">Módulo: todos</SelectItem>
            {MODULOS.map((m) => (
              <SelectItem key={m} value={m}>{`Com fonte: ${MODULO_LABEL[m]}`}</SelectItem>
            ))}
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
          onRowClick={(c) => router.push(`/e/${c.slug}/overview`)}
        />
      )}
    </DashboardLayout>
  );
}

/** Ponto de estado por módulo — mesmo vocabulário do SourceCaption. */
const dotTone: Record<DataStatus, string> = {
  REAL: "bg-success",
  DEMONSTRATIVO: "bg-warning",
  AGUARDANDO_DADOS: "bg-warning",
  NAO_DISPONIVEL: "bg-gray-300",
  PLANEJADO: "bg-gray-300",
};

function ModuloDot({ status }: { status?: DataStatus }) {
  if (!status) return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center justify-center" title={DATA_STATUS_LABEL[status]}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotTone[status]}`} aria-hidden />
      <span className="sr-only">{DATA_STATUS_LABEL[status]}</span>
    </span>
  );
}
