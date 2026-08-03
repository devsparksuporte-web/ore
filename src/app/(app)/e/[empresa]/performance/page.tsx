"use client";

/**
 * PERFORMANCE DO INVESTIMENTO (M-PERF · composição editorial).
 * Jornada: situação (header + faixa) → VALOR → CAPITAL → LIQUIDEZ → histórico.
 * Composição de relatório: sem cards, seções ancoradas por regra superior e
 * notas de margem para o que qualifica (múltiplo, runway). Lê tudo via port
 * @modules/performance; derivados calculados no serviço.
 */
import { useParams } from "next/navigation";
import { Badge, EmptyState, MetricStrip, type MetricItem } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { getCompanyBySlug } from "@modules/organizations";
import { derivePerformance, getPerformanceByCompany } from "@modules/performance";
import { formatMoney, formatPct } from "@/lib/format";
import { ValueHero } from "./_components/value-block";
import { CapitalBlock } from "./_components/capital-block";
import { LiquiditySection } from "./_components/liquidity-block";
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
    { label: "Valuation", value: formatMoney(snap.valuation.current, { compact: true }), hint: `MOIC ${moicLabel(d.moic)}` },
    { label: "Capital chamado", value: formatMoney(snap.capital.called, { compact: true }), hint: `${formatPct(d.calledPct, { digits: 0 })} do comprometido` },
    { label: "Caixa", value: formatMoney(snap.liquidity.cash, { compact: true }) },
    { label: "Runway", value: runwayLabel(d.runwayMonths), tone: runwayTone },
  ];

  return (
    <DashboardLayout spacing="xl">
      <PageHeader
        title="Performance do Investimento"
        description={`Participação ${snap.ownershipPct}% · ${snap.currency} · data-base ${formatAsOf(snap.asOf)}`}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
        Acompanhe a criação de valor, a exposição de capital e a liquidez da investida.
      </p>

      <MetricStrip items={kpis} />

      <ValueHero snap={snap} derived={d} />

      <CapitalBlock capital={snap.capital} derived={d} />

      <LiquiditySection liquidity={snap.liquidity} derived={d} />

      <ValuationHistory history={snap.valuation.history} />
    </DashboardLayout>
  );
}
