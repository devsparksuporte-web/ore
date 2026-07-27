"use client";

/**
 * LIQUIDEZ — cash burn (mensal/trimestral/anual + série) e RUNWAY em destaque
 * (medidor de faixa), mais caixa e contingências. Responde "a empresa aguenta?
 * vem chamada de capital?". Runway isolado porque carrega julgamento, não só
 * um número. Só componentes/tokens do DS + gráfico local.
 */
import { Card, CardContent, CardHeader, CardTitle, ThresholdMeter } from "@/components/ui";
import { SourceCaption } from "@/components/data/source-caption";
import { formatMoney } from "@/lib/format";
import type { Liquidity, PerformanceDerived } from "@modules/performance";
import { RUNWAY_ATTENTION_MONTHS, RUNWAY_CRITICAL_MONTHS } from "@modules/performance";
import { runwayLabel } from "./helpers";
import { BurnChart } from "./burn-chart";

function BurnStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-body-sm text-gray-500">{label}</p>
      <p className="mt-1 font-display text-h3 font-semibold tnum text-navy-900">{value}</p>
    </div>
  );
}

export function LiquidityBurn({ liquidity }: { liquidity: Liquidity }) {
  return (
    <Card>
      <CardHeader><CardTitle>Cash burn</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <BurnStat label="Mensal" value={formatMoney(liquidity.burnMonthly, { compact: true })} />
          <BurnStat label="Trimestral" value={formatMoney(liquidity.burnQuarterly, { compact: true })} />
          <BurnStat label="Anual" value={formatMoney(liquidity.burnAnnual, { compact: true })} />
        </div>
        <BurnChart data={liquidity.burnSeries} />
        <div className="border-t pt-3"><SourceCaption source="Saída líquida de caixa · workbook / Protheus" /></div>
      </CardContent>
    </Card>
  );
}

export function RunwayCard({ liquidity, derived }: { liquidity: Liquidity; derived: PerformanceDerived }) {
  return (
    <Card>
      <CardHeader><CardTitle>Runway</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <ThresholdMeter
          value={derived.runwayMonths}
          zones={[
            { limit: RUNWAY_CRITICAL_MONTHS, tone: "danger" },
            { limit: RUNWAY_ATTENTION_MONTHS, tone: "warning" },
            { limit: Infinity, tone: "success" },
          ]}
          valueLabel={runwayLabel(derived.runwayMonths)}
          caption={`Crítico < ${RUNWAY_CRITICAL_MONTHS}m · atenção ${RUNWAY_CRITICAL_MONTHS}–${RUNWAY_ATTENTION_MONTHS}m · saudável > ${RUNWAY_ATTENTION_MONTHS}m`}
        />
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-body-sm text-gray-500">Caixa</p>
            <p className="mt-1 font-display text-h3 font-semibold tnum text-navy-900">{formatMoney(liquidity.cash, { compact: true })}</p>
          </div>
          <div>
            <p className="text-body-sm text-gray-500">Contingências</p>
            <p className="mt-1 font-display text-h3 font-semibold tnum text-warning">{formatMoney(liquidity.contingencies, { compact: true })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
