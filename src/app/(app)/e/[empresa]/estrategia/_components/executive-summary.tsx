"use client";

/**
 * RESUMO EXECUTIVO — faixa leve de 4 indicadores (sem caixas individuais),
 * dividida por fios verticais. Cor apenas quando há sinal (bloqueios / riscos).
 * Responde "Onde estamos?" num relance. Só tokens do DS.
 */
import { MetricStrip } from "@/components/ui";

export interface SummaryItem { label: string; value: string; alert?: boolean }

export function ExecutiveSummary({ items }: { items: SummaryItem[] }) {
  return (
    <MetricStrip items={items.map((it) => ({ label: it.label, value: it.value, tone: it.alert ? "danger" : "default" }))} />
  );
}
