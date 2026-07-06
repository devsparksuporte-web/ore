/**
 * ANALYTICS ENGINE · tipos (ADR-019)
 *
 * Especificações 100% serializáveis (JSON): um dashboard é DADO, não página.
 * O engine resolve a consulta via registry de datasets e monta os widgets
 * automaticamente pelo Widget Engine (ADR-018).
 *
 * REGRA: o núcleo é genérico — datasets são registrados pelo composition
 * root da aplicação (que conhece os ports de domínio); o engine, nunca.
 */
import type { Capability } from "@/lib/session";
import type { WidgetSpan, WidgetTone } from "@modules/widgets";

/* ── Consulta (JSON) — o contrato de dados ────────────────────────── */
export interface AnalyticsQuery {
  /** Fonte lógica do dado (adaptador vigente: mocks; E5: API) */
  source: "platform" | "protheus" | "spreadsheet";
  /** Dataset registrado no engine (ex.: "cash_flow", "kpi", "oxr_matrix") */
  dataset: string;
  /** Indicador dentro do dataset (ex.: kpi: "cash" | "ebitda") */
  indicator?: string;
  /** Recorte dimensional (doc 07 §3) */
  company?: string;            // slug
  unit?: string;               // filial/UGB
  costCenter?: string;
  period?: { month?: string; from?: string; to?: string; view?: "month" | "ytd" | "ltm" };
  compareWith?: "budget" | "forecast" | "prior_year";
  /** Filtros adicionais específicos do dataset */
  filters?: Record<string, string | number | boolean>;
}

/* ── Resultado normalizado — o que resolvers devolvem ─────────────── */
export type AnalyticsResult =
  | { kind: "scalar"; label: string; value: string; reading?: string; delta?: { value: number; favorable: boolean; label?: string }; spark?: number[] }
  | { kind: "series"; series: { month: string; actual: number | null; forecast: number | null; budget: number }[]; summary?: { label: string; value: string }[] }
  | { kind: "categories"; data: { month: string; actual: number; budget: number }[] }
  | { kind: "cashflow"; data: { label: string; inflow: number; outflow: number; balance: number; projected?: boolean }[]; minimum: number }
  | { kind: "bridge"; items: { name: string; value: number; kind: "pillar" | "delta" }[] }
  | { kind: "ratio"; value: number; max: number; marker?: { at: number; label: string }; caption?: string; format?: (v: number) => string }
  | { kind: "statuses"; items: { label: string; detail?: string; state: "ok" | "warn" | "error" | "off"; meta?: string }[] }
  | { kind: "events"; items: { when: string; label: string; done?: boolean; highlight?: boolean }[] }
  | { kind: "empty"; message?: string };

export type DatasetResolver = (query: AnalyticsQuery) => AnalyticsResult;

/* ── Visualizações suportadas pelo engine ─────────────────────────── */
export type Visualization =
  | "kpi" | "insight" | "progress" | "status" | "timeline"
  | "line-forecast" | "bars-comparison" | "cash-combo" | "waterfall";

/* ── Widget analítico (JSON) ──────────────────────────────────────── */
export interface AnalyticsWidgetSpec {
  id: string;
  title?: string;
  description?: string;
  visualization: Visualization;
  query: AnalyticsQuery;
  span?: WidgetSpan;
  tone?: WidgetTone;
  requires?: Capability;
  href?: string;
  source?: string;             // legenda de origem; default derivado da query
}

/* ── Dashboard configurável (JSON) ────────────────────────────────── */
export interface DashboardSpec {
  id: string;
  title: string;
  description?: string;
  sections: { title?: string; caption?: string; widgets: AnalyticsWidgetSpec[] }[];
}
