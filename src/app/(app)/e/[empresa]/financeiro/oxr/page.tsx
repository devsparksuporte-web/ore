"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { ChartCard } from "@/components/data/chart-card";
import { DeviationHeatmap } from "@/components/charts/heatmap";
import { WaterfallChart } from "@/components/charts/waterfall-chart";
import { oxrLines, oxrWaterfall } from "@/mocks/financeiro";
import { formatAccounting, formatPct } from "@/lib/format";
import type { OxrLine } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

const justificationSchema = z.object({
  rootCause: z.string().min(1, "Selecione a causa raiz"),
  description: z.string().min(20, "Descreva com pelo menos 20 caracteres"),
  actionPlan: z.string().min(20, "Plano de ação com pelo menos 20 caracteres"),
});
type JustificationForm = z.infer<typeof justificationSchema>;

const months = ["jan", "fev", "mar", "abr", "mai", "jun"];

export default function OxrPage() {
  const [justifying, setJustifying] = React.useState<OxrLine | null>(null);
  const [onlyDeviations, setOnlyDeviations] = React.useState(false);

  const withDev = oxrLines.map((l) => ({ ...l, dev: ((l.actual - l.budget) / Math.abs(l.budget)) * 100 }));
  const filtered = onlyDeviations ? withDev.filter((l) => Math.abs(l.dev) > 5) : withDev;
  const pendingCount = oxrLines.filter((l) => l.justification === "pending").length;

  const columns: Column<(typeof withDev)[number]>[] = [
    { key: "label", header: "Linha orçamentária", render: (l) => <span className="font-medium text-gray-800">{l.label}</span> },
    { key: "cc", header: "Centro de custo", render: (l) => <span className="text-muted-foreground">{l.costCenter}</span> },
    { key: "budget", header: "Orçado (R$ mil)", align: "right", render: (l) => formatAccounting(l.budget) },
    { key: "actual", header: "Realizado (R$ mil)", align: "right", render: (l) => formatAccounting(l.actual) },
    {
      key: "dev", header: "Δ%", align: "right",
      render: (l) => {
        // custo acima do orçado = desfavorável; receita abaixo = desfavorável
        const isRevenue = l.label.toLowerCase().includes("receita");
        const favorable = isRevenue ? l.dev >= 0 : l.dev <= 0;
        return <DeltaIndicator value={l.dev} favorable={favorable} />;
      },
    },
    {
      key: "just", header: "Justificativa",
      render: (l) => {
        if (l.justification === "accepted") return <Badge variant="success">Aceita</Badge>;
        if (l.justification === "submitted") return <Badge variant="info">Em análise</Badge>;
        if (l.justification === "pending")
          return (
            <button
              onClick={(e) => { e.stopPropagation(); setJustifying(l); }}
              className="rounded-full bg-warning-bg px-2 py-0.5 text-caption font-semibold text-warning-fg hover:underline"
            >
              Pendente — justificar
            </button>
          );
        return <span className="text-caption text-muted-foreground">dentro do limiar</span>;
      },
    },
  ];

  return (
    <>
      <FilterBar />
      <DashboardLayout>
        <PageHeader
          title="Orçado x Realizado"
          description="Baseline: Orçamento 2026 v2 (ativa) · limiar de justificativa: 5%"
          badge={pendingCount > 0 ? <Badge variant="warning">{pendingCount} justificativas pendentes</Badge> : undefined}
        />

        {/* KPIs do recorte */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Desvio total (jun)" value="−R$ 1,5 mi" tone="danger" />
          <StatCard label="Desvio %" value="−21,7% EBITDA" tone="danger" />
          <StatCard label="Linhas fora do limiar" value="5 de 7" />
          <StatCard label="Justificativas no prazo" value="67%" />
        </section>

        <Tabs defaultValue="matriz">
          <TabsList>
            <TabsTrigger value="matriz">Matriz</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          </TabsList>

          <TabsContent value="matriz" className="space-y-3">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-body-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyDeviations}
                onChange={(e) => setOnlyDeviations(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-action-600"
              />
              Somente desvios acima do limiar (5%)
            </label>
            <DataTable columns={columns} rows={filtered} />
          </TabsContent>

          <TabsContent value="heatmap">
            <ChartCard title="Desvio por linha × mês" subtitle="% vs orçado · vermelho = desfavorável" source="Orçamento 2026 v2 × realizado Protheus">
              <DeviationHeatmap months={months} rows={oxrLines.map((l) => ({ label: l.label, values: l.monthly }))} />
            </ChartCard>
          </TabsContent>

          <TabsContent value="waterfall">
            <ChartCard title="Ponte EBITDA orçado → realizado" subtitle="R$ mi · junho/2026" source="DRE gerencial × Orçamento 2026 v2">
              <WaterfallChart data={oxrWaterfall} height={300} />
            </ChartCard>
          </TabsContent>
        </Tabs>
      </DashboardLayout>

      {/* Drawer de justificativa (E05-S04: causa + descrição + plano, rascunho automático) */}
      <Sheet open={!!justifying} onOpenChange={(o) => !o && setJustifying(null)}>
        <SheetContent>
          {justifying && <JustificationDrawer line={justifying} onDone={() => setJustifying(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function JustificationDrawer({ line, onDone }: { line: OxrLine; onDone: () => void }) {
  const dev = ((line.actual - line.budget) / Math.abs(line.budget)) * 100;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JustificationForm>({
    resolver: zodResolver(justificationSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Justificativa enviada", { description: "O Controller foi notificado e fará o aceite." });
    onDone();
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Justificar desvio · {line.label}</SheetTitle>
        <p className="mt-1 flex items-center gap-2 text-body-sm text-muted-foreground">
          {line.costCenter} · <DeltaIndicator value={dev} favorable={false} /> vs orçado · prazo 05/jul
        </p>
      </SheetHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
        <SheetBody className="space-y-4">
          <div>
            <Label>Causa raiz</Label>
            <select
              {...register("rootCause")}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>Selecione…</option>
              <option value="price">Preço (tarifa/insumo acima do previsto)</option>
              <option value="volume">Volume (produção/consumo)</option>
              <option value="timing">Timing (antecipação/postergação)</option>
              <option value="one_off">Evento pontual não recorrente</option>
              <option value="other">Outra</option>
            </select>
            {errors.rootCause && <p className="mt-1 text-xs text-danger">{errors.rootCause.message}</p>}
          </div>
          <div>
            <Label>Descrição da causa</Label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Ex.: reajuste tarifário da Enel aplicado em mai/26 (+14%) somado à maior demanda da planta no período seco…"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
          </div>
          <div>
            <Label>Plano de ação</Label>
            <textarea
              {...register("actionPlan")}
              rows={3}
              placeholder="Ex.: renegociação da demanda contratada (ago/26) + estudo de migração ao mercado livre de energia…"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.actionPlan && <p className="mt-1 text-xs text-danger">{errors.actionPlan.message}</p>}
          </div>
          <p className="text-caption text-muted-foreground">Rascunho salvo automaticamente · responsável: {line.assignee}</p>
        </SheetBody>
        <SheetFooter>
          <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Enviar justificativa</Button>
        </SheetFooter>
      </form>
    </>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-1 font-display text-xl font-semibold tnum", tone === "danger" ? "text-danger" : "text-navy-900")}>{value}</p>
      </CardContent>
    </Card>
  );
}
