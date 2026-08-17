"use client";

/**
 * PERFORMANCE DO INVESTIMENTO (M-PERF · composição editorial).
 * Jornada: situação (header + faixa) → VALOR → CAPITAL → LIQUIDEZ → histórico.
 * Composição de relatório: sem cards, seções ancoradas por regra superior e
 * notas de margem para o que qualifica (múltiplo, runway). Lê tudo via port
 * @modules/performance; derivados calculados no serviço.
 */
import * as React from "react";
import { useParams } from "next/navigation";
import { Badge, DetailDrawer, type DetailDrawerProps, EmptyState, MetricStrip, type MetricItem } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { getCompanyBySlug } from "@modules/organizations";
import { derivePerformance, getPerformanceByCompany } from "@modules/performance";
import { formatMoney, formatPct } from "@/lib/format";
import { ValueHero } from "./_components/value-block";
import { CapitalBlock } from "./_components/capital-block";
import { LiquiditySection } from "./_components/liquidity-block";
import { ValuationHistory } from "./_components/valuation-history";
import { formatAsOf, moicLabel, opcional, runwayLabel } from "./_components/helpers";

export default function CompanyPerformancePage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;
  const snap = getPerformanceByCompany(empresa);

  /* Regra dos Hooks: o estado do drill-down precisa ser declarado ANTES de
     qualquer early return, senão a ordem dos hooks muda entre um render com
     snapshot e um sem — o ESLint quebra o build (react-hooks/rules-of-hooks). */
  const [detalhe, setDetalhe] = React.useState<DetailDrawerProps | null>(null);

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
  const cur = snap.currency;
  const money = (n: number) => formatMoney(n, { compact: true, currency: cur });
  const runwayTone: MetricItem["tone"] =
    d.runwayMonths === null ? "default"
      : d.runwayZone === "critical" ? "danger"
        : d.runwayZone === "attention" ? "warning" : "success";

  /* O resumo espelha o que a FONTE fornece. Quando o capital não é controlado
     por investida, o 2º indicador passa a ser o capital efetivamente investido
     (cost basis) e o 3º, o cenário base — em vez de dois traços vazios. */
  const temCapital = snap.capital.committed !== null && snap.capital.called !== null;

  /* Drill-down dos indicadores (§13): o que o número significa, de onde veio,
     quando foi apurado e o que se espera do leitor. Definido aqui, ao lado do
     próprio indicador, para não haver risco de explicação descolar do dado. */
  const fonte = snap.sourceLabel ?? "Fonte não declarada";
  const abrir = (d: Omit<DetailDrawerProps, "open" | "onOpenChange">) => () =>
    setDetalhe({ ...d, open: true, onOpenChange: () => setDetalhe(null) });

  const detValor = abrir({
    kicker: "Indicador",
    title: "Valor da participação",
    summary:
      `Marcação a fair value da fatia de ${snap.ownershipPct}% da Ore na investida. É quanto a participação vale hoje segundo o comitê de valuation — não é preço de venda nem oferta recebida.`,
    fields: [
      { label: "Valor", value: money(snap.valuation.current) },
      { label: "Data-base", value: formatAsOf(snap.valuation.asOf) },
      { label: "Método", value: snap.valuation.method },
      { label: "Capital investido", value: opcional(snap.capital.invested, money) },
      { label: "Múltiplo sobre o capital", value: moicLabel(d.moic), wide: true },
    ],
    action: "Reavaliar a marcação quando a SBLC destravar o financiamento — é o evento que muda a tese de valor.",
    source: fonte,
  });

  const detCapital = abrir({
    kicker: "Indicador",
    title: temCapital ? "Capital chamado" : "Capital investido",
    summary: temCapital
      ? "Parcela do capital comprometido que já foi efetivamente chamada dos cotistas."
      : "Custo de aquisição da participação — a base sobre a qual o múltiplo é calculado.",
    fields: [
      { label: "Valor", value: opcional(snap.capital.invested ?? snap.capital.called, money) },
      { label: "Participação", value: `${snap.ownershipPct}%` },
      ...(snap.capital.unavailableReason
        ? [{ label: "Posição de capital por investida", value: snap.capital.unavailableReason, wide: true }]
        : []),
    ],
    source: fonte,
  });

  const detCenario = snap.scenarios
    ? abrir({
        kicker: "Indicador",
        title: "Cenário base de saída",
        summary: `Valor projetado pela Ore na saída, no cenário central. Janela-alvo ${snap.scenarios.window}.`,
        fields: [
          { label: "Downside", value: money(snap.scenarios.downside) },
          { label: "Base", value: money(snap.scenarios.base) },
          { label: "Upside", value: money(snap.scenarios.upside) },
          { label: "Marcação atual", value: money(snap.scenarios.current) },
          { label: "Mecanismo", value: snap.scenarios.mechanism, wide: true },
          ...(snap.scenarios.buyers ? [{ label: "Compradores potenciais", value: snap.scenarios.buyers, wide: true }] : []),
        ],
        action: "Definir o racional de saída em 2026: quem compra, em que estágio e sob qual gatilho.",
        source: "Workbook de gestão · Timeline de Saída",
      })
    : undefined;

  const detRunway = abrir({
    kicker: "Indicador",
    title: "Runway",
    summary:
      d.runwayMonths === null
        ? "Quantos meses a investida opera com o caixa atual, ao ritmo de consumo atual. Não é calculável hoje."
        : "Quantos meses a investida opera com o caixa atual, ao ritmo de consumo atual.",
    fields: [
      { label: "Runway", value: runwayLabel(d.runwayMonths) },
      { label: "Consumo mensal", value: opcional(snap.liquidity.burnMonthly, (n) => formatMoney(n, { compact: true, currency: snap.liquidity.currency ?? "BRL" })) },
      { label: "Caixa", value: opcional(snap.liquidity.cash, money) },
      { label: "Contingências", value: opcional(snap.liquidity.contingencies, money) },
      ...(snap.liquidity.unavailableReason
        ? [{ label: "Por que não é calculável", value: snap.liquidity.unavailableReason, wide: true }]
        : []),
    ],
    action:
      d.runwayMonths === null
        ? "Solicitar à ORE o saldo de caixa da investida — sem ele, a plataforma não consegue antecipar necessidade de aporte."
        : undefined,
    source: "Forecast operacional · Apresentação",
  });

  const kpis: MetricItem[] = [
    { label: "Valor da participação", value: money(snap.valuation.current), hint: `Múltiplo ${moicLabel(d.moic)}`, onSelect: detValor },
    temCapital
      ? { label: "Capital chamado", value: opcional(snap.capital.called, money), hint: d.calledPct !== null ? `${formatPct(d.calledPct, { digits: 0 })} do comprometido` : undefined, onSelect: detCapital }
      : { label: "Capital investido", value: opcional(snap.capital.invested, money), hint: "custo de aquisição", onSelect: detCapital },
    snap.scenarios
      ? { label: "Cenário base", value: money(snap.scenarios.base), hint: `saída ${snap.scenarios.window}`, onSelect: detCenario }
      : { label: "Caixa", value: opcional(snap.liquidity.cash, money), muted: snap.liquidity.cash === null },
    { label: "Runway", value: runwayLabel(d.runwayMonths), tone: runwayTone, muted: d.runwayMonths === null, onSelect: detRunway },
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

      <CapitalBlock capital={snap.capital} derived={d} scenarios={snap.scenarios} currency={cur} />

      <LiquiditySection liquidity={snap.liquidity} derived={d} />

      <ValuationHistory history={snap.valuation.history} currency={cur} />

      {detalhe && <DetailDrawer {...detalhe} />}
    </DashboardLayout>
  );
}
