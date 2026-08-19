"use client";

/**
 * SeriesChart · Strata — gráfico genérico de uma ou duas séries.
 *
 * Por que existe: o `ComparisonBars` do DS é específico de "realizado ×
 * orçado" — rotula as duas séries com esses nomes e formata tudo em R$. Usá-lo
 * para a evolução do valor justo fazia a tela afirmar um ORÇAMENTO que não
 * existe na fonte, e reexpressar dólares como reais. Numa plataforma de Data
 * Truth isso não é detalhe visual: é o gráfico mentindo sobre o que mostra.
 *
 * Este componente não sabe o que a série significa. Recebe rótulos, unidade e
 * pontos, e desenha. Mesmos tokens do DS — nenhuma cor nova.
 */
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animationProps, axisProps, chartColors, cursorBand, gridProps, strokeWidths } from "./chart-tokens";
import { rechartsTooltip } from "./chart-primitives";

export interface PontoSerie {
  rotulo: string;
  a: number;
  b?: number;
}

export function SeriesChart({
  pontos, forma, legendaA, legendaB, unidade, height = 220,
}: {
  pontos: PontoSerie[];
  forma: "barras" | "linha";
  legendaA: string;
  legendaB?: string;
  /** Sufixo do valor no eixo e no tooltip (ex.: "US$ mil", "BRL mm", "kt", "%"). */
  unidade: string;
  height?: number;
}) {
  const temB = pontos.some((p) => p.b !== undefined);

  const fmt = (v: number) =>
    `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${unidade}`;

  const tooltip = rechartsTooltip((label, payload) => {
    const p = payload[0]?.payload as PontoSerie | undefined;
    if (!p) return null;
    return {
      label: String(label),
      rows: [
        { name: legendaA, value: fmt(p.a), color: chartColors.actual },
        ...(temB && p.b !== undefined && legendaB
          ? [{ name: legendaB, value: fmt(p.b), color: chartColors.budget, dashed: true, muted: true }]
          : []),
      ],
    };
  });

  const eixoY = { ...axisProps, width: 52 };

  if (forma === "linha") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="rotulo" {...axisProps} />
          <YAxis {...eixoY} />
          <Tooltip content={tooltip} cursor={cursorBand} />
          <Line type="monotone" dataKey="a" stroke={chartColors.actual} strokeWidth={strokeWidths.primary} dot={{ r: 2.5 }} {...animationProps} />
          {temB && (
            <Line type="monotone" dataKey="b" stroke={chartColors.budget} strokeWidth={strokeWidths.secondary} strokeDasharray="4 4" dot={false} {...animationProps} />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="rotulo" {...axisProps} />
        <YAxis {...eixoY} />
        <Tooltip content={tooltip} cursor={cursorBand} />
        <Bar dataKey="a" fill={chartColors.actual} radius={[2, 2, 0, 0]} maxBarSize={38} {...animationProps} />
        {temB && (
          <Bar dataKey="b" fill="transparent" stroke={chartColors.budget} strokeDasharray="3 3" strokeWidth={1.25} radius={[2, 2, 0, 0]} maxBarSize={38} {...animationProps} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
