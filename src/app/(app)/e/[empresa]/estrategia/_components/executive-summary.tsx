"use client";

/**
 * RESUMO EXECUTIVO — faixa leve de 4 indicadores (sem caixas individuais),
 * dividida por fios verticais. Cor apenas quando há sinal (bloqueios / riscos).
 * Responde "Onde estamos?" num relance. Só tokens do DS.
 */
export interface SummaryItem { label: string; value: string; alert?: boolean }

export function ExecutiveSummary({ items }: { items: SummaryItem[] }) {
  return (
    <section className="grid grid-cols-2 gap-y-5 border-y py-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x">
      {items.map((it, i) => (
        <div key={it.label} className={`px-6 first:pl-0 ${i % 2 === 1 ? "border-l sm:border-l-0" : ""}`}>
          <p className={`font-display text-[26px] font-semibold leading-none tnum tracking-kpi ${it.alert ? "text-danger" : "text-navy-900"}`}>
            {it.value}
          </p>
          <p className="mt-2 text-body-sm text-gray-500">{it.label}</p>
        </div>
      ))}
    </section>
  );
}
