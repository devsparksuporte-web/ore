"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animationProps, axisProps, chartColors, cursorBand, gridProps, strokeWidths } from "./chart-tokens";
import { ChartLegend, rechartsTooltip } from "./chart-primitives";

const fmt = (v: number) => `R$ ${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;

/**
 * Barras real × orçado · v2 premium: realizado sólido navy, orçado como
 * contorno fino (fantasma) — o padrão visual "plano vs executado" da
 * leitura executiva. Cursor de banda discreto no hover.
 */
export function ComparisonBars({
  data,
  height = 220,
}: {
  data: { month: string; actual: number; budget: number }[];
  height?: number;
}) {
  const tooltip = rechartsTooltip((label, payload) => {
    const p = payload[0]?.payload as (typeof data)[number] | undefined;
    if (!p) return null;
    const dev = p.budget !== 0 ? ((p.actual - p.budget) / p.budget) * 100 : 0;
    return {
      label: String(label),
      rows: [
        { name: "Realizado", value: fmt(p.actual), color: chartColors.actual },
        { name: "Orçado", value: fmt(p.budget), color: chartColors.budget, dashed: true, muted: true },
        {
          name: "Δ vs orçado",
          value: `${dev >= 0 ? "+" : ""}${dev.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
          color: dev >= 0 ? chartColors.positive : chartColors.negative,
        },
      ],
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={3}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={38} />
          <Tooltip content={tooltip} cursor={cursorBand} />
          <Bar dataKey="actual" fill={chartColors.actual} radius={[3, 3, 0, 0]} barSize={14} {...animationProps} />
          <Bar
            dataKey="budget" fill="transparent" stroke={chartColors.budget} strokeWidth={strokeWidths.secondary}
            strokeDasharray="3 2" radius={[3, 3, 0, 0]} barSize={14} {...animationProps}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          { label: "Realizado", color: chartColors.actual, style: "solid" },
          { label: "Orçado", color: chartColors.budget, style: "dashed" },
        ]}
      />
    </div>
  );
}
