"use client";

/**
 * VALOR — seção editorial (sem card): evolução do valuation na coluna de
 * conteúdo e o múltiplo como NOTA DE MARGEM. Responde "estamos criando valor?".
 */
import { EditorialSection } from "@/components/ui";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { formatMoney } from "@/lib/format";
import type { PerformanceDerived, PerformanceSnapshot } from "@modules/performance";
import { formatAsOf, moicLabel } from "./helpers";
import { ValuationChart } from "./valuation-chart";

export function ValueHero({ snap, derived }: { snap: PerformanceSnapshot; derived: PerformanceDerived }) {
  const v = snap.valuation;
  const up = derived.valuationVariationYoY >= 0;

  return (
    <EditorialSection
      title="Valor da participação"
      meta={`${v.method} · data-base ${formatAsOf(v.asOf)}`}
      aside={
        <div>
          <p className="text-caption text-gray-500">Múltiplo sobre o capital</p>
          <p className="mt-1.5 font-display text-[26px] font-normal leading-none tracking-[-0.02em] tnum text-navy-900">
            {moicLabel(derived.moic)}
          </p>
          <p className="mt-3 text-caption leading-6 text-gray-500">
            Sobre {formatMoney(v.investedCapital, { compact: true })} investidos. Marcação por {v.method},
            comitê de valuation.
          </p>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display text-kpi font-normal tracking-kpi tnum text-navy-900">
          {formatMoney(v.current, { compact: true })}
        </span>
        <DeltaIndicator value={derived.valuationVariationYoY} favorable={up} label="a.a." />
      </div>

      <ValuationChart data={v.annualSeries} />
    </EditorialSection>
  );
}
