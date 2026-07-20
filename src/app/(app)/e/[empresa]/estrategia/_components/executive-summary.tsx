"use client";

/**
 * RESUMO EXECUTIVO — faixa leve de 4 indicadores (sem caixas individuais),
 * dividida por fios verticais. Cor apenas quando há sinal (bloqueios / riscos).
 * Responde "Onde estamos?" num relance. Só tokens do DS.
 */
export interface SummaryItem { label: string; value: string; alert?: boolean }

export function ExecutiveSummary({ items }: { items: SummaryItem[] }) {
  return (
    <section className="grid grid-cols-2 rounded-md border bg-surface shadow-xs sm:grid-cols-4 sm:divide-x">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`px-5 py-4 ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i % 2 === 1 ? "border-l sm:border-l-0" : ""}`}
        >
          <p className={`font-display text-2xl font-semibold tnum ${it.alert ? "text-danger" : "text-navy-900"}`}>{it.value}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">{it.label}</p>
        </div>
      ))}
    </section>
  );
}
