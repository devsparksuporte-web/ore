"use client";

/**
 * Cash burn mensal — contexto do runway (a tendência de consumo), não um
 * gráfico de BI: sem grade, sem eixo de valor, barras finas e discretas; o
 * número vive nos stats acima. Responde "o consumo está acelerando?".
 */
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { animationProps, axisProps, chartColors, cursorBand, gradientIds } from "@/components/charts/chart-tokens";
import { ChartDefs, rechartsTooltip } from "@/components/charts/chart-primitives";
import { formatMoney } from "@/lib/format";
import type { BurnPoint } from "@modules/performance";

export function BurnChart({ data }: { data: BurnPoint[] }) {
  const tooltip = rechartsTooltip((label, payload) => {
    const p = payload[0]?.payload as BurnPoint | undefined;
    if (!p) return null;
    return {
      label: String(label),
      rows: [{ name: "Burn no mês", value: formatMoney(p.value, { compact: true }), color: chartColors.actual }],
    };
  });

  return (
    <ResponsiveContainer width="100%" height={132}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <ChartDefs />
        <XAxis dataKey="label" {...axisProps} interval={1} />
        <Tooltip content={tooltip} cursor={cursorBand} />
        <Bar dataKey="value" fill={`url(#${gradientIds.barMuted})`} radius={[3, 3, 0, 0]} barSize={10} {...animationProps} />
      </BarChart>
    </ResponsiveContainer>
  );
}
