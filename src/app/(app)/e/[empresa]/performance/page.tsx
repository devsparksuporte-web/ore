"use client";

/**
 * PERFORMANCE DO INVESTIMENTO (M-PERF · Sprint 1.2) — saúde financeira da
 * investida. Jornada: situação (header + resumo) → VALOR → CAPITAL → LIQUIDEZ
 * → histórico. Lê tudo via port @modules/performance; derivados (MOIC, runway…)
 * calculados no serviço. Só componentes/tokens do DS. Aditivo, sem tocar em
 * telas/serviços aprovados.
 */
import { useParams } from "next/navigation";
import {
  Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, MetricStrip, type MetricItem,
} from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { SourceCaption } from "@/components/data/source-caption";
import { getCompanyBySlug } from "@modules/organizations";
import { derivePerformance, getPerformanceByCompany } from "@modules/performance";
import type { PerformanceDerived, PerformanceSnapshot } from "@modules/performance";
import { formatMoney, formatPct } from "@/lib/format";
import { ValueHero } from "./_components/value-block";
import { CapitalBlock } from "./_components/capital-block";
import { LiquidityBurn, RunwayCard } from "./_components/liquidity-block";
import { ValuationHistory } from "./_components/valuation-history";
import { formatAsOf, moicLabel, runwayLabel } from "./_components/helpers";

export default function CompanyPerformancePage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;
  const snap = getPerformanceByCompany(empresa);

  if (!snap) {
    return (
      <DashboardLayout spacing="lg">
        <PageHeader
          title="Performance do Investimento"
          description={`Saúde financeira — ${companyName}`}
          badge={<Badge variant="outline">{companyName}</Badge>}
        />
        <EmptyState kind="not-configured" title="Performance não disponível" description="Esta empresa ainda não possui snapshot de performance cadastrado." />
      </DashboardLayout>
    );
  }

  const d = derivePerformance(snap);
  const runwayTone: MetricItem["tone"] =
    d.runwayZone === "critical" ? "danger" : d.runwayZone === "attention" ? "warning" : "success";

  const kpis: MetricItem[] = [
    { label: "Valuation atual", value: formatMoney(snap.valuation.current, { compact: true }), hint: `MOIC ${moicLabel(d.moic)}` },
    { label: "Capital chamado", value: formatMoney(snap.capital.called, { compact: true }), hint: `${formatPct(d.calledPct, { digits: 0 })} do comprometido` },
    { label: "Caixa", value: formatMoney(snap.liquidity.cash, { compact: true }) },
    { label: "Runway", value: runwayLabel(d.runwayMonths), tone: runwayTone },
  ];

  const context = `Participação ${snap.ownershipPct}% · ${snap.currency} · data-base ${formatAsOf(snap.asOf)}`;

  return (
    <DashboardLayout spacing="lg">
      <PageHeader
        title="Performance do Investimento"
        description={context}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
        Acompanhe a criação de valor, a exposição de capital e a liquidez da investida.
      </p>

      <MetricStrip items={kpis} />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><ValueHero snap={snap} derived={d} /></div>
        <div className="xl:col-span-1"><ReturnRecap snap={snap} derived={d} /></div>
      </div>

      <CapitalBlock capital={snap.capital} derived={d} />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><LiquidityBurn liquidity={snap.liquidity} /></div>
        <div className="xl:col-span-1"><RunwayCard liquidity={snap.liquidity} derived={d} /></div>
      </div>

      <ValuationHistory history={snap.valuation.history} />
    </DashboardLayout>
  );
}

/** Recap de retorno (lente do múltiplo), ao lado do gráfico de evolução. */
function ReturnRecap({ snap, derived }: { snap: PerformanceSnapshot; derived: PerformanceDerived }) {
  const v = snap.valuation;
  return (
    <Card>
      <CardHeader><CardTitle>Retorno &amp; marcação</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-body-sm text-gray-500">MOIC</p>
          <p className="mt-1 font-display text-kpi tnum tracking-kpi text-navy-900">{moicLabel(derived.moic)}</p>
          <p className="mt-1 text-caption tnum text-gray-500">vs. capital investido {formatMoney(v.investedCapital, { compact: true })}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-body-sm text-gray-500">Método</p>
            <p className="mt-1 text-body-sm text-gray-700">{v.method}</p>
          </div>
          <div>
            <p className="text-body-sm text-gray-500">Data-base</p>
            <p className="mt-1 text-body-sm tnum text-gray-700">{formatAsOf(v.asOf)}</p>
          </div>
        </div>
        <div className="border-t pt-3"><SourceCaption source="Comitê de valuation" /></div>
      </CardContent>
    </Card>
  );
}
