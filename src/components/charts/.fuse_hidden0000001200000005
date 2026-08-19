"use client";

import {
  Area, Bar, Brush, ComposedChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { animationProps, axisProps, chartColors, cursorLine, gridProps, gradientIds, strokeWidths } from "./chart-tokens";
import { ChartDefs, ChartLegend, rechartsTooltip } from "./chart-primitives";
import type { CashPoint } from "@/types/domain";

const fmt = (v: number) => `R$ ${Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;

/**
 * Gráfico âncora do caixa · v2 premium (leitura TradingView/Bloomberg):
 * área com gradiente discreto sob o saldo realizado, projeção pontilhada,
 * barras E/S recuadas ao papel de contexto, linha "hoje" e caixa mínimo
 * como referências sóbrias. `zoomable` habilita Brush (zoom preparado).
 */
export function CashChart({
  data,
  minimum,
  zoomable = false,
}: {
  data: CashPoint[];
  minimum: number;
  zoomable?: boolean;
}) {
  const todayIndex = data.findIndex((d) => d.projected);
  const enriched = data.map((d, i) => ({
    ...d,
    balanceActual: d.projected ? null : d.balance,
    balanceProjected: i >= todayIndex - 1 ? d.balance : null,
    outflowNeg: -d.outflow,
  }));

  const tooltip = rechartsTooltip((label, payload) => {
    const p = payload[0]?.payload as (typeof enriched)[number] | undefined;
    if (!p) return null;
    return {
      label: `Semana ${String(label).replace("S", "")}${p.projected ? " · projetado" : ""}`,
      rows: [
        { name: "Saldo", value: fmt(p.balance), color: p.projected ? chartColors.forecast : chartColors.actual, dashed: p.projected },
        { name: "Entradas", value: fmt(p.inflow), color: chartColors.inflow, muted: true },
        { name: "Saídas", value: `(${fmt(p.outflow)})`, color: chartColors.outflow, muted: true },
      ],
      footer: p.projected ? "títulos em aberto + premissas v3" : "realizado · Protheus",
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={zoomable ? 320 : 280}>
        <ComposedChart data={enriched} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <ChartDefs />
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v: number) => `${v}`} width={40} />
          <Tooltip content={tooltip} cursor={cursorLine} />

          {/* Contexto: entradas/saídas — finas, sem competir com o saldo */}
          <Bar dataKey="inflow" fill={chartColors.inflow} fillOpacity={0.5} radius={[2, 2, 0, 0]} barSize={8} {...animationProps} />
          <Bar dataKey="outflowNeg" fill={chartColors.outflow} fillOpacity={0.7} radius={[0, 0, 2, 2]} barSize={8} {...animationProps} />

          {/* Protagonista: saldo — área gradiente + linha suave */}
          <Area
            dataKey="balanceActual"
            stroke="none"
            fill={`url(#${gradientIds.navy})`}
            type="monotone"
            connectNulls={false}
            {...animationProps}
          />
          <Line
            dataKey="balanceActual"
            stroke={chartColors.actual}
            strokeWidth={strokeWidths.primary}
            type="monotone"
            dot={false}
            activeDot={{ r: 3, strokeWidth: strokeWidths.primary, stroke: "var(--bg-surface)" }}
            connectNulls={false}
            {...animationProps}
          />
          <Line
            dataKey="balanceProjected"
            stroke={chartColors.forecast}
            strokeWidth={strokeWidths.context}
            strokeDasharray="4 5"
            type="monotone"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: strokeWidths.primary, stroke: "#fff" }}
            connectNulls={false}
            {...animationProps}
          />

          {/* Referências sóbrias */}
          {todayIndex > 0 && (
            <ReferenceLine
              x={data[todayIndex - 1].label}
              stroke={chartColors.axis}
              strokeDasharray="2 4"
              label={{ value: "hoje", fontSize: 10, fill: chartColors.axis, position: "top" }}
            />
          )}
          <ReferenceLine
            y={minimum}
            stroke={chartColors.target}
            strokeWidth={strokeWidths.secondary}
            strokeDasharray="6 4"
            label={{ value: `mínimo R$ ${minimum} mi`, fontSize: 10, fill: chartColors.target, position: "insideBottomRight" }}
          />

          {zoomable && (
            <Brush dataKey="label" height={24} travellerWidth={8} stroke={chartColors.axis} fill="var(--bg-sunken)" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          { label: "Saldo realizado", color: chartColors.actual, style: "area" },
          { label: "Saldo projetado", color: chartColors.forecast, style: "dotted" },
          { label: "Entradas / Saídas", color: chartColors.outflow, style: "solid" },
          { label: "Caixa mínimo", color: chartColors.target, style: "dashed" },
        ]}
      />
    </div>
  );
}
