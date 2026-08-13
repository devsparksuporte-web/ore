"use client";

/**
 * LIQUIDEZ — consumo de caixa na coluna de conteúdo e o RUNWAY como nota de
 * margem (é ele que aciona a decisão de aporte).
 *
 * Sprint 1.4: quando a fonte não informa o SALDO de caixa, o runway não é
 * calculável — e a seção diz isso, com o motivo, em vez de estimar. Consumo
 * real e runway ausente convivem: o que se sabe aparece, o que falta é cobrado.
 */
import { EditorialSection } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { Liquidity, PerformanceDerived } from "@modules/performance";
import { RUNWAY_ATTENTION_MONTHS, RUNWAY_CRITICAL_MONTHS } from "@modules/performance";
import { opcional, runwayLabel, SEM_DADO } from "./helpers";
import { BurnChart } from "./burn-chart";
import { cn } from "@/lib/utils";

function BurnStat({ label, value, first }: { label: string; value: string; first?: boolean }) {
  const vazio = value === SEM_DADO;
  return (
    <div className={cn("px-6", first ? "pl-0" : "border-l")}>
      <p
        className={cn(
          "font-display leading-none tracking-snug tnum",
          vazio ? "text-body-sm font-normal text-gray-400" : "text-h2 font-normal text-navy-900"
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-caption text-gray-500">{label}</p>
    </div>
  );
}

export function LiquiditySection({ liquidity, derived }: { liquidity: Liquidity; derived: PerformanceDerived }) {
  const cur = liquidity.currency ?? "BRL";
  const money = (n: number) => formatMoney(n, { compact: true, currency: cur });
  const temRunway = derived.runwayMonths !== null;

  const zoneTone = !temRunway
    ? "text-gray-400"
    : derived.runwayZone === "critical" ? "text-danger"
      : derived.runwayZone === "attention" ? "text-warning" : "text-success";
  const zoneLabel = !temRunway
    ? null
    : derived.runwayZone === "critical" ? "Crítico"
      : derived.runwayZone === "attention" ? "Atenção" : "Saudável";

  return (
    <EditorialSection
      title="Liquidez &amp; consumo"
      meta={liquidity.burnSeries.length > 0 ? "Saída líquida de caixa · 12 meses" : undefined}
      aside={
        <div>
          <p className="text-caption text-gray-500">Runway</p>
          <p
            className={cn(
              "mt-1.5 font-display font-normal leading-none tracking-[-0.02em] tnum",
              temRunway ? "text-[26px]" : "text-body-sm",
              zoneTone
            )}
          >
            {runwayLabel(derived.runwayMonths)}
          </p>
          {zoneLabel && <p className={cn("mt-1.5 text-caption", zoneTone)}>{zoneLabel}</p>}
          <p className="mt-3 text-caption leading-6 text-gray-500">
            {temRunway
              ? `Crítico abaixo de ${RUNWAY_CRITICAL_MONTHS} meses; atenção entre ${RUNWAY_CRITICAL_MONTHS} e ${RUNWAY_ATTENTION_MONTHS}.`
              : liquidity.unavailableReason}
          </p>
          <div className="mt-4 border-t pt-3">
            <p className="text-caption text-gray-500">Caixa</p>
            <p
              className={cn(
                "mt-1 font-display font-normal tnum",
                liquidity.cash === null ? "text-body-sm text-gray-400" : "text-h3 text-navy-900"
              )}
            >
              {opcional(liquidity.cash, money)}
            </p>
            <p className="mt-2.5 text-caption text-gray-500">Contingências</p>
            <p
              className={cn(
                "mt-1 font-display font-normal tnum",
                liquidity.contingencies === null ? "text-body-sm text-gray-400" : "text-h3 text-warning"
              )}
            >
              {opcional(liquidity.contingencies, money)}
            </p>
          </div>
        </div>
      }
    >
      <div className="mb-5 grid grid-cols-3">
        <BurnStat first label="Consumo mensal" value={opcional(liquidity.burnMonthly, money)} />
        <BurnStat label="Trimestral" value={opcional(liquidity.burnQuarterly, money)} />
        <BurnStat label="Anual" value={opcional(liquidity.burnAnnual, money)} />
      </div>

      {liquidity.burnSeries.length > 0 ? (
        <BurnChart data={liquidity.burnSeries} />
      ) : (
        /* Sem série mensal na fonte: em vez de um gráfico de um ponto só (ou
           de uma curva interpolada), a informação que existe de fato. */
        liquidity.unclassified != null && (
          <div className="border-t pt-4">
            <p className="text-body-sm leading-6 text-gray-700">
              Do consumo do mês, <span className="tnum font-medium text-navy-900">{money(liquidity.unclassified)}</span>{" "}
              está sem classificação de atividade na planilha de origem — não entra nos totais por atividade acima.
            </p>
            <p className="mt-1.5 text-caption leading-6 text-gray-500">
              Mesma natureza das contas não mapeadas do DRE: o valor não some, mas não pode ser atribuído.
            </p>
          </div>
        )
      )}
    </EditorialSection>
  );
}
