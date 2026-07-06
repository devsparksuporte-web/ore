"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditEvents } from "@/mocks/governanca";
import type { AuditEvent } from "@/types/domain";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

const originVariant: Record<AuditEvent["origin"], "navy" | "info" | "default" | "outline"> = {
  ui: "navy", sync: "info", api: "default", system: "outline",
};

export default function AuditoriaPage() {
  const [originFilter, setOriginFilter] = React.useState("all");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const filtered = auditEvents.filter((e) => originFilter === "all" || e.origin === originFilter);

  const columns: Column<AuditEvent>[] = [
    { key: "when", header: "Quando", render: (e) => <span className="whitespace-nowrap tnum text-muted-foreground">{e.occurredAt}</span> },
    { key: "actor", header: "Ator", render: (e) => <span className="font-medium text-gray-800">{e.actor}</span> },
    { key: "action", header: "Ação", render: (e) => <Badge variant="outline" className="font-mono text-micro">{e.action}</Badge> },
    { key: "entity", header: "Entidade", render: (e) => e.entity },
    { key: "origin", header: "Origem", render: (e) => <Badge variant={originVariant[e.origin]}>{e.origin}</Badge> },
  ];

  return (
    <>
      <FilterBar showCompare={false} />
      <DashboardLayout>
        <PageHeader
          title="Trilha de Auditoria"
          description="Registro imutável de toda ação de escrita — quem, o quê, quando, antes/depois"
        />

        <div className="flex items-center gap-3 rounded-md border bg-sunken px-4 py-2.5">
          <Lock className="h-3.5 w-3.5 text-gray-500" />
          <p className="text-caption text-gray-600">
            Registros de auditoria são imutáveis (append-only) e retidos por no mínimo 5 anos. Tentativas de alteração são bloqueadas e registradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger chip><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Origem: Todas</SelectItem>
              <SelectItem value="ui">Interface (UI)</SelectItem>
              <SelectItem value="sync">Sincronização</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          onRowClick={(e) => setExpanded(expanded === e.id ? null : e.id)}
          footer={
            expanded ? (
              (() => {
                const ev = filtered.find((e) => e.id === expanded);
                if (!ev) return null;
                return (
                  <div className="border-t bg-sunken px-4 py-3 text-body-sm">
                    <p className="mb-2 font-medium text-gray-800">Diff do evento · {ev.entity}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className={cn("rounded-md border bg-surface p-3", !ev.before && "opacity-50")}>
                        <p className="text-caption uppercase text-muted-foreground">Antes</p>
                        <p className="mt-1 font-mono text-xs text-gray-700">{ev.before ?? "—"}</p>
                      </div>
                      <div className="rounded-md border bg-surface p-3">
                        <p className="text-caption uppercase text-muted-foreground">Depois</p>
                        <p className="mt-1 font-mono text-xs text-gray-700">{ev.after ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="border-t px-4 py-2 text-caption text-muted-foreground">
                Clique em um evento para ver o diff antes/depois
              </div>
            )
          }
        />
      </DashboardLayout>
    </>
  );
}
