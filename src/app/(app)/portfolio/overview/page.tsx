"use client";

/**
 * HOME DO PORTFÓLIO · dashboard 100% declarativo (Widget Engine, ADR-018).
 * A página não contém markup de card: apenas CONFIGS de widgets construídas
 * com os ports dos domínios (@modules/*) e renderizadas pelo WidgetGrid.
 * Este é o padrão obrigatório para todos os dashboards da plataforma.
 */
import Link from "next/link";
import { Building2, Filter } from "lucide-react";
import { Badge, Button } from "@core";
import {
  EntityCard, WidgetGrid, ready,
  type WidgetConfig, type AlertWidgetData, type CardWidgetData, type ChartWidgetData,
  type ForecastWidgetData, type KpiWidgetData, type ProgressWidgetData,
  type StatusWidgetData, type TimelineWidgetData,
} from "@modules/widgets";
import { ComparisonBars } from "@modules/analytics";
import { getPortfolioSummary, listCompanies } from "@modules/organizations";
import { getActivityFeed, getMilestones, getPipelineMini, listAlerts } from "@modules/governance";
import { getForecastSeries } from "@modules/financials";
import { listConnections } from "@modules/settings";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { icon as dsIcon } from "@/design-system";
import { DashboardLayout } from "@/components/layouts";

const revenueVsBudget = [
  { month: "jan", actual: 17.2, budget: 18.0 }, { month: "fev", actual: 18.8, budget: 18.2 },
  { month: "mar", actual: 19.5, budget: 18.5 }, { month: "abr", actual: 18.1, budget: 19.0 },
  { month: "mai", actual: 19.6, budget: 19.2 }, { month: "jun", actual: 18.9, budget: 19.5 },
];

export default function PortfolioOverviewPage() {
  const summary = getPortfolioSummary();
  const companies = listCompanies();
  const alerts = listAlerts();
  const critical = alerts.filter((a) => a.severity === "critical").length;

  /* ── Faixa 1 · Resumo do portfólio ─────────────────────────────── */
  const summaryWidgets: WidgetConfig<any>[] = [
    {
      id: "companies-count", type: "kpi", span: { base: 6, md: 4, xl: 2 },
      data: ready<KpiWidgetData>({ label: "Investidas", value: String(summary.total), reading: "5 commodities · 5 estados" }),
    },
    {
      id: "integrated-progress", type: "progress", title: "Integradas", span: { base: 6, md: 4, xl: 2 },
      source: "Ativa · Protheus",
      data: ready<ProgressWidgetData>({
        value: summary.integrated, max: summary.total,
        format: (v) => String(v),
        caption: `${summary.implementing} em implantação`,
      }),
    },
    {
      id: "critical-alerts", type: "kpi", span: { base: 6, md: 4, xl: 2 }, tone: "danger", href: "#alertas",
      data: ready<KpiWidgetData>({ label: "Alertas críticos", value: String(critical), reading: "1 caixa · 1 licença" }),
    },
    {
      id: "cash-consolidated", type: "kpi", span: { base: 6, md: 6, xl: 3 },
      source: "Consolidado · jun/26", actions: <Badge variant="outline" className="text-micro">1 empresa</Badge>,
      data: ready<KpiWidgetData>({
        label: "Caixa consolidado", value: "R$ 48,2 mi",
        reading: "cobertura de 4,2 meses",
        delta: { value: 6.4, favorable: true, label: "vs mai" },
        spark: [39.5, 41.2, 40.1, 43.8, 45.3, 48.2],
      }),
    },
    {
      id: "revenue-ytd", type: "kpi", span: { base: 12, md: 6, xl: 3 },
      source: "Consolidado · publicado jun/26", actions: <Badge variant="outline" className="text-micro">1 empresa</Badge>,
      data: ready<KpiWidgetData>({
        label: "Receita YTD", value: "R$ 112,7 mi",
        reading: "48% do plano anual · no ritmo",
        delta: { value: -3.1, favorable: false, label: "vs orçado" },
        spark: [17.2, 18.8, 19.5, 18.1, 19.6, 18.9],
      }),
    },
  ];

  /* ── Faixa 2 · Investidas (EntityCard como card widget) ────────── */
  const companyWidgets: WidgetConfig<CardWidgetData>[] = companies.map((c) => ({
    id: `company-${c.id}`, type: "card", frameless: true, span: { base: 12, md: 6, xl: 4 },
    data: ready({ children: <EntityCard company={c} /> }),
  }));

  /* ── Faixa 3 · Alertas + Atualizações ──────────────────────────── */
  const attentionWidgets: WidgetConfig<any>[] = [
    {
      id: "alerts", type: "alert", title: "Alertas", span: { base: 12, xl: 8 },
      actions: <Badge variant="danger">{alerts.length} ativos</Badge>,
      source: "Motor de alertas · limiares configurados por empresa",
      data: ready<AlertWidgetData>({
        alerts: alerts.map((a) => ({
          id: a.id, severity: a.severity, title: a.title, meta: `${a.company} · há ${a.timeAgo}`, action: a.action,
        })),
      }),
    },
    {
      id: "feed", type: "timeline", title: "Últimas atualizações", span: { base: 12, xl: 4 },
      href: "/e/ativa-mineracao/governanca/auditoria", source: "Trilha de auditoria",
      data: ready<TimelineWidgetData>({
        items: getActivityFeed().slice(0, 6).map((f) => ({ when: f.time, label: f.text })),
      }),
    },
  ];

  /* ── Faixa 4 · Indicadores consolidados ────────────────────────── */
  const indicatorWidgets: WidgetConfig<any>[] = [
    {
      id: "ebitda-forecast", type: "forecast", title: "EBITDA — realizado × forecast × orçado",
      description: "R$ mi · 2026", span: { base: 12, xl: 6 }, skeleton: "chart",
      source: "Protheus · Ativa · fc jun/26",
      data: ready<ForecastWidgetData>({
        series: getForecastSeries(),
        summary: [
          { label: "Projetado ano", value: "R$ 61,2 mi" },
          { label: "vs orçado", value: "−4,8%" },
          { label: "Revisão", value: "fc jun" },
        ],
      }),
    },
    {
      id: "revenue-vs-budget", type: "chart", title: "Receita × Orçado",
      description: "R$ mi · últimos 6 meses", span: { base: 12, xl: 6 }, skeleton: "chart",
      source: "Protheus · Ativa · publicado jun/26",
      data: ready<ChartWidgetData>({ chart: <ComparisonBars data={revenueVsBudget} /> }),
    },
  ];

  /* ── Faixa 5 · Integrações + Marcos + Pipeline ─────────────────── */
  const opsWidgets: WidgetConfig<any>[] = [
    {
      id: "integrations", type: "status", title: "Status das integrações", span: { base: 12, md: 6, xl: 4 },
      href: "/e/ativa-mineracao/config/integracoes", source: "Sync diária 05:00 · logs por execução",
      data: ready<StatusWidgetData>({
        items: listConnections().map((c) => ({
          label: c.connector, detail: c.companyName,
          state: c.status === "healthy" ? "ok" : c.status === "error" ? "error" : c.status === "configuring" ? "warn" : "off",
          meta: c.lastSync ?? "—",
        })),
      }),
    },
    {
      id: "milestones", type: "timeline", title: "Próximos marcos", span: { base: 12, md: 6, xl: 4 },
      data: ready<TimelineWidgetData>({
        items: getMilestones().map((m) => ({ when: m.date, label: m.label, done: !m.upcoming, highlight: m.kind === "board" })),
      }),
    },
    {
      id: "pipeline", type: "card", title: "Pipeline de investimentos", span: { base: 12, md: 12, xl: 4 },
      requires: "portfolio.ver", deniedBehavior: "hide",
      actions: <Badge variant="navy">restrito ao fundo</Badge>, source: "Kanban completo na Fase 3",
      data: ready<CardWidgetData>({
        children: (
          <div className="space-y-2">
            {getPipelineMini().map((s) => (
              <div key={s.stage} className="flex items-center gap-3 text-body-sm">
                <span className="w-28 shrink-0 text-gray-700">{s.stage}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-sm bg-gray-100">
                  <div className="h-full rounded-sm bg-navy-900" style={{ width: `${(s.count / 8) * 100}%` }} />
                </div>
                <span className="w-5 shrink-0 text-right font-semibold tnum text-navy-900">{s.count}</span>
              </div>
            ))}
            <p className="pt-1 text-caption text-muted-foreground">
              <Badge variant="copper" className="mr-1">NOVO</Badge> Projeto Serra Azul em Due Diligence
            </p>
          </div>
        ),
      }),
    },
  ];

  return (
    <>
      <FilterBar showCompare={false} />
      <DashboardLayout spacing="xl" padY="relaxed">
        <PageHeader title="Dashboard do Portfólio" description="Ore Mining Investments · 6 investidas · junho de 2026" />

        <WidgetGrid widgets={summaryWidgets} />

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-snug text-navy-900">
                <Building2 className="h-4 w-4 text-gray-400" strokeWidth={dsIcon.stroke.regular} /> Investidas
              </h2>
              <p className="mt-0.5 text-caption text-gray-500">1 integrada · 2 em implantação · 3 planejadas</p>
            </div>
            <Link href="/portfolio/investidas">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </div>
          <WidgetGrid widgets={companyWidgets} />
        </section>

        <section id="alertas">
          <WidgetGrid widgets={attentionWidgets} />
        </section>

        <section>
          <div className="mb-4 flex items-baseline gap-2.5">
            <h2 className="font-display text-lg font-semibold tracking-snug text-navy-900">Indicadores</h2>
            <span className="flex items-center gap-1 text-caption text-gray-500">
              <Filter className="h-3 w-3" /> base: investidas integradas (1)
            </span>
          </div>
          <WidgetGrid widgets={indicatorWidgets} />
        </section>

        <WidgetGrid widgets={opsWidgets} />
      </DashboardLayout>
    </>
  );
}
