/**
 * WIDGET ENGINE — API pública (via @modules/widgets).
 * Importar este arquivo registra os 10 widgets built-in.
 */
import { registerWidget } from "./registry";
import { KpiWidgetBody, InsightWidgetBody, ProgressWidgetBody, StatusWidgetBody } from "./widgets/metrics";
import {
  AlertWidgetBody, CardWidgetBody, ChartWidgetBody, ForecastWidgetBody, TableWidgetBody, TimelineWidgetBody,
} from "./widgets/content";

/* Registro dos built-in (idempotente por módulo ES) */
registerWidget("kpi", KpiWidgetBody);
registerWidget("insight", InsightWidgetBody);
registerWidget("progress", ProgressWidgetBody);
registerWidget("status", StatusWidgetBody);
registerWidget("chart", ChartWidgetBody);
registerWidget("table", TableWidgetBody);
registerWidget("forecast", ForecastWidgetBody);
registerWidget("card", CardWidgetBody);
registerWidget("timeline", TimelineWidgetBody);
registerWidget("alert", AlertWidgetBody);

export { registerWidget, Widget } from "./registry";
export { WidgetGrid } from "./widget-grid";
export { WidgetFrame } from "./widget-frame";
export { ready } from "./types";
export type {
  WidgetConfig, WidgetDataState, WidgetSpan, WidgetTone,
  KpiWidgetData, ChartWidgetData, TableWidgetData, TimelineWidgetData, AlertWidgetData,
  InsightWidgetData, ProgressWidgetData, StatusWidgetData, ForecastWidgetData, CardWidgetData,
} from "./types";
