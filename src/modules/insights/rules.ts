/**
 * Regras executivas v1 · funções PURAS (testáveis, sem I/O, sem layout).
 * Convenções de linguagem: uma linha, número primeiro quando possível,
 * semântica favorável/desfavorável (P-X4), sem alarmismo nem eufemismo.
 */
import type { Insight, InsightRule } from "./types";

const pct = (v: number) => `${Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const make = (i: Insight) => i;

/** Caixa: cobertura vs mínimo. */
export const cashHealthRule: InsightRule = (ctx) => {
  const { coverageMonths, minimumMonths, balanceCompact } = ctx.cash;
  if (coverageMonths >= minimumMonths * 1.5)
    return make({
      id: "cash-healthy", category: "cash", tone: "positive", priority: 60,
      emphasis: balanceCompact,
      text: `em caixa · fluxo permanece saudável, cobrindo ${coverageMonths.toLocaleString("pt-BR")} meses de operação.`,
      evidence: `cobertura ${coverageMonths} m vs mínimo ${minimumMonths} m`,
      href: `/e/${ctx.companySlug}/financeiro/fluxo-de-caixa`,
    });
  if (coverageMonths < minimumMonths)
    return make({
      id: "cash-critical", category: "cash", tone: "critical", priority: 95,
      emphasis: `${coverageMonths.toLocaleString("pt-BR")} meses`,
      text: `de cobertura de caixa · abaixo do mínimo de segurança (${minimumMonths}). Revisar premissas e saídas programadas.`,
      href: `/e/${ctx.companySlug}/financeiro/fluxo-de-caixa`,
    });
  return make({
    id: "cash-watch", category: "cash", tone: "attention", priority: 75,
    emphasis: `${coverageMonths.toLocaleString("pt-BR")} meses`,
    text: `de cobertura de caixa · dentro do mínimo, mas sem folga. Projeção merece acompanhamento semanal.`,
    href: `/e/${ctx.companySlug}/financeiro/fluxo-de-caixa`,
  });
};

/** Receita vs orçado. */
export const revenueRule: InsightRule = (ctx) => {
  const d = ctx.revenue.deltaPctVsBudget;
  if (Math.abs(d) < 1) return null;
  return make({
    id: "revenue-delta", category: "revenue",
    tone: d >= 0 ? "positive" : "attention",
    priority: d >= 0 ? 55 : 70,
    emphasis: pct(d),
    text: d >= 0
      ? `acima do orçado · receita de ${ctx.periodLabel} superou o plano.`
      : `abaixo do orçado · receita de ${ctx.periodLabel} não atingiu o plano.`,
    evidence: "receita do mês vs Orçamento 2026 v2",
    href: `/e/${ctx.companySlug}/financeiro/dre`,
  });
};

/** EBITDA vs período anterior (últimos dois pontos da série). */
export const ebitdaTrendRule: InsightRule = (ctx) => {
  const s = ctx.ebitda.sparkMi;
  if (s.length < 2) return null;
  const prev = s[s.length - 2];
  const curr = s[s.length - 1];
  if (prev === 0) return null;
  const d = ((curr - prev) / Math.abs(prev)) * 100;
  if (Math.abs(d) < 1)
    return make({
      id: "ebitda-flat", category: "ebitda", tone: "neutral", priority: 40,
      text: `EBITDA estável em relação ao período anterior (margem ${pct(ctx.ebitda.marginPct)}).`,
      href: `/e/${ctx.companySlug}/financeiro/dre`,
    });
  return make({
    id: "ebitda-trend", category: "ebitda",
    tone: d >= 0 ? "positive" : "attention",
    priority: d >= 0 ? 55 : 68,
    emphasis: pct(d),
    text: d >= 0
      ? `de crescimento do EBITDA em relação ao período anterior.`
      : `de recuo do EBITDA em relação ao período anterior · pressão concentrada em custos operacionais.`,
    evidence: `série mensal: ${prev} → ${curr} (R$ mi)`,
    href: `/e/${ctx.companySlug}/financeiro/dre`,
  });
};

/** Orçamento: linhas fora do limiar + justificativas pendentes. */
export const budgetRule: InsightRule = (ctx) => {
  const { linesOverThreshold, totalLines, pendingJustifications } = ctx.budget;
  if (linesOverThreshold === 0)
    return make({
      id: "budget-ok", category: "budget", tone: "positive", priority: 45,
      text: "Orçamento saudável · nenhuma linha fora do limiar no período.",
      href: `/e/${ctx.companySlug}/financeiro/oxr`,
    });
  return make({
    id: "budget-deviations", category: "budget",
    tone: pendingJustifications > 0 ? "attention" : "neutral",
    priority: 72,
    emphasis: `${linesOverThreshold} de ${totalLines}`,
    text: `linhas orçamentárias fora do limiar${pendingJustifications > 0 ? ` · ${pendingJustifications} ainda sem justificativa do responsável.` : ", todas justificadas."}`,
    href: `/e/${ctx.companySlug}/financeiro/oxr`,
  });
};

/** CAPEX vs plano. */
export const capexRule: InsightRule = (ctx) => {
  const gap = ctx.capex.plannedPct - ctx.capex.executedPct;
  if (Math.abs(gap) < 5) return null;
  return make({
    id: "capex-pace", category: "capex",
    tone: gap > 0 ? "attention" : "neutral",
    priority: 58,
    emphasis: `${pct(ctx.capex.executedPct)} executado`,
    text: gap > 0
      ? `do ano executado · CAPEX ${pct(gap)} abaixo do previsto no plano. Avaliar destravamento dos projetos.`
      : `do ano executado · CAPEX à frente do plano em ${pct(-gap)}.`,
    evidence: `plano esperava ${pct(ctx.capex.plannedPct)}`,
    href: `/e/${ctx.companySlug}/operacoes/capex`,
  });
};

/** Concentração de fornecedor. */
export const supplierConcentrationRule: InsightRule = (ctx) => {
  const { topName, topConcentrationPct, concentrationLimitPct } = ctx.suppliers;
  if (topConcentrationPct < concentrationLimitPct * 0.75) return null;
  return make({
    id: "supplier-concentration", category: "suppliers",
    tone: topConcentrationPct >= concentrationLimitPct ? "attention" : "neutral",
    priority: topConcentrationPct >= concentrationLimitPct ? 65 : 45,
    emphasis: pct(topConcentrationPct),
    text: `das compras dos últimos 12 meses concentradas em ${topName}${topConcentrationPct >= concentrationLimitPct ? " · acima do limiar de risco. Avaliar alternativas de fornecimento." : "."}`,
    href: `/e/${ctx.companySlug}/operacoes/compras`,
  });
};

/** Qualidade/frescor do dado · a análise declara sua própria base (P-X2). */
export const dataFreshnessRule: InsightRule = (ctx) => {
  if (!ctx.dataFreshness.stale) return null;
  return make({
    id: "data-stale", category: "data-quality", tone: "critical", priority: 90,
    text: `Dados desatualizados (última sincronização: ${ctx.dataFreshness.lastSyncLabel}) · as leituras acima refletem a última versão válida.`,
    href: `/e/${ctx.companySlug}/config/integracoes`,
  });
};

/** Fluxo futuro: por quantos meses a projeção permanece positiva/acima do mínimo. */
export const runwayRule: InsightRule = (ctx) => {
  const m = ctx.runway.positiveMonths;
  if (m <= 0) return null; // coberto pela regra crítica de caixa
  return make({
    id: "runway", category: "cash",
    tone: m >= 6 ? "positive" : "attention",
    priority: m >= 6 ? 62 : 74,
    emphasis: `${m} meses`,
    text: m >= 6
      ? `de fluxo positivo projetado à frente · sem necessidade de captação no horizonte.`
      : `de fluxo positivo projetado · horizonte curto; antecipar decisões de captação/reprogramação.`,
    evidence: "projeção: títulos em aberto + premissas v3",
    href: `/e/${ctx.companySlug}/financeiro/fluxo-de-caixa`,
  });
};

/** Fila de decisão: pedidos aguardando aprovação. */
export const approvalsPendingRule: InsightRule = (ctx) => {
  const { pending, overdueSla, valueCompact } = ctx.approvals;
  if (pending === 0)
    return make({
      id: "approvals-clear", category: "operations", tone: "positive", priority: 35,
      text: "Nenhuma aprovação aguardando sua decisão.",
      href: `/e/${ctx.companySlug}/governanca/aprovacoes`,
    });
  return make({
    id: "approvals-pending", category: "operations",
    tone: overdueSla > 0 ? "attention" : "neutral",
    priority: overdueSla > 0 ? 78 : 60,
    emphasis: String(pending),
    text: `${pending === 1 ? "pedido aguardando" : "pedidos aguardando"} sua aprovação (${valueCompact})${overdueSla > 0 ? ` · ${overdueSla} fora do SLA.` : "."}`,
    href: `/e/${ctx.companySlug}/governanca/aprovacoes`,
  });
};

/** Custos logísticos vs orçado. */
export const logisticsRule: InsightRule = (ctx) => {
  const d = ctx.logistics.deltaPctVsBudget;
  if (Math.abs(d) < 2) return null;
  return make({
    id: "logistics-trend", category: "operations",
    tone: d <= 0 ? "positive" : "attention",
    priority: d <= 0 ? 50 : 63,
    emphasis: pct(d),
    text: d <= 0
      ? `de redução nos custos logísticos em relação ao orçado.`
      : `de alta nos custos logísticos em relação ao orçado · frete pressionando a margem.`,
    evidence: "linha Frete e logística · OxR",
    href: `/e/${ctx.companySlug}/financeiro/oxr`,
  });
};

export const defaultRules: InsightRule[] = [
  cashHealthRule,
  revenueRule,
  ebitdaTrendRule,
  budgetRule,
  capexRule,
  supplierConcentrationRule,
  runwayRule,
  approvalsPendingRule,
  logisticsRule,
  dataFreshnessRule,
];
