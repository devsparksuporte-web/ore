"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertOctagon, ArrowRight, Briefcase, CheckCircle2, ClipboardList, FileWarning, ShieldAlert, Wallet,
} from "lucide-react";
import { WidgetGrid, ready, type WidgetConfig } from "@modules/widgets";
import { generateInsights, type BriefingWidgetData, type Insight } from "@modules/insights";
import { buildAtivaInsightContext } from "@/lib/insight-context";
import { mockSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { ChartCard } from "@/components/data/chart-card";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { PeriodBadge } from "@/components/data/status-badge";
import { SourceCaption } from "@/components/data/source-caption";
import { Sparkline } from "@/components/data/sparkline";
import { CashChart } from "@/components/charts/cash-chart";
import { WaterfallChart } from "@/components/charts/waterfall-chart";
import { ForecastChart } from "@/components/charts/forecast-chart";
import {
  bankAccounts, cashFlow, CASH_MINIMUM, forecastSeries, operationalKpis, oxrLines, oxrWaterfall, upcomingOutflows,
} from "@/mocks/financeiro";
import { alerts } from "@/mocks/governanca";
import { formatMoney } from "@/lib/format";
import { getCompany } from "@/mocks/companies";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

/**
 * Dashboard Executivo · v2 — desenhado para a leitura diária do CEO.
 * Fluxo: SÍNTESE (como estamos?) → RISCO (o que ameaça?) → EVIDÊNCIA
 * (caixa · orçamento) → DECISÃO (investimento · pendências).
 * Cada seção nasce de uma pergunta — contexto e clareza antes de volume.
 */
export default function CompanyOverviewPage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompany(empresa);
  const base = `/e/${empresa}`;

  /* Insight Engine (ADR-020): a análise é do motor; a tela só exibe */
  const [insights, setInsights] = React.useState<Insight[]>([]);
  React.useEffect(() => {
    generateInsights(buildAtivaInsightContext()).then(setInsights);
  }, []);

  const critical = alerts.filter((a) => a.severity === "critical" && a.companySlug === empresa);
  const topDeviations = oxrLines
    .map((l) => ({ ...l, dev: ((l.actual - l.budget) / Math.abs(l.budget)) * 100 }))
    .sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev))
    .slice(0, 4);

  return (
    <>
      <FilterBar />
      <DashboardLayout spacing="lg">
        <PageHeader
          title="Dashboard Executivo"
          description={company?.name ?? "Ativa Titânio e Vanádio"}
          badge={
            <span className="flex items-center gap-2">
              <PeriodBadge published />
              {critical.length > 0 ? (
                <Badge variant="danger" dot>{critical.length} riscos ativos</Badge>
              ) : (
                <Badge variant="success" dot>Sem riscos críticos</Badge>
              )}
            </span>
          }
        />

        {/* ── SÍNTESE · Como está a empresa? ─────────────────────────── */}
        <section aria-label="Síntese">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Qual o caixa? */}
            <HeroCard
              eyebrow="Caixa"
              question="Qual o caixa?"
              value="R$ 48,2 mi"
              reading="Cobre 4,2 meses de operação"
              delta={<DeltaIndicator value={6.4} favorable label="vs mai" />}
              spark={[39.5, 41.2, 40.1, 43.8, 45.3, 48.2]}
              href={`${base}/financeiro/fluxo-de-caixa`}
              source="Protheus · hoje 06:15"
            />
            {/* Como está o EBITDA? */}
            <HeroCard
              eyebrow="EBITDA"
              question="Como está o EBITDA?"
              value="R$ 5,4 mi"
              reading="Margem 28,6% · ano projetado R$ 61,2 mi"
              delta={<DeltaIndicator value={-21.7} favorable={false} label="vs orçado (mês)" />}
              spark={[5.9, 6.1, 5.8, 5.2, 5.6, 5.4]}
              href={`${base}/financeiro/dre`}
              source="DRE publicada · jun/26"
              tone="warning"
            />
            {/* O orçamento está saudável? */}
            <HeroCard
              eyebrow="Orçamento"
              question="O orçamento está saudável?"
              value="−R$ 1,5 mi"
              reading="5 de 7 linhas fora do limiar · 2 justificativas pendentes"
              delta={<DeltaIndicator value={-21.7} favorable={false} label="EBITDA vs plano" />}
              href={`${base}/financeiro/oxr`}
              source="Orçamento 2026 v2 × realizado"
              tone="danger"
            />
          </div>
        </section>

        {/* ── CRYSTAL INTELLIGENCE · briefing diário (a tela só exibe) ── */}
        {insights.length > 0 && (
          <section aria-label="Crystal Intelligence — briefing diário">
            <WidgetGrid
              widgets={[
                {
                  id: "crystal-briefing",
                  type: "briefing",
                  span: { base: 12 },
                  requires: "dashboard.ver",
                  company: empresa,
                  data: ready<BriefingWidgetData>({
                    firstName: mockSession.user.name.split(" ")[0],
                    insights,
                    maxItems: 6,
                  }),
                } satisfies WidgetConfig<BriefingWidgetData>,
              ]}
            />
          </section>
        )}

        {/* ── RISCO · Existe algum risco? ─────────────────────────────── */}
        {critical.length > 0 && (
          <section aria-label="Riscos ativos">
            <Eyebrow icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Riscos ativos" />
            <div className="overflow-hidden rounded-md border border-danger/25 bg-surface">
              {critical.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border-b border-danger/10 px-5 py-3.5 last:border-0">
                  <AlertOctagon className="h-4 w-4 shrink-0 text-danger" />
                  <p className="min-w-0 flex-1 truncate text-body-sm font-medium text-gray-800">{a.title}</p>
                  <span className="hidden text-caption text-muted-foreground sm:block">há {a.timeAgo}</span>
                  <Link href={a.action.href} className="flex shrink-0 items-center gap-1 text-body-sm font-semibold text-action-600 hover:underline">
                    {a.action.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CAIXA · evidência ───────────────────────────────────────── */}
        <section aria-label="Caixa">
          <Eyebrow icon={<Wallet className="h-3.5 w-3.5" />} label="Caixa · próximos 90 dias" />
          <div className="grid gap-4 xl:grid-cols-12">
            <ChartCard
              className="xl:col-span-8"
              title="Fluxo de caixa"
              subtitle="R$ mi · semanal · realizado + projetado"
              source="Protheus · títulos abertos + premissas v3 · hoje 06:15"
              actions={
                <Link href={`${base}/financeiro/fluxo-de-caixa`}>
                  <Button variant="ghost" size="sm">Ver completo <ArrowRight /></Button>
                </Link>
              }
            >
              <CashChart data={cashFlow} minimum={CASH_MINIMUM} />
            </ChartCard>

            <div className="space-y-4 xl:col-span-4">
              <Card>
                <CardHeader><CardTitle>Posição por conta</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {bankAccounts.map((b) => (
                    <div key={b.bank} className="flex items-center gap-3 text-body-sm">
                      <span className="w-28 shrink-0 text-gray-700">{b.bank}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-navy-900" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-20 shrink-0 text-right font-medium tnum">{formatMoney(b.balance, { compact: true })}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Maiores saídas · 15 dias</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {upcomingOutflows.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-2 text-body-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-700">{o.who}</p>
                        <p className="truncate text-caption text-muted-foreground">vence {o.due}</p>
                      </div>
                      <span className="shrink-0 font-medium tnum text-danger">({formatMoney(o.amount, { compact: true })})</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── ORÇAMENTO · há desvios? contas críticas? ────────────────── */}
        <section aria-label="Orçamento e desvios">
          <Eyebrow icon={<FileWarning className="h-3.5 w-3.5" />} label="Orçamento · desvios e contas críticas" />
          <div className="grid gap-4 xl:grid-cols-12">
            <ChartCard
              className="xl:col-span-7"
              title="Ponte do EBITDA — junho"
              subtitle="Orçado → realizado · R$ mi"
              source="DRE gerencial × Orçamento 2026 v2"
              actions={<Link href={`${base}/financeiro/oxr`}><Button variant="ghost" size="sm">Ver OxR <ArrowRight /></Button></Link>}
            >
              <WaterfallChart data={oxrWaterfall} />
            </ChartCard>

            <Card className="xl:col-span-5">
              <CardHeader>
                <CardTitle>Contas críticas</CardTitle>
                <Badge variant="warning">2 sem justificativa</Badge>
              </CardHeader>
              <CardContent className="space-y-1">
                {topDeviations.map((d) => {
                  const isRevenue = d.label.toLowerCase().includes("receita");
                  const favorable = isRevenue ? d.dev >= 0 : d.dev <= 0;
                  return (
                    <Link
                      key={d.id}
                      href={`${base}/financeiro/oxr`}
                      className="flex items-center justify-between gap-2 rounded px-2 py-2 transition-colors duration-fast hover:bg-gray-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-body-sm font-medium text-gray-800">{d.label}</span>
                        <span className="text-caption text-muted-foreground">{d.costCenter}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <DeltaIndicator value={d.dev} favorable={favorable} />
                        {d.justification === "accepted" && <Badge variant="success">OK</Badge>}
                        {d.justification === "submitted" && <Badge variant="info">Análise</Badge>}
                        {d.justification === "pending" && <Badge variant="warning">Pendente</Badge>}
                      </span>
                    </Link>
                  );
                })}
              </CardContent>
              <CardFooter>
                <SourceCaption source="Limiar 5% · responsáveis notificados" />
                <Link href={`${base}/financeiro/oxr`} className="text-body-sm font-medium text-action-600 hover:underline">Cobrar →</Link>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ── INVESTIMENTO E AÇÃO · preciso investir? o que decido hoje? ── */}
        <section aria-label="Investimento e ação">
          <Eyebrow icon={<Briefcase className="h-3.5 w-3.5" />} label="Investimento · trajetória e decisões" />
          <div className="grid gap-4 xl:grid-cols-12">
            <ChartCard
              className="xl:col-span-5"
              title="EBITDA — trajetória do ano"
              subtitle="R$ mi · real × forecast × orçado"
              source="Rolling forecast · fc jun (15/jun)"
            >
              <ForecastChart data={forecastSeries} height={200} />
            </ChartCard>

            <Card className="xl:col-span-4">
              <CardHeader>
                <CardTitle>CAPEX — execução do ano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl font-semibold tnum text-navy-900">R$ 14,1 mi</span>
                    <span className="text-body-sm text-muted-foreground tnum">de R$ 32,0 mi</span>
                  </div>
                  <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-navy-900" style={{ width: "44%" }} />
                    <div className="absolute top-[-3px] h-3.5 w-[2px] rounded bg-copper-500" style={{ left: "62%" }} title="onde o plano esperava: 62%" />
                  </div>
                  <p className="mt-1.5 text-caption text-muted-foreground">
                    44% executado · plano previa <span className="font-medium text-copper-500">62%</span> — ritmo abaixo do planejado
                  </p>
                </div>
                <div className="rounded-md bg-sunken px-3 py-2.5 text-body-sm text-gray-700">
                  <span className="font-medium">Aguardando decisão:</span> ampliação do pátio de estocagem
                  (R$ 2,4 mi) — na alçada da Diretoria Ore.
                </div>
              </CardContent>
              <CardFooter><SourceCaption source="Projetos · jun/26 · completo na v1.1" /></CardFooter>
            </Card>

            {/* Minhas pendências — a ação do dia */}
            <Card className="xl:col-span-3">
              <CardHeader><CardTitle>Decidir hoje</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                <PendingItem icon={<ClipboardList className="h-4 w-4 text-warning-fg" />} text="7 aprovações" detail="R$ 2,3 mi · 2 fora do SLA" href={`${base}/governanca/aprovacoes`} />
                <PendingItem icon={<FileWarning className="h-4 w-4 text-warning-fg" />} text="1 justificativa" detail="Energia · prazo 05/jul" href={`${base}/financeiro/oxr`} />
                <PendingItem icon={<CheckCircle2 className="h-4 w-4 text-info-fg" />} text="Fechamento jul/26" detail="3 de 9 etapas" href={`${base}/config/periodos`} />
                <Link href={`${base}/governanca/aprovacoes`} className="block">
                  <Button className="mt-1 w-full" size="sm">Ir para a fila <ArrowRight /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── OPERAÇÃO · contexto de rodapé, enxuto ───────────────────── */}
        <section aria-label="Operação">
          <div className="grid grid-cols-1 gap-4 rounded-md border bg-surface px-6 py-4 sm:grid-cols-3">
            {operationalKpis.slice(0, 1).concat(operationalKpis.slice(3, 4), operationalKpis.slice(5, 6)).map((k) => (
              <div key={k.label} className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <span className="text-caption uppercase tracking-wider text-gray-500">{k.label}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold tnum text-navy-900">{k.value}</span>
                  {k.delta !== 0 ? (
                    <DeltaIndicator value={k.delta} favorable={k.favorable} className="text-caption" />
                  ) : (
                    <span className="text-caption text-success">na meta</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            Régua operacional completa (6 indicadores) no catálogo da empresa · fonte: planilha jun/26 + Protheus
          </p>
        </section>
      </DashboardLayout>
    </>
  );
}

/* ── Blocos locais do dashboard ─────────────────────────────────────── */

/** Sobrancelha de seção — nomeia a pergunta que a seção responde. */
function Eyebrow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="mb-3 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-gray-500">
      {icon} {label}
    </p>
  );
}

/** Card vital da tríade executiva — valor grande + leitura em uma linha. */
function HeroCard({
  eyebrow, question, value, reading, delta, spark, href, source, tone,
}: {
  eyebrow: string;
  question: string;
  value: string;
  reading: string;
  delta?: React.ReactNode;
  spark?: number[];
  href: string;
  source: string;
  tone?: "warning" | "danger";
}) {
  return (
    <Link
      href={href}
      className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        className={cn(
          "group flex h-full cursor-pointer flex-col rounded-md border bg-surface p-6",
          "transition-[border-color,box-shadow] duration-fast ease-standard hover:border-action-600/70 hover:shadow-sm",
          tone === "danger" && "border-l-[3px] border-l-danger",
          tone === "warning" && "border-l-[3px] border-l-warning"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-caption font-semibold uppercase tracking-wider text-gray-500">{eyebrow}</span>
          <span className="text-caption text-gray-400">{question}</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="font-display text-3xl font-semibold leading-9 tracking-tight tnum text-navy-900">{value}</div>
            <p className="mt-1 truncate text-body-sm text-gray-700">{reading}</p>
            {delta && <div className="mt-2">{delta}</div>}
          </div>
          {spark && <Sparkline data={spark} className="shrink-0 text-navy-900 opacity-70 transition-opacity duration-fast group-hover:opacity-100" />}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <SourceCaption source={source} />
          <span aria-hidden className="text-gray-300 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-action-600">→</span>
        </div>
      </div>
    </Link>
  );
}

function PendingItem({ icon, text, detail, href }: { icon: React.ReactNode; text: string; detail: string; href: string }) {
  return (
    <Link href={href} className="flex items-start gap-2.5 rounded-md border p-3 transition-colors duration-fast hover:border-action-600">
      {icon}
      <span className="min-w-0">
        <span className="block text-body-sm font-medium text-gray-800">{text}</span>
        <span className="block truncate text-caption text-muted-foreground">{detail}</span>
      </span>
    </Link>
  );
}
