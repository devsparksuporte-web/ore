/**
 * WIDGET ENGINE · tipos (Sprint 2.1 · ADR-018)
 *
 * Todo elemento de dashboard é um Widget: unidade declarativa com
 * configuração, tema, dados com estado, permissão, span responsivo e
 * animação — renderizada pelo WidgetFrame + registry.
 *
 * REGRA: o engine é GENÉRICO — nunca importa módulos de domínio.
 * Dashboards (páginas) constroem configs usando os ports dos domínios.
 */
import type * as React from "react";
import type { Capability } from "@/lib/session";

/* ── Dados com estado — o contrato universal de dado de widget ────── */
export type WidgetDataState<T> =
  | { status: "ready"; data: T }
  | { status: "loading" }
  | { status: "empty"; message?: string; actionLabel?: string; onAction?: () => void }
  | { status: "error"; message?: string; retry?: () => void };

export const ready = <T,>(data: T): WidgetDataState<T> => ({ status: "ready", data });

/* ── Tema do widget (tom semântico do frame) ──────────────────────── */
export type WidgetTone = "default" | "navy" | "success" | "warning" | "danger" | "info";

/* ── Span responsivo (grid de 12 colunas, mobile-first) ───────────── */
export interface WidgetSpan {
  base?: number; // <768
  md?: number;   // ≥768
  xl?: number;   // ≥1280
}

/* ── Configuração universal ───────────────────────────────────────── */
export interface WidgetConfig<T = unknown> {
  id: string;
  type: string;                    // chave no registry
  title?: string;                  // título discreto do frame (opcional)
  description?: string;
  source?: string;                 // origem do dado (SourceCaption no rodapé)
  href?: string;                   // widget inteiro clicável (drill)
  actions?: React.ReactNode;       // ações no header do frame
  tone?: WidgetTone;               // tema/ênfase semântica
  span?: WidgetSpan;               // responsividade no grid
  requires?: Capability;           // permissão (avaliada pelo Permission Engine — ADR-021)
  company?: string;                // empresa do dado — compõe a decisão de escopo
  costCenter?: string;             // escopo fino opcional
  deniedBehavior?: "mask" | "hide";// default: mask (motivo da negativa exibido)
  frameless?: boolean;             // corpo sem chrome de card (raro)
  skeleton?: "kpi" | "chart" | "list" | "table"; // variante de loading
  data: WidgetDataState<T>;
}

/* ── Payloads dos widgets built-in ────────────────────────────────── */
export interface KpiWidgetData {
  label: string;
  value: string;
  reading?: string;                       // leitura narrativa (1 linha)
  delta?: { value: number; favorable: boolean; label?: string };
  spark?: number[];
  badge?: string;
}

export interface ChartWidgetData {
  chart: React.ReactNode;                 // gráfico de @modules/analytics
}

export interface TableWidgetData<Row extends { id: string } = { id: string }> {
  columns: { key: string; header: string; align?: "left" | "right" | "center"; render: (r: Row) => React.ReactNode }[];
  rows: Row[];
  onRowClick?: (r: Row) => void;
  exportable?: boolean;
}

export interface TimelineWidgetData {
  items: { when: string; label: string; done?: boolean; highlight?: boolean }[];
}

export interface AlertWidgetData {
  alerts: {
    id: string;
    severity: "critical" | "warning" | "info";
    title: string;
    meta?: string;
    action?: { label: string; href: string };
  }[];
}

export interface InsightWidgetData {
  text: string;
  emphasis?: string;                      // trecho destacado
  tone?: WidgetTone;
}

export interface ProgressWidgetData {
  label?: string;
  value: number;
  max: number;
  format?: (v: number) => string;
  marker?: { at: number; label: string }; // ex.: "onde o plano esperava"
  caption?: string;
}

export interface StatusWidgetData {
  items: { label: string; detail?: string; state: "ok" | "warn" | "error" | "off"; meta?: string }[];
}

export interface ForecastWidgetData {
  series: { month: string; actual: number | null; forecast: number | null; budget: number }[];
  summary?: { label: string; value: string }[];
}

export interface CardWidgetData {
  children: React.ReactNode;              // escape hatch p/ composição de domínio
}
