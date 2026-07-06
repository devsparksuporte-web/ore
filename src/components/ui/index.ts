/**
 * BIBLIOTECA ENTERPRISE · Strata (Sprint 04)
 * Ponto único de importação da UI: `import { … } from "@/components/ui"`.
 * Todos os componentes consomem exclusivamente tokens do Design System
 * (globals.css + tailwind.config + @/design-system). Inventário documentado
 * em docs/12-component-library.md.
 */

/* Primitivos (shadcn/Radix tematizados Strata) */
export * from "./button";
export * from "./badge";
export * from "./card";
export * from "./input";
export * from "./select";
export * from "./tabs";
export * from "./tooltip";
export * from "./dropdown-menu";
export * from "./table";
export * from "./skeleton";
export * from "./dialog";
export * from "./sheet";

/* Nomes canônicos enterprise */
export * from "./modal";   // Modal* (alias Dialog)
export * from "./drawer";  // Drawer* (alias Sheet)
export { notify } from "./toast";

/* Cards executivos e leitura de dados */
export * from "./executive-card";
export * from "./insight-card";
export { KpiCard as MetricCard } from "@/components/data/kpi-card";
export { ChartCard } from "@/components/data/chart-card";
export { DataTable, type Column } from "@/components/data/data-table";

/* Estados e composição */
export { EmptyState } from "@/components/data/empty-state";
export * from "./loading-state";
export * from "./status-badge";
export * from "./section-header";
export * from "./quick-actions";
export * from "./user-menu";
