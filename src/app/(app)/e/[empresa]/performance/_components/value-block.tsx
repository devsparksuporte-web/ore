"use client";

/**
 * VALOR — seção editorial (sem card): evolução do valuation na coluna de
 * conteúdo e o múltiplo como NOTA DE MARGEM. Responde "estamos criando valor?".
 */
import { EditorialSection } from "@/components/ui";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { formatMoney } from "@/lib/format";
import type { PerformanceDerived, PerformanceSnapshot } from "@modules/performance";
import { formatAsOf, moicLabel, opcional } from "./helpers";
import { ValuationChart } from "./valuation-chart";

export function ValueHero({ snap, derived }: { snap: PerformanceSnapshot; derived: PerformanceDerived }) {
  const v = snap.valuation;
  const up = derived.valuationVariationYoY >= 0;
  /* A moeda vem da FONTE (o fundo marca em USD) — nunca assumir BRL. */
  const money = (n: number) => formatMoney(n, { compact: true, currency: snap.currency });
  /* Uma marcação só: sem série anual, a variação a.a. não tem o que comparar. */
  const temSerie = v.annualSeries.length > 1;

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
            Sobre {money(v.investedCapital)} investidos · {v.method}.
          </p>
          {snap.sourceLabel && (
            <p className="mt-1.5 text-caption leading-6 text-gray-400">{snap.sourceLabel}</p>
          )}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {/* Sprint 1.5 — a marcação pode não existir: quando os documentos
            conflitam sobre o fair value (Alvo), a tela declara a ausência em
            corpo pequeno em vez de exibir um número eleito por conveniência. */}
        <span
          className={
            v.current === null
              ? "font-display text-body-sm font-normal leading-6 tnum text-gray-400"
              : "font-display text-kpi font-normal tracking-kpi tnum text-navy-900"
          }
        >
          {opcional(v.current, money)}
        </span>
        {temSerie && v.current !== null && (
          <DeltaIndicator value={derived.valuationVariationYoY} favorable={up} label="a.a." />
        )}
      </div>

      {temSerie ? (
        <>
          <ValuationChart data={v.annualSeries} />
          {/* Fase 5.2 · ORE-51-002 — quando o valor de topo é "não
              disponibilizado" mas a série existe, o gráfico sozinho contradizia
              a declaração acima. A ressalva vem colada nele. */}
          {v.seriesNote && (
            <p className="mt-3 max-w-prose text-caption leading-6 text-warning-fg">{v.seriesNote}</p>
          )}
        </>
      ) : (
        /* Sem série anual na fonte: um gráfico de um ponto só sugere uma
           tendência que não existe. O histórico completo vem abaixo. */
        <p className="border-t pt-4 text-body-sm leading-6 text-gray-500">
          A fonte registra uma única marcação anual para esta investida — não há
          série para desenhar evolução. As marcações disponíveis estão no
          histórico ao final da página.
        </p>
      )}
    </EditorialSection>
  );
}
