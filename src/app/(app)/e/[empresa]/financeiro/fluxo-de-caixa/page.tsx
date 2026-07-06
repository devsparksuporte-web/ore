"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { DataTable, type Column } from "@/components/data/data-table";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { EmptyState } from "@/components/data/empty-state";
import { SourceCaption } from "@/components/data/source-caption";
import { CashChart } from "@/components/charts/cash-chart";
import { bankAccounts, cashFlow, CASH_MINIMUM, cashTitles } from "@/mocks/financeiro";
import { formatDate, formatMoney } from "@/lib/format";
import type { CashTitle } from "@/types/domain";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

export default function CashFlowPage() {
  const [selected, setSelected] = React.useState<CashTitle | null>(null);
  const [kindFilter, setKindFilter] = React.useState<"all" | "payable" | "receivable">("all");

  const filtered = cashTitles.filter((t) => kindFilter === "all" || t.kind === kindFilter);

  const columns: Column<CashTitle>[] = [
    {
      key: "kind", header: "Tipo",
      render: (t) => (
        <Badge variant={t.kind === "receivable" ? "success" : "default"}>
          {t.kind === "receivable" ? "Entrada" : "Saída"}
        </Badge>
      ),
    },
    { key: "counterparty", header: "Contraparte", render: (t) => <span className="font-medium text-gray-800">{t.counterparty}</span> },
    { key: "document", header: "Documento", render: (t) => <span className="text-muted-foreground">{t.document}</span> },
    { key: "nature", header: "Natureza", render: (t) => t.nature },
    { key: "due", header: "Vencimento", render: (t) => formatDate(t.dueDate) },
    {
      key: "amount", header: "Valor", align: "right",
      render: (t) => (
        <span className={cn("font-medium tnum", t.kind === "payable" && "text-danger")}>
          {t.kind === "payable" ? `(${formatMoney(t.amount)})` : formatMoney(t.amount)}
        </span>
      ),
    },
    {
      key: "status", header: "Status",
      render: (t) => (
        <Badge variant={t.status === "settled" ? "success" : t.status === "open" ? "info" : "warning"}>
          {t.status === "settled" ? "Liquidado" : t.status === "open" ? "Em aberto" : "Parcial"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <FilterBar showCompare={false} />
      <DashboardLayout>
        <PageHeader title="Fluxo de Caixa" description="Posição, projeção e movimentos — Ativa Mineração" />

        {/* KPIs do recorte */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MiniStat label="Saldo atual" value="R$ 48,2 mi" />
          <MiniStat label="Entradas (jun)" value="R$ 23,4 mi" delta={<DeltaIndicator value={4.1} favorable label="vs mai" />} />
          <MiniStat label="Saídas (jun)" value="R$ 20,1 mi" delta={<DeltaIndicator value={7.8} favorable={false} label="vs mai" />} />
          <MiniStat label="Cobertura" value="4,2 meses" />
        </section>

        {/* Alerta de projeção × caixa mínimo (RF028) */}
        <div className="flex items-center gap-3 rounded-md border border-warning/40 bg-warning-bg px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning-fg" />
          <p className="text-body-sm text-warning-fg">
            <span className="font-semibold">Atenção à projeção:</span> na semana S26 o saldo projetado se aproxima do caixa mínimo
            (R$ {CASH_MINIMUM} mi). Revise as premissas ou reprograme saídas.
          </p>
        </div>

        <Tabs defaultValue="realizado">
          <TabsList>
            <TabsTrigger value="realizado">Realizado + Projetado</TabsTrigger>
            <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
            <TabsTrigger value="premissas">Premissas</TabsTrigger>
          </TabsList>

          <TabsContent value="realizado" className="space-y-4">
            <ChartCard title="Evolução do caixa" subtitle="R$ mi · semanal · arraste a régua para dar zoom" source="Protheus · títulos + premissas v3 · hoje 06:15">
              <CashChart data={cashFlow} minimum={CASH_MINIMUM} zoomable />
            </ChartCard>
            <Card>
              <CardHeader><CardTitle>Posição por conta bancária</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {bankAccounts.map((b) => (
                  <div key={b.bank} className="rounded-md border p-4">
                    <p className="text-caption uppercase tracking-wide text-muted-foreground">{b.bank}</p>
                    <p className="mt-1 font-display text-lg font-semibold tnum text-navy-900">{formatMoney(b.balance, { compact: true })}</p>
                    <p className="text-caption text-muted-foreground tnum">{b.pct}% do total</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movimentos" className="space-y-3">
            <div className="flex items-center gap-2">
              {(["all", "receivable", "payable"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-body-sm font-medium",
                    kindFilter === k ? "border-action-600 bg-action-100 text-action-700" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {k === "all" ? "Todos" : k === "receivable" ? "Entradas" : "Saídas"}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <EmptyState kind="no-results" title="Nenhum título para os filtros aplicados" actionLabel="Limpar filtros" onAction={() => setKindFilter("all")} />
            ) : (
              <DataTable columns={columns} rows={filtered} onRowClick={setSelected} />
            )}
          </TabsContent>

          <TabsContent value="premissas">
            <Card>
              <CardHeader>
                <CardTitle>Premissas de projeção — v3</CardTitle>
                <Badge variant="outline">editadas por Bruna M. Cruz · 15/jun</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Recebimento contrato TitanTrade", value: "+R$ 4,6 mi/mês", kind: "Recorrente" },
                  { name: "Folha + encargos", value: "−R$ 3,1 mi/mês", kind: "Recorrente" },
                  { name: "Parcela CAPEX planta fase 2", value: "−R$ 1,8 mi (jul, ago, set)", kind: "Pontual" },
                  { name: "Ajuste sazonal energia (seca)", value: "−8% sobre custo energia jul–out", kind: "Ajuste" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-md border px-4 py-3 text-body-sm">
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-caption text-muted-foreground">{p.kind}</p>
                    </div>
                    <span className="font-medium tnum text-gray-700">{p.value}</span>
                  </div>
                ))}
                <p className="pt-1"><SourceCaption source="Premissas versionadas — histórico completo na auditoria" /></p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>

      {/* Drawer do título (padrão: transação nunca navega — doc 06 A4) */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.document} · {selected.counterparty}</SheetTitle>
                <p className="mt-1 text-body-sm text-muted-foreground">{selected.nature}</p>
              </SheetHeader>
              <SheetBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor" value={formatMoney(selected.amount)} strong />
                  <Field label="Vencimento" value={formatDate(selected.dueDate)} />
                  <Field label="Tipo" value={selected.kind === "receivable" ? "A receber" : "A pagar"} />
                  <Field label="Conta de liquidação" value={selected.bankAccount} />
                  <Field label="Status" value={selected.status === "settled" ? "Liquidado" : "Em aberto"} />
                  {selected.orderRef && <Field label="Pedido de origem" value={selected.orderRef} link />}
                </div>
                <div className="rounded-md bg-sunken p-3">
                  <SourceCaption source="Protheus · SE1/SE2 · sync hoje 06:15 · execução #sr-1" />
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function MiniStat({ label, value, delta }: { label: string; value: string; delta?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-xl font-semibold tnum text-navy-900">{value}</p>
        {delta}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, strong, link }: { label: string; value: string; strong?: boolean; link?: boolean }) {
  return (
    <div>
      <p className="text-caption uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm tnum", strong && "font-semibold text-navy-900", link && "font-medium text-action-600")}>{value}</p>
    </div>
  );
}
