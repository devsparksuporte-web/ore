/**
 * @modules/widgets — cards e indicadores de dados (biblioteca Strata, doc 12 §4)
 * + WIDGET ENGINE (ADR-018): todo elemento de dashboard é um Widget.
 */
export * from "./engine";

export { KpiCard } from "@/components/data/kpi-card";
export { ChartCard } from "@/components/data/chart-card";
export { EntityCard } from "@/components/data/entity-card";
export { DataTable, type Column } from "@/components/data/data-table";
export { FinancialTable } from "@/components/data/financial-table";
export { DeltaIndicator } from "@/components/data/delta-indicator";
export { Sparkline } from "@/components/data/sparkline";
export { SourceCaption } from "@/components/data/source-caption";
export { EmptyState } from "@/components/data/empty-state";
export { AlertRow } from "@/components/data/alert-row";
export { ApprovalTimeline } from "@/components/data/approval-timeline";
export { IntegrationBadge, OrderStatusBadge, PeriodBadge } from "@/components/data/status-badge";
