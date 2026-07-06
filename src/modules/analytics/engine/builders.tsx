"use client";

/**
 * Builders do Analytics Engine: (spec + resultado normalizado) → WidgetConfig.
 * Cada visualização sabe transformar um AnalyticsResult compatível no
 * payload do widget correspondente. Incompatibilidade → estado de erro
 * do próprio widget (nunca quebra o dashboard).
 */
import type { WidgetConfig } from "@modules/widgets";
import { ready } from "@modules/widgets";
import { CashChart } from "@/components/charts/cash-chart";
import { ComparisonBars } from "@/components/charts/comparison-bars";
import { WaterfallChart } from "@/components/charts/waterfall-chart";
import type { AnalyticsResult, AnalyticsWidgetSpec } from "./types";
import { resolveQuery } from "./registry";

function defaultSource(spec: AnalyticsWidgetSpec): string {
  const q = spec.query;
  const src = q.source === "protheus" ? "Protheus" : q.source === "spreadsheet" ? "Planilha" : "Plataforma";
  const dims = [q.company, q.unit, q.costCenter, q.period?.month ?? q.period?.view].filter(Boolean).join(" · ");
  return spec.source ?? `${src}${dims ? ` · ${dims}` : ""}`;
}

function mismatch(spec: AnalyticsWidgetSpec, expected: string, got: AnalyticsResult): WidgetConfig<never> {
  return {
    id: spec.id,
    type: "kpi",
    title: spec.title,
    span: spec.span,
    data: {
      status: "error",
      message:
        got.kind === "empty"
          ? got.message ?? "Sem dados para a consulta"
          : `Visualização "${spec.visualization}" espera resultado "${expected}" (dataset devolveu "${got.kind}")`,
    },
  } as WidgetConfig<never>;
}

/** Transforma um AnalyticsWidgetSpec (JSON) em WidgetConfig renderizável. */
export function buildWidget(spec: AnalyticsWidgetSpec): WidgetConfig<any> {
  const result = resolveQuery(spec.query);
  const base = {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    span: spec.span,
    tone: spec.tone,
    requires: spec.requires,
    /* Escopo automático (ADR-021): a empresa/CC da consulta compõem a
       decisão de acesso do widget — sem verificação manual nas telas. */
    company: spec.query.company,
    costCenter: spec.query.costCenter,
    href: spec.href,
    source: defaultSource(spec),
  };

  switch (spec.visualization) {
    case "kpi": {
      if (result.kind !== "scalar") return mismatch(spec, "scalar", result);
      const { kind: _k, ...payload } = result;
      return { ...base, type: "kpi", data: ready(payload) };
    }
    case "insight": {
      if (result.kind !== "scalar") return mismatch(spec, "scalar", result);
      return {
        ...base,
        type: "insight",
        data: ready({ emphasis: result.value, text: result.reading ?? result.label, tone: spec.tone }),
      };
    }
    case "progress": {
      if (result.kind !== "ratio") return mismatch(spec, "ratio", result);
      const { kind: _k, ...payload } = result;
      return { ...base, type: "progress", data: ready(payload) };
    }
    case "status": {
      if (result.kind !== "statuses") return mismatch(spec, "statuses", result);
      return { ...base, type: "status", data: ready({ items: result.items }) };
    }
    case "timeline": {
      if (result.kind !== "events") return mismatch(spec, "events", result);
      return { ...base, type: "timeline", data: ready({ items: result.items }) };
    }
    case "line-forecast": {
      if (result.kind !== "series") return mismatch(spec, "series", result);
      return {
        ...base,
        type: "forecast",
        skeleton: "chart" as const,
        data: ready({ series: result.series, summary: result.summary }),
      };
    }
    case "bars-comparison": {
      if (result.kind !== "categories") return mismatch(spec, "categories", result);
      return {
        ...base,
        type: "chart",
        skeleton: "chart" as const,
        data: ready({ chart: <ComparisonBars data={result.data} /> }),
      };
    }
    case "cash-combo": {
      if (result.kind !== "cashflow") return mismatch(spec, "cashflow", result);
      return {
        ...base,
        type: "chart",
        skeleton: "chart" as const,
        data: ready({ chart: <CashChart data={result.data} minimum={result.minimum} /> }),
      };
    }
    case "waterfall": {
      if (result.kind !== "bridge") return mismatch(spec, "bridge", result);
      return {
        ...base,
        type: "chart",
        skeleton: "chart" as const,
        data: ready({ chart: <WaterfallChart data={result.items} /> }),
      };
    }
  }
}
