"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { EditorialSection } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { FinancialTable } from "@/components/data/financial-table";
import { ChartCard } from "@/components/data/chart-card";
import { PeriodBadge } from "@/components/data/status-badge";
import { SourceCaption } from "@/components/data/source-caption";
import { WaterfallChart } from "@/components/charts/waterfall-chart";
import { dreTree, UNMAPPED_ACCOUNTS } from "@/mocks/financeiro";
import { getResultadoDocumentado } from "@modules/financials";
import { BlockRenderer } from "@/components/data/block-renderer";
import { formatMoney } from "@/lib/format";
import type { DreLine } from "@/types/domain";
import { DashboardLayout } from "@/components/layouts";

const ebitdaBridge = [
  { name: "EBITDA", value: 5.4, kind: "pillar" as const },
  { name: "D&A", value: -1.65, kind: "delta" as const },
  { name: "Financeiro", value: -0.82, kind: "delta" as const },
  { name: "Resultado", value: 2.93, kind: "pillar" as const },
];

const mockEntries = [
  { id: "l1", date: "28/06", doc: "CT2-88412", desc: "Fatura Enel — demanda contratada", value: -486_000 },
  { id: "l2", date: "25/06", doc: "CT2-88274", desc: "Fatura Enel — consumo planta", value: -1_212_000 },
  { id: "l3", date: "15/06", doc: "CT2-87991", desc: "Rateio energia — mina", value: -282_000 },
];

export default function DrePage() {
  const { empresa } = useParams<{ empresa: string }>();
  const [drillLine, setDrillLine] = React.useState<DreLine | null>(null);
  /* Fase 6 — onde existe resultado documentado para ESTA investida, ele vem
     primeiro. O detalhamento por conta abaixo continua demonstrativo: os
     documentos da Ore trazem resultado consolidado por exercício, não plano
     de contas — e montar um a partir do outro seria inventar estrutura. */
  const documentado = getResultadoDocumentado(empresa);

  return (
    <>
      <FilterBar />
      <DashboardLayout>
        <PageHeader title="DRE" description="Demonstração do resultado — navegável até o lançamento" badge={<PeriodBadge published dataStatus="DEMONSTRATIVO" />} />

        {documentado.length > 0 && <BlockRenderer blocos={documentado} />}

        {documentado.length > 0 && (
          <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
            Abaixo, o detalhamento por conta segue demonstrativo: os documentos
            disponibilizados trazem o resultado consolidado do exercício, não o
            plano de contas desta investida.
          </p>
        )}

        {/* Aviso de de-para incompleto (RF023) */}
        <div className="flex items-center gap-3 rounded-md border border-warning/40 bg-warning-bg px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning-fg" />
          <p className="flex-1 text-body-sm text-warning-fg">
            <span className="font-semibold">{UNMAPPED_ACCOUNTS} contas não mapeadas</span> — os valores dessas contas estão agregados
            na linha “Não mapeadas” e podem distorcer a visão gerencial.
          </p>
          <Link href={`/e/${empresa}/config/de-para`} className="shrink-0 text-body-sm font-semibold text-warning-fg underline">
            Resolver de-para →
          </Link>
        </div>

        <Tabs defaultValue="gerencial">
          <TabsList>
            <TabsTrigger value="gerencial">Visão Gerencial</TabsTrigger>
            <TabsTrigger value="contabil">Visão Contábil</TabsTrigger>
          </TabsList>

          <TabsContent value="gerencial" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <FinancialTable
                  lines={dreTree}
                  onLineClick={(l) => setDrillLine(l)}
                />
                <div className="mt-2"><SourceCaption source="Estrutura da DRE gerencial" dataStatus="DEMONSTRATIVO" /></div>
              </div>
              <div className="xl:col-span-4">
                <ChartCard title="Ponte EBITDA → Resultado" subtitle="R$ mi · jun/26" source="DRE gerencial">
                  <WaterfallChart data={ebitdaBridge} height={220} />
                </ChartCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contabil">
            <EditorialSection title="Visão contábil (plano original do ERP)">
                <p className="text-sm text-muted-foreground">
                  Estrutura espelhada do plano de contas contábil, sem reclassificação gerencial.
                  Mesmos valores, hierarquia contábil original — disponível para conciliação com o balancete.
                </p>
            </EditorialSection>
          </TabsContent>
        </Tabs>
      </DashboardLayout>

      {/* Drill: linha → lançamentos (doc 08 C3) */}
      <Sheet open={!!drillLine} onOpenChange={(o) => !o && setDrillLine(null)}>
        <SheetContent wide>
          {drillLine && (
            <>
              <SheetHeader>
                <SheetTitle>Lançamentos · {drillLine.label}</SheetTitle>
                <p className="mt-1 text-body-sm text-muted-foreground">Junho/2026 · visão contábil</p>
              </SheetHeader>
              <SheetBody>
                <div className="space-y-2">
                  {mockEntries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-body-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{e.desc}</p>
                        <p className="text-caption text-muted-foreground">{e.date} · {e.doc}</p>
                      </div>
                      <span className="shrink-0 font-medium tnum text-danger">({formatMoney(Math.abs(e.value))})</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md bg-sunken p-3">
                  <SourceCaption source="O drill preserva os filtros aplicados" dataStatus="DEMONSTRATIVO" />
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
