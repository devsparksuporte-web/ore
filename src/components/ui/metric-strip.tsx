"use client";

/**
 * MetricStrip · Strata — componente reutilizável (Sprint 1.2).
 * Faixa leve de KPIs de topo (sem caixas individuais), dividida por fios.
 * Cor apenas quando há sinal. Agnóstico de domínio — qualquer módulo que
 * precise de um resumo executivo de 2 a 6 números. Responsivo (2 col → N col).
 *
 * Generaliza o padrão nascido em Estratégia & Execução (executive-summary),
 * sem alterar aquele módulo; futuros módulos e o próprio E&E podem adotá-lo.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type MetricTone = "default" | "danger" | "warning" | "success";

export interface MetricItem {
  label: string;
  value: string;
  tone?: MetricTone;
  /** Leitura de apoio de uma linha (ex.: "vs. aporte 2,3x"). */
  hint?: string;
}

const toneCls: Record<MetricTone, string> = {
  default: "text-navy-900",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

const cols: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

export function MetricStrip({ items, className }: { items: MetricItem[]; className?: string }) {
  const n = Math.min(6, Math.max(2, items.length));
  return (
    <section className={cn("grid grid-cols-2 gap-y-5 border-y py-5 sm:gap-y-0 sm:divide-x", cols[n], className)}>
      {items.map((it, i) => (
        <div key={it.label} className={cn("px-6 first:pl-0", i % 2 === 1 && "border-l sm:border-l-0")}>
          <p className={cn("font-display text-[26px] font-semibold leading-none tnum tracking-kpi", toneCls[it.tone ?? "default"])}>
            {it.value}
          </p>
          <p className="mt-2 text-body-sm text-gray-500">{it.label}</p>
          {it.hint && <p className="mt-0.5 text-caption tnum text-gray-500">{it.hint}</p>}
        </div>
      ))}
    </section>
  );
}
