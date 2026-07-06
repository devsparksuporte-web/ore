/**
 * COMPOSITION ROOT do Insight Engine — monta o InsightContext a partir
 * dos ports de domínio (único acoplamento multi-domínio permitido fora
 * de páginas, mesmo padrão do analytics-datasets).
 * E5: este arquivo passa a montar o contexto a partir da API.
 */
import type { InsightContext } from "@modules/insights";
import { getExecutiveKpis, getOxrWaterfall, listOxrLines } from "@modules/financials";
import { getConcentratedSupplier, listSuppliers } from "@modules/operations";
import { getApprovalQueue } from "@modules/governance";

export function buildAtivaInsightContext(): InsightContext {
  const kpis = getExecutiveKpis();
  const ebitda = kpis.find((k) => k.key === "ebitda");
  const cash = kpis.find((k) => k.key === "cash");
  const oxr = listOxrLines();
  const overThreshold = oxr.filter((l) => Math.abs((l.actual - l.budget) / Math.abs(l.budget)) * 100 > 5);
  const top = listSuppliers().slice().sort((a, b) => b.concentrationPct - a.concentrationPct)[0];
  void getOxrWaterfall; // reservado p/ regras de ponte na v2 das regras
  void getConcentratedSupplier;

  return {
    companySlug: "ativa-mineracao",
    periodLabel: "jun/26",
    cash: {
      balanceCompact: cash?.value ?? "R$ 48,2 mi",
      coverageMonths: 4.2,
      minimumMonths: 2,
      sparkMi: cash?.spark ?? [],
    },
    revenue: { deltaPctVsBudget: -3.1 },
    ebitda: { sparkMi: ebitda?.spark ?? [], marginPct: 28.6 },
    budget: {
      linesOverThreshold: overThreshold.length,
      totalLines: oxr.length,
      pendingJustifications: oxr.filter((l) => l.justification === "pending").length,
    },
    capex: { executedPct: 44, plannedPct: 62 },
    suppliers: {
      topName: top?.name ?? "—",
      topConcentrationPct: top?.concentrationPct ?? 0,
      concentrationLimitPct: 40,
    },
    dataFreshness: { lastSyncLabel: "hoje 06:15", stale: false },
    runway: { positiveMonths: 8 },
    approvals: (() => {
      const q = getApprovalQueue();
      const value = q.reduce((s, i) => s + i.amount, 0);
      return {
        pending: q.length,
        overdueSla: q.filter((i) => i.slaStatus === "overdue").length,
        valueCompact: `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`,
      };
    })(),
    logistics: {
      deltaPctVsBudget: (() => {
        const frete = oxr.find((l) => l.label.toLowerCase().includes("frete"));
        return frete ? ((frete.actual - frete.budget) / Math.abs(frete.budget)) * 100 : 0;
      })(),
    },
  };
}
