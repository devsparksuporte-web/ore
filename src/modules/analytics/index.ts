/**
 * @modules/analytics — camada de dataviz premium (DS §7).
 * Interface pública dos gráficos e primitivos. Consumidores nunca
 * importam recharts nem os arquivos internos diretamente.
 */
export { CashChart } from "@/components/charts/cash-chart";
export { WaterfallChart } from "@/components/charts/waterfall-chart";
export { ForecastChart } from "@/components/charts/forecast-chart";
export { ComparisonBars } from "@/components/charts/comparison-bars";
export { DeviationHeatmap } from "@/components/charts/heatmap";
export { ChartDefs, ChartLegend, PremiumTooltip, rechartsTooltip } from "@/components/charts/chart-primitives";
export { chartColors } from "@/components/charts/chart-tokens";

/* ANALYTICS ENGINE (ADR-019): dashboards como especificação JSON */
export * from "./engine";
