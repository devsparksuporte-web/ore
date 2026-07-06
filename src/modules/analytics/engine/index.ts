/** ANALYTICS ENGINE — API pública (via @modules/analytics). */
export { registerDataset, resolveQuery, listDatasets } from "./registry";
export { buildWidget } from "./builders";
export { ConfigurableDashboard } from "./dashboard";
export type {
  AnalyticsQuery, AnalyticsResult, AnalyticsWidgetSpec, DashboardSpec, DatasetResolver, Visualization,
} from "./types";
