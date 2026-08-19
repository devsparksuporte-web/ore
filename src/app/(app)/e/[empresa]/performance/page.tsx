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
import {
  derivePerformance, getPerformanceByCompany, RUNWAY_FORMULA_LABEL, RUNWAY_PERIOD_UNDEFINED,
} from "@modules/performance";
import { formatMoney, formatPct } from "@/lib/format";
import { ValueHero } from "./_components/value-block";
import { CapitalBlock } from "./_components/capital-block";
import { LiquiditySection } from "./_components/liquidity-block";
import { ValuationHistory } from "./_components/valuation-history";
import { formatAsOf, moicLabel, opcional, ownershipLabel, runwayLabel, SEM_DADO } from "./_components/helpers";

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
  /* Fase 5.2 · ORE-51-010 — `fieldStatus` existia no contrato desde a Sprint
     1.5 e nenhuma tela o lia: o estado do dado era por investida, e a mesma
     tela mostrava valuation em conflito e cenários documentais com a mesma
     aparência. Cada drawer passa a declarar o estado do SEU campo. */
  const fs = snap.fieldStatus;
  const abrir = (d: Omit<DetailDrawerProps, "open" | "onOpenChange">) => () =>
    setDetalhe({ ...d, open: true, onOpenChange: () => setDetalhe(null) });

  const detValor = abrir({
    kicker: "Indicador",
    title: "Valor da participação",
    summary:
      `Marcação a fair value da fatia de ${ownershipLabel(snap.ownershipPct)} da Ore na investida. É quanto a participação vale hoje segundo o método de marcação declarado pela fonte — não é preço de venda nem oferta recebida.`,
    fields: [
      { label: "Valor", value: opcional(snap.valuation.current, money) },
      { label: "Data-base", value: formatAsOf(snap.valuation.asOf) },
      { label: "Método", value: snap.valuation.method },
      { label: "Capital investido", value: opcional(snap.capital.invested, money) },
      { label: "Múltiplo sobre o capital", value: moicLabel(d.moic), wide: true },
    ],
    action: "Reavaliar a marcação quando a SBLC destravar o financiamento — é o evento que muda a tese de valor.",
    source: fonte,
    dataStatus: fs?.valuation,
  });

  const detCapital = abrir({
    kicker: "Indicador",
    title: temCapital ? "Capital chamado" : "Capital investido",
    summary: temCapital
      ? "Parcela do capital comprometido que já foi efetivamente chamada dos cotistas."
      : "Custo de aquisição da participação — a base sobre a qual o múltiplo é calculado.",
    fields: [
      { label: "Valor", value: opcional(snap.capital.invested ?? snap.capital.called, money) },
      { label: "Participação", value: ownershipLabel(snap.ownershipPct) },
      ...(snap.capital.unavailableReason
        ? [{ label: "Posição de capital por investida", value: snap.capital.unavailableReason, wide: true }]
        : []),
    ],
    source: fonte,
    dataStatus: fs?.capital,
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
        dataStatus: fs?.scenarios,
      })
    : undefined;

  /* Item 8 — o drawer do runway precisa responder as cinco perguntas que
     sustentam o número: QUANTO (caixa e consumo), COMO (fórmula), SOBRE QUAL
     PERÍODO, EM QUE DATA e DE ONDE. Antes explicava significado, caixa e burn
     e calava sobre cálculo, período e data-base — o leitor via um valor sem
     poder auditá-lo. Cada campo abaixo sai da fonte ou do port; nenhum é
     arbitrado aqui. */
  const detRunway = abrir({
    kicker: "Indicador",
    title: "Runway",
    summary:
      d.runwayMonths === null
        ? "Quantos meses a investida opera com o caixa atual, ao ritmo de consumo atual. Não é calculável hoje."
        : "Quantos meses a investida opera com o caixa atual, ao ritmo de consumo atual.",
    fields: [
      { label: "Runway", value: runwayLabel(d.runwayMonths) },
      { label: "Fórmula", value: RUNWAY_FORMULA_LABEL },
      { label: "Consumo mensal", value: opcional(snap.liquidity.burnMonthly, (n) => formatMoney(n, { compact: true, currency: snap.liquidity.currency ?? "BRL" })) },
      { label: "Caixa", value: opcional(snap.liquidity.cash, money) },
      /* ORE-51-004 — o saldo tem data-base própria; sem ela o leitor assume a
         do snapshot (três meses antes, no caso da Morro Verde). */
      { label: "Data-base do caixa", value: snap.liquidity.cashAsOf ? formatAsOf(snap.liquidity.cashAsOf) : SEM_DADO },
      /* Período e data-base do CONSUMO — não do snapshot. Sem metodologia
         definida pela fonte, "Aguardando definição"; nunca um período suposto. */
      { label: "Período considerado", value: snap.liquidity.burnPeriodLabel ?? RUNWAY_PERIOD_UNDEFINED },
      { label: "Data-base do consumo", value: snap.liquidity.burnAsOf ? formatAsOf(snap.liquidity.burnAsOf) : SEM_DADO },
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
    dataStatus: fs?.runway,
  });

  const kpis: MetricItem[] = [
    { label: "Valor da participação", value: opcional(snap.valuation.current, money), muted: snap.valuation.current === null,
      hint: d.moic === null ? undefined : `Múltiplo ${moicLabel(d.moic)}`, onSelect: detValor },
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
        /* Participação omitida quando os documentos conflitam: "Participação
           Não disponibilizado" no header lê pior que simplesmente não afirmar.
           A ausência segue declarada no drawer do indicador. */
        description={[
          snap.ownershipPct === null ? null : `Participação ${ownershipLabel(snap.ownershipPct)}`,
          snap.currency,
          `data-base ${formatAsOf(snap.asOf)}`,
        ].filter(Boolean).join(" · ")}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
        Acompanhe a criação de valor, a exposição de capital e a liquidez da investida.
      </p>

      <MetricStrip items={kpis} />

      <ValueHero snap={snap} derived={d} />

      <CapitalBlock capital={snap.capital} derived={d} scenarios={snap.scenarios} currency={cur} />

      <LiquiditySection liquidity={snap.liquidity} derived={d} />

      <ValuationHistory history={snap.valuation.history} currency={cur} note={snap.valuation.seriesNote} />

      {detalhe && <DetailDrawer {...detalhe} />}
    </DashboardLayout>
  );
}
