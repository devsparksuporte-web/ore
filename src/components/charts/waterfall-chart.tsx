"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animationProps, axisProps, chartColors, cursorBand, gridProps } from "./chart-tokens";
import { ChartLegend, rechartsTooltip } from "./chart-primitives";

interface WaterfallItem {
  name: string;
  value: number;
  kind: "pillar" | "delta";
}

const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;

/**
 * Waterfall · v2 premium — a assinatura do financeiro (DS §7.3):
 * pilares navy, efeitos verde/vermelho suavizados (90%), valores sempre
 * visíveis, tooltip explicando o efeito. Sem conectores ruidosos.
 */
export function WaterfallChart({ data, height = 240 }: { data: WaterfallItem[]; height?: number }) {
  let running = 0;
  const bars = data.map((d) => {
    if (d.kind === "pillar") {
      running = d.value;
      return { ...d, base: 0, size: d.value };
    }
    const base = d.value >= 0 ? running : running + d.value;
    running += d.value;
    return { ...d, base, size: Math.abs(d.value) };
  });

  const tooltip = rechartsTooltip((_label, payload) => {
    const p = payload.find((x) => x.dataKey === "size")?.payload as (typeof bars)[number] | undefined;
    if (!p) return null;
    return {
      label: p.name,
      rows: [
        p.kind === "pillar"
          ? { name: "Total", value: fmt(p.value), color: chartColors.actual }
          : {
              name: p.value >= 0 ? "Efeito favorável" : "Efeito desfavorável",
              value: p.value >= 0 ? `+${fmt(p.value)}` : `(${fmt(p.value)})`,
              color: p.value >= 0 ? chartColors.positive : chartColors.negative,
            },
      ],
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={bars} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} interval={0} tick={{ ...axisProps.tick, fontSize: 10 }} />
          <YAxis {...axisProps} width={38} />
          <Tooltip content={tooltip} cursor={cursorBand} />
          <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="size" stackId="wf" radius={[3, 3, 0, 0]} {...animationProps}>
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
              style={{ fontSize: 10, fill: chartColors.axis, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}
            />
            {bars.map((b, i) => (
              <Cell
                key={i}
                fill={b.kind === "pillar" ? chartColors.actual : b.value >= 0 ? chartColors.positive : chartColors.negative}
                fillOpacity={b.kind === "pillar" ? 1 : 0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          { label: "Totais", color: chartColors.actual, style: "solid" },
          { label: "Efeito favorável", color: chartColors.positive, style: "solid" },
          { label: "Efeito desfavorável", color: chartColors.negative, style: "solid" },
        ]}
      />
    </div>
  );
}
