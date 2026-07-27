"use client";

/**
 * VALOR (HERO) — valuation atual, variação anual e evolução no tempo.
 * Responde "estamos criando valor?". Bloco mais nobre da tela.
 * Só componentes/tokens do DS + gráfico local sobre os primitivos de dataviz.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { SourceCaption } from "@/components/data/source-caption";
import { formatMoney } from "@/lib/format";
import type { PerformanceDerived, PerformanceSnapshot } from "@modules/performance";
import { formatAsOf } from "./helpers";
import { ValuationChart } from "./valuation-chart";

export function ValueHero({ snap, derived }: { snap: PerformanceSnapshot; derived: PerformanceDerived }) {
  const v = snap.valuation;
  const up = derived.valuationVariationYoY >= 0;
  return (
    <Card>
      <CardHeader><CardTitle>Valor da participação</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <p className="text-body-sm text-gray-500">Valuation atual</p>
            <p className="mt-1 font-display text-kpi tnum tracking-kpi text-navy-900">{formatMoney(v.current, { compact: true })}</p>
          </div>
          <div>
            <p className="text-body-sm text-gray-500">Variação anual</p>
            <div className="mt-2"><DeltaIndicator value={derived.valuationVariationYoY} favorable={up} label="a.a." /></div>
          </div>
        </div>

        <ValuationChart data={v.annualSeries} />

        <div className="flex items-center justify-between border-t pt-3">
          <SourceCaption source={`${v.method} · data-base ${formatAsOf(v.asOf)}`} />
        </div>
      </CardContent>
    </Card>
  );
}
