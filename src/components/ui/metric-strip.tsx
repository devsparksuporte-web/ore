"use client";

/**
 * MetricStrip · Strata — faixa de indicadores de topo (composição editorial).
 * Números grandes em peso REGULAR (não negrito) com rótulo discreto abaixo,
 * separados por fios verticais — leitura de relatório. Sem caixas: o dado
 * assenta na página. Cor apenas quando há sinal.
 *
 * Agnóstico de domínio: qualquer módulo com 2 a 6 números de topo.
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
    <section className={cn("grid grid-cols-2 gap-y-6 border-y py-6", cols[n], className)}>
      {items.map((it, i) => (
        <div
          key={it.label}
          className={cn("px-6 first:pl-0", i > 0 && "border-l", i % 2 === 0 && "max-sm:border-l-0 max-sm:pl-0")}
        >
          <p
            className={cn(
              "font-display text-[30px] font-normal leading-none tracking-[-0.02em] tnum",
              toneCls[it.tone ?? "default"]
            )}
          >
            {it.value}
          </p>
          <p className="mt-2.5 text-caption text-gray-500">{it.label}</p>
          {it.hint && <p className="mt-0.5 text-caption tnum text-gray-400">{it.hint}</p>}
        </div>
      ))}
    </section>
  );
}
