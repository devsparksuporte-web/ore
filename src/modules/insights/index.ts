/**
 * @modules/insights — INSIGHT ENGINE (ADR-020).
 * Indicadores → linguagem executiva. Análise independente de layout;
 * dashboards apenas exibem (helper insightsToWidgets → Widget Engine).
 */
import type { WidgetConfig, InsightWidgetData, WidgetTone } from "@modules/widgets";
import { ready } from "@modules/widgets";
import type { Insight, InsightTone } from "./types";

export { RuleBasedInsightProvider, createAiInsightProvider, generateInsights } from "./engine";
export { defaultRules } from "./rules";
export { BriefingWidgetBody, type BriefingWidgetData } from "./components/briefing"; // registra o widget "briefing"
export type { Insight, InsightCategory, InsightContext, InsightProvider, InsightRule, InsightTone } from "./types";

const toneMap: Record<InsightTone, WidgetTone> = {
  positive: "success",
  neutral: "default",
  attention: "warning",
  critical: "danger",
};

/** Ponte análise → exibição: cada Insight vira um insight widget. */
export function insightsToWidgets(
  insights: Insight[],
  opts?: { span?: { base?: number; md?: number; xl?: number }; limit?: number }
): WidgetConfig<InsightWidgetData>[] {
  return insights.slice(0, opts?.limit ?? insights.length).map((i) => ({
    id: `insight-${i.id}`,
    type: "insight",
    frameless: false,
    tone: toneMap[i.tone],
    span: opts?.span ?? { base: 12, md: 6, xl: 6 },
    href: i.href,
    source: i.evidence ? `análise · ${i.evidence}` : "análise automática (regras v1)",
    data: ready<InsightWidgetData>({ emphasis: i.emphasis, text: i.text, tone: toneMap[i.tone] }),
  }));
}
