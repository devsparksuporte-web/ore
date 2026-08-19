"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animationProps, axisProps, chartColors, cursorLine, gridProps, gradientIds, strokeWidths } from "./chart-tokens";
import { ChartDefs, ChartLegend, rechartsTooltip } from "./chart-primitives";

const fmt = (v: number | null) =>
  v == null ? "—" : `R$ ${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;

/**
 * Linha tripla · v2 premium: realizado (área gradiente + navy sólido) ×
 * forecast (azul pontilhado) × orçado (cinza tracejado fino).
 * Convenções fixas de cenário — não personalizáveis (ADR-015).
 */
export function ForecastChart({
  data,
  height = 220,
}: {
  data: { month: string; actual: number | null; forecast: number | null; budget: number }[];
  height?: number;
}) {
  const tooltip = rechartsTooltip((label, payload) => {
    const p = payload[0]?.payload as (typeof data)[number] | undefined;
    if (!p) return null;
    return {
      label: String(label),
      rows: [
        ...(p.actual != null ? [{ name: "Realizado", value: fmt(p.actual), color: chartColors.actual }] : []),
        ...(p.forecast != null ? [{ name: "Forecast", value: fmt(p.forecast), color: chartColors.forecast, dashed: true }] : []),
        { name: "Orçado", value: fmt(p.budget), color: chartColors.budget, dashed: true, muted: true },
      ],
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <ChartDefs />
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={38} />
          <Tooltip content={tooltip} cursor={cursorLine} />
          <Area dataKey="actual" stroke="none" fill={`url(#${gradientIds.navy})`} type="monotone" connectNulls={false} {...animationProps} />
          <Line dataKey="budget" stroke={chartColors.budget} strokeWidth={strokeWidths.secondary} strokeDasharray="6 4" type="monotone" dot={false} {...animationProps} />
          <Line
            dataKey="actual" stroke={chartColors.actual} strokeWidth={strokeWidths.primary} type="monotone" dot={false}
            activeDot={{ r: 3, strokeWidth: strokeWidths.primary, stroke: "var(--bg-surface)" }} connectNulls={false} {...animationProps}
          />
          <Line
            dataKey="forecast" stroke={chartColors.forecast} strokeWidth={strokeWidths.context} strokeDasharray="3 5" type="monotone" dot={false}
            activeDot={{ r: 3, strokeWidth: strokeWidths.primary, stroke: "var(--bg-surface)" }} connectNulls={false} {...animationProps}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          { label: "Realizado", color: chartColors.actual, style: "area" },
          { label: "Forecast", color: chartColors.forecast, style: "dotted" },
          { label: "Orçado", color: chartColors.budget, style: "dashed" },
        ]}
      />
    </div>
  );
}
