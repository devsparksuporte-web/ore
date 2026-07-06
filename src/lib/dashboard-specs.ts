/**
 * Store de DashboardSpecs (JSON) — adaptador mock.
 * F4: estas especificações vivem no banco por tenant (`dashboard_specs`),
 * editáveis sem deploy — o fundamento dos dashboards white label.
 */
import type { DashboardSpec } from "@modules/analytics";

const specs: DashboardSpec[] = [
  {
    id: "visao-financeira-ativa",
    title: "Visão Financeira — Ativa",
    description: "Dashboard 100% configurável (Analytics Engine) — montado a partir de JSON, sem página fixa",
    sections: [
      {
        title: "Síntese",
        widgets: [
          {
            id: "vf-cash", visualization: "kpi", span: { base: 12, md: 6, xl: 3 },
            href: "/e/ativa-mineracao/financeiro/fluxo-de-caixa",
            query: { source: "protheus", dataset: "kpi", indicator: "cash", company: "ativa-mineracao", period: { month: "2026-06" } },
          },
          {
            id: "vf-ebitda", visualization: "kpi", span: { base: 12, md: 6, xl: 3 },
            href: "/e/ativa-mineracao/financeiro/dre", tone: "warning",
            query: { source: "protheus", dataset: "kpi", indicator: "ebitda", company: "ativa-mineracao", period: { month: "2026-06" }, compareWith: "budget" },
          },
          {
            id: "vf-costs", visualization: "kpi", span: { base: 12, md: 6, xl: 3 },
            href: "/e/ativa-mineracao/financeiro/oxr", tone: "danger",
            query: { source: "protheus", dataset: "kpi", indicator: "costs", company: "ativa-mineracao", period: { month: "2026-06" }, compareWith: "budget" },
          },
          {
            id: "vf-alerts", visualization: "kpi", span: { base: 12, md: 6, xl: 3 }, tone: "danger",
            query: { source: "platform", dataset: "alerts_summary", company: "ativa-mineracao" },
          },
        ],
      },
      {
        title: "Caixa",
        widgets: [
          {
            id: "vf-cashflow", visualization: "cash-combo", title: "Fluxo de caixa",
            description: "R$ mi · semanal · realizado + projetado", span: { base: 12, xl: 8 },
            query: { source: "protheus", dataset: "cash_flow", company: "ativa-mineracao", period: { view: "ltm" } },
          },
          {
            id: "vf-banks", visualization: "status", title: "Posição por conta", span: { base: 12, xl: 4 },
            query: { source: "protheus", dataset: "bank_position", company: "ativa-mineracao" },
          },
        ],
      },
      {
        title: "Resultado e investimento",
        widgets: [
          {
            id: "vf-bridge", visualization: "waterfall", title: "Ponte do EBITDA — junho",
            description: "Orçado → realizado · R$ mi", span: { base: 12, xl: 5 },
            query: { source: "platform", dataset: "oxr_bridge", company: "ativa-mineracao", period: { month: "2026-06" }, compareWith: "budget" },
          },
          {
            id: "vf-forecast", visualization: "line-forecast", title: "EBITDA — trajetória do ano",
            description: "R$ mi · real × forecast × orçado", span: { base: 12, xl: 4 },
            query: { source: "platform", dataset: "ebitda_forecast", company: "ativa-mineracao", period: { view: "ytd" } },
          },
          {
            id: "vf-capex", visualization: "progress", title: "CAPEX — execução do ano", span: { base: 12, xl: 3 },
            query: { source: "platform", dataset: "capex_execution", company: "ativa-mineracao", period: { view: "ytd" } },
          },
        ],
      },
      {
        title: "Operação",
        widgets: [
          {
            id: "vf-integrations", visualization: "status", title: "Integrações", span: { base: 12, md: 6 },
            href: "/e/ativa-mineracao/config/integracoes",
            query: { source: "platform", dataset: "integrations_health", company: "ativa" },
          },
          {
            id: "vf-milestones", visualization: "timeline", title: "Próximos marcos", span: { base: 12, md: 6 },
            query: { source: "platform", dataset: "milestones" },
          },
        ],
      },
    ],
  },
];

export function getDashboardSpec(id: string): DashboardSpec | undefined {
  return specs.find((s) => s.id === id);
}

export function listDashboardSpecs(): Pick<DashboardSpec, "id" | "title" | "description">[] {
  return specs.map(({ id, title, description }) => ({ id, title, description }));
}
