/**
 * STRATA DATAVIZ TOKENS · v2 (refatoração premium)
 *
 * Convenções fixas de cenário (DS §7.1) — iguais em toda a plataforma.
 * Este arquivo é o ESPELHO TypeScript dos tokens de dataviz (Recharts/SVG
 * exigem literais em runtime). Fonte da verdade: globals.css — alterações
 * nos DOIS lugares no mesmo PR (regra de sincronização + DoD 3.8).
 * Cores de cenário NÃO são personalizáveis por tenant (ADR-015).
 *
 * Direção visual: Bloomberg/Palantir (seriedade), Stripe/Vercel (limpeza),
 * TradingView (leitura de série temporal). Gradientes discretos (≤10% de
 * opacidade no topo → 0), linhas suaves, zero ruído.
 */
export const chartColors = {
  actual: "var(--chart-actual)",     // realizado: navy sólido (dark-adaptativo)
  budget: "var(--chart-budget)",     // orçado: cinza-azulado tracejado
  forecast: "var(--chart-forecast)", // forecast: azul pontilhado
  priorYear: "var(--chart-prior)",
  target: "var(--chart-target)",     // meta/limiar: linha cobre
  positive: "var(--chart-positive)",
  negative: "var(--chart-negative)",
  inflow: "var(--chart-inflow)",
  outflow: "var(--chart-outflow)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  categorical: ["#0D2240", "#1E5EEA", "#C0703A", "#5B8DB8", "#7C6FA8", "#4A9182", "#B08D2F", "#8A97A8"],
} as const;

/** Eixos editoriais: sem linha, ticks 10px caps-friendly, respiro maior. */
export const axisProps = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fontSize: 10, fill: chartColors.axis, fontFamily: "inherit", letterSpacing: "0.02em" },
  tickMargin: 10,
};

/** Grid editorial: fio único horizontal, quase invisível — a tinta é do dado. */
export const gridProps = {
  vertical: false as const,
  stroke: chartColors.grid,
  strokeDasharray: "0",
  strokeOpacity: 0.9,
};

/** Espessuras padronizadas (editorial: finas, precisas). */
export const strokeWidths = { primary: 2, context: 1.75, secondary: 1.25, reference: 1 } as const;

/** Revelação do dado: um pouco mais lenta que a UI (500ms), uma única vez. */
export const animationProps = {
  isAnimationActive: true,
  animationDuration: 500,
  animationEasing: "ease-out" as const,
};

/** Cursor de hover discreto (sem retângulo cinza padrão do Recharts). */
export const cursorLine = { stroke: "var(--chart-axis)", strokeWidth: 1, strokeDasharray: "3 4", strokeOpacity: 0.55 };
export const cursorBand = { fill: "var(--chart-actual)", fillOpacity: 0.05 };

/** IDs dos gradientes compartilhados (definidos em <ChartDefs/>). */
export const gradientIds = {
  navy: "strata-grad-navy",
  blue: "strata-grad-blue",
  copper: "strata-grad-copper",
} as const;
