/**
 * COMPOSITION ROOT dos datasets do Analytics Engine.
 *
 * Único lugar (além de páginas) autorizado a conhecer múltiplos domínios:
 * registra resolvers que traduzem consultas JSON → ports dos domínios.
 * Na E5, estes resolvers trocam o port mock pela API — as specs JSON
 * dos dashboards NÃO mudam.
 *
 * Nota honesta do adaptador mock: filtros dimensionais (unit/costCenter)
 * são aceitos pelo contrato e aplicados onde o dado mock permite; a
 * aplicação plena ocorre no adaptador de API (dados reais dimensionados).
 */
import { registerDataset, type AnalyticsResult } from "@modules/analytics";
import {
  getBankAccounts, getCashFlow, getCashMinimum, getExecutiveKpis, getForecastSeries, getOxrWaterfall,
} from "@modules/financials";
import { getMilestones, listAlerts } from "@modules/governance";
import { listConnections } from "@modules/settings";

/* kpi — indicador escalar por chave (cash, revenue, ebitda, costs…) */
registerDataset("kpi", (q): AnalyticsResult => {
  const kpi = getExecutiveKpis().find((k) => k.key === (q.indicator ?? "cash"));
  if (!kpi) return { kind: "empty", message: `Indicador "${q.indicator}" não encontrado` };
  return {
    kind: "scalar",
    label: kpi.label,
    value: kpi.value,
    reading: kpi.subMetric,
    delta: kpi.delta ? { value: kpi.delta.value, favorable: kpi.delta.favorable, label: kpi.delta.label } : undefined,
    spark: kpi.spark,
  };
});

/* cash_flow — série E/S + saldo com caixa mínimo */
registerDataset("cash_flow", (): AnalyticsResult => ({
  kind: "cashflow",
  data: getCashFlow(),
  minimum: getCashMinimum(),
}));

/* ebitda_forecast — trajetória tripla do ano */
registerDataset("ebitda_forecast", (): AnalyticsResult => ({
  kind: "series",
  series: getForecastSeries(),
  summary: [
    { label: "Projetado ano", value: "R$ 61,2 mi" },
    { label: "vs orçado", value: "−4,8%" },
  ],
}));

/* oxr_bridge — ponte orçado→realizado */
registerDataset("oxr_bridge", (): AnalyticsResult => ({
  kind: "bridge",
  items: getOxrWaterfall(),
}));

/* bank_position — participação por conta bancária como statuses */
registerDataset("bank_position", (): AnalyticsResult => ({
  kind: "statuses",
  items: getBankAccounts().map((b) => ({
    label: b.bank,
    detail: `${b.pct}% do caixa`,
    state: "ok" as const,
    meta: `R$ ${(b.balance / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`,
  })),
}));

/* integrations_health — saúde das conexões */
registerDataset("integrations_health", (q): AnalyticsResult => ({
  kind: "statuses",
  items: listConnections()
    .filter((c) => !q.company || c.companyName.toLowerCase().includes(q.company.replace("-", " ").split(" ")[0]))
    .map((c) => ({
      label: c.connector,
      detail: c.companyName,
      state: c.status === "healthy" ? "ok" : c.status === "error" ? "error" : c.status === "configuring" ? "warn" : "off",
      meta: c.lastSync ?? "—",
    })),
}));

/* milestones — marcos do calendário */
registerDataset("milestones", (): AnalyticsResult => ({
  kind: "events",
  items: getMilestones().map((m) => ({ when: m.date, label: m.label, done: !m.upcoming, highlight: m.kind === "board" })),
}));

/* alerts_summary — contagem de alertas como escalar */
registerDataset("alerts_summary", (): AnalyticsResult => {
  const critical = listAlerts().filter((a) => a.severity === "critical").length;
  return {
    kind: "scalar",
    label: "Alertas críticos",
    value: String(critical),
    reading: critical > 0 ? "exigem ação imediata" : "nenhum risco crítico",
  };
});

/* capex_execution — execução vs plano */
registerDataset("capex_execution", (): AnalyticsResult => ({
  kind: "ratio",
  value: 14.1,
  max: 32.0,
  marker: { at: 19.8, label: "onde o plano esperava (62%)" },
  caption: "44% executado · ritmo abaixo do planejado",
  format: (v) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`,
}));
