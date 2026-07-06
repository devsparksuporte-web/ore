"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { OrderStatusBadge } from "@/components/data/status-badge";
import { ApprovalTimeline } from "@/components/data/approval-timeline";
import { SourceCaption } from "@/components/data/source-caption";
import { purchaseFunnel, purchaseOrders, suppliers } from "@/mocks/operacoes";
import { formatDate, formatMoney } from "@/lib/format";
import type { PurchaseOrder, Supplier } from "@/types/domain";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

export default function ComprasPage() {
  const [selected, setSelected] = React.useState<PurchaseOrder | null>(null);
  const concentrated = suppliers.find((s) => s.concentrationPct > 40);

  const orderCols: Column<PurchaseOrder>[] = [
    { key: "number", header: "Pedido", render: (o) => <span className="font-medium text-navy-900">{o.number}</span> },
    { key: "date", header: "Data", render: (o) => formatDate(o.date) },
    { key: "requester", header: "Solicitante", render: (o) => o.requester },
    { key: "supplier", header: "Fornecedor", render: (o) => o.supplier },
    { key: "cc", header: "Centro de custo", render: (o) => <span className="text-muted-foreground">{o.costCenter}</span> },
    { key: "amount", header: "Valor", align: "right", render: (o) => <span className="font-medium tnum">{formatMoney(o.amount)}</span> },
    { key: "status", header: "Status", render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: "aging", header: "Em aberto", align: "right",
      render: (o) => (
        <span className={cn("tnum", o.agingDays > 5 && "font-semibold text-warning-fg")}>
          {o.agingDays > 0 ? `${o.agingDays}d` : "—"}
        </span>
      ),
    },
  ];

  const supplierCols: Column<Supplier>[] = [
    { key: "name", header: "Fornecedor", render: (s) => <span className="font-medium text-gray-800">{s.name}</span> },
    { key: "taxId", header: "CNPJ", render: (s) => <span className="text-muted-foreground tnum">{s.taxId}</span> },
    { key: "category", header: "Categoria", render: (s) => s.category },
    { key: "vol", header: "Volume 12m", align: "right", render: (s) => <span className="tnum">{formatMoney(s.volume12m, { compact: true })}</span> },
    {
      key: "conc", header: "Concentração", align: "right",
      render: (s) => (
        <span className={cn("font-medium tnum", s.concentrationPct > 40 && "text-warning-fg")}>{s.concentrationPct}%</span>
      ),
    },
    { key: "last", header: "Último pedido", render: (s) => s.lastOrder },
  ];

  return (
    <>
      <FilterBar showCompare={false} />
      <DashboardLayout>
        <PageHeader title="Compras" description="Espelho do Protheus · funil, pedidos e fornecedores" />

        {/* Funil + métricas */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-6">
          {purchaseFunnel.map((f) => (
            <Card key={f.stage}>
              <CardContent className="p-4 text-center">
                <p className="font-display text-xl font-semibold tnum text-navy-900">{f.count}</p>
                <p className="text-caption text-muted-foreground">{f.stage}</p>
                <p className="text-caption tnum text-gray-500">{formatMoney(f.value, { compact: true })}</p>
              </CardContent>
            </Card>
          ))}
          <Card><CardContent className="p-4 text-center"><p className="font-display text-xl font-semibold tnum text-navy-900">6,2d</p><p className="text-caption text-muted-foreground">Lead time médio</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="font-display text-xl font-semibold tnum text-success">R$ 184 mil</p><p className="text-caption text-muted-foreground">Saving no mês</p></CardContent></Card>
        </section>

        {/* Alerta de concentração (RF043) */}
        {concentrated && (
          <div className="flex items-center gap-3 rounded-md border border-info/30 bg-info-bg px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-info-fg" />
            <p className="text-body-sm text-info-fg">
              <span className="font-semibold">{concentrated.name}</span> concentra {concentrated.concentrationPct}% do volume de compras
              dos últimos 12 meses (limiar: 40%). Avalie alternativas de fornecimento.
            </p>
          </div>
        )}

        <Tabs defaultValue="pedidos">
          <TabsList>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          </TabsList>
          <TabsContent value="pedidos">
            <DataTable columns={orderCols} rows={purchaseOrders} onRowClick={setSelected} />
          </TabsContent>
          <TabsContent value="fornecedores">
            <DataTable columns={supplierCols} rows={suppliers} />
          </TabsContent>
        </Tabs>
      </DashboardLayout>

      {/* Drawer do pedido: itens + saldo orçamentário + timeline (RF050) */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent wide>
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle>{selected.number} · {selected.supplier}</SheetTitle>
                  <OrderStatusBadge status={selected.status} />
                </div>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {selected.category} · {selected.costCenter} · solicitado por {selected.requester} em {formatDate(selected.date)}
                </p>
              </SheetHeader>
              <SheetBody className="space-y-5">
                {/* Itens */}
                <section>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Itens</h4>
                  <div className="space-y-1.5">
                    {selected.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-body-sm">
                        <span className="text-gray-700">{it.description}</span>
                        <span className="shrink-0 tnum text-muted-foreground">{it.qty} × {formatMoney(it.unitPrice)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-3 pt-1 text-sm font-semibold text-navy-900">
                      <span>Total</span><span className="tnum">{formatMoney(selected.amount)}</span>
                    </div>
                  </div>
                </section>

                {/* Contexto orçamentário — o diferencial da decisão (RF050) */}
                {selected.budgetBalance && (
                  <section className="rounded-md border border-action-600/30 bg-action-100/40 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-action-700">Contexto orçamentário</h4>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-body-sm">
                      <div>
                        <p className="text-caption text-muted-foreground">Conta</p>
                        <p className="font-medium text-gray-800">{selected.budgetBalance.account}</p>
                      </div>
                      <div>
                        <p className="text-caption text-muted-foreground">Saldo disponível no orçamento</p>
                        <p className={cn("font-semibold tnum", selected.budgetBalance.available < selected.amount ? "text-danger" : "text-success")}>
                          {formatMoney(selected.budgetBalance.available)}
                        </p>
                      </div>
                    </div>
                    {selected.budgetBalance.available < selected.amount && (
                      <p className="mt-2 text-caption font-medium text-danger">
                        ⚠ Este pedido excede o saldo orçamentário disponível da conta.
                      </p>
                    )}
                  </section>
                )}

                {/* Timeline */}
                <section>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trilha de aprovação</h4>
                  <ApprovalTimeline steps={selected.timeline} />
                </section>

                <div className="rounded-md bg-sunken p-3">
                  <SourceCaption source="Protheus SC7 · sync hoje 06:15 · decisões sincronizam com o ERP" />
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
