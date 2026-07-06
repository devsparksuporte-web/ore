"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Heatmap de desvios OxR (DS §5): escala divergente com zero neutro —
 * vermelho = desfavorável, verde = favorável. CSS grid puro.
 */
export function DeviationHeatmap({
  rows,
  months,
}: {
  rows: { label: string; values: number[] }[];
  months: string[];
}) {
  // v2 premium: intensidade mais contida (máx. 55%), zero neutro quase
  // invisível — o olho executivo vai direto ao que importa.
  const color = (v: number) => {
    const intensity = Math.min(Math.abs(v) / 25, 1);
    if (Math.abs(v) < 1) return "rgba(243,244,246,0.6)";
    return v > 0
      ? `rgba(201, 59, 59, ${0.10 + intensity * 0.45})`
      : `rgba(24, 128, 73, ${0.10 + intensity * 0.45})`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid gap-px" style={{ gridTemplateColumns: `180px repeat(${months.length}, 1fr)` }}>
          <div />
          {months.map((m) => (
            <div key={m} className="pb-1 text-center text-caption uppercase text-muted-foreground">{m}</div>
          ))}
          {rows.map((row) => (
            <Fragment key={row.label}>
              <div className="flex items-center pr-3 text-body-sm text-gray-700">{row.label}</div>
              {row.values.map((v, i) => (
                <div
                  key={`${row.label}-${i}`}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-sm text-caption font-medium tnum",
                    "transition-shadow duration-fast hover:ring-1 hover:ring-inset hover:ring-navy-700/30"
                  )}
                  style={{ backgroundColor: color(v) }}
                  title={`${row.label} · ${months[i]}: ${v > 0 ? "+" : ""}${v.toLocaleString("pt-BR")}%`}
                >
                  {Math.abs(v) >= 1 ? `${v > 0 ? "+" : ""}${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "–"}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
