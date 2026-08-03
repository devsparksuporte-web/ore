"use client";

/**
 * LIQUIDEZ — seção editorial: cash burn na coluna de conteúdo e o RUNWAY como
 * nota de margem (é ele que aciona a decisão de aporte). Responde "a empresa
 * aguenta? vem chamada de capital?".
 */
import { EditorialSection } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { Liquidity, PerformanceDerived } from "@modules/performance";
import { RUNWAY_ATTENTION_MONTHS, RUNWAY_CRITICAL_MONTHS } from "@modules/performance";
import { runwayLabel } from "./helpers";
import { BurnChart } from "./burn-chart";
import { cn } from "@/lib/utils";

function BurnStat({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className={cn("px-6", first ? "pl-0" : "border-l")}>
      <p className="font-display text-h2 font-normal leading-none tracking-snug tnum text-navy-900">{value}</p>
      <p className="mt-2 text-caption text-gray-500">{label}</p>
    </div>
  );
}

export function LiquiditySection({ liquidity, derived }: { liquidity: Liquidity; derived: PerformanceDerived }) {
  const zoneTone =
    derived.runwayZone === "critical" ? "text-danger" : derived.runwayZone === "attention" ? "text-warning" : "text-success";
  const zoneLabel =
    derived.runwayZone === "critical" ? "Crítico" : derived.runwayZone === "attention" ? "Atenção" : "Saudável";

  return (
    <EditorialSection
      title="Liquidez"
      meta="Saída líquida de caixa · 12 meses"
      aside={
        <div>
          <p className="text-caption text-gray-500">Runway</p>
          <p className={cn("mt-1.5 font-display text-[26px] font-normal leading-none tracking-[-0.02em] tnum", zoneTone)}>
            {runwayLabel(derived.runwayMonths)}
          </p>
          <p className={cn("mt-1.5 text-caption", zoneTone)}>{zoneLabel}</p>
          <p className="mt-3 text-caption leading-6 text-gray-500">
            Crítico abaixo de {RUNWAY_CRITICAL_MONTHS} meses; atenção entre {RUNWAY_CRITICAL_MONTHS} e{" "}
            {RUNWAY_ATTENTION_MONTHS}.
          </p>
          <div className="mt-4 border-t pt-3">
            <p className="text-caption text-gray-500">Caixa</p>
            <p className="mt-1 font-display text-h3 font-normal tnum text-navy-900">
              {formatMoney(liquidity.cash, { compact: true })}
            </p>
            <p className="mt-2.5 text-caption text-gray-500">Contingências</p>
            <p className="mt-1 font-display text-h3 font-normal tnum text-warning">
              {formatMoney(liquidity.contingencies, { compact: true })}
            </p>
          </div>
        </div>
      }
    >
      <div className="mb-5 grid grid-cols-3">
        <BurnStat first label="Burn mensal" value={formatMoney(liquidity.burnMonthly, { compact: true })} />
        <BurnStat label="Trimestral" value={formatMoney(liquidity.burnQuarterly, { compact: true })} />
        <BurnStat label="Anual" value={formatMoney(liquidity.burnAnnual, { compact: true })} />
      </div>
      <BurnChart data={liquidity.burnSeries} />
    </EditorialSection>
  );
}
