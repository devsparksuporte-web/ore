/**
 * MOCK · domínio Performance do Investimento (Sprint 1.2).
 * Snapshots por investida (valor / capital / liquidez), alinhados às empresas
 * de @/mocks/companies. Valores em R$ absolutos, moeda BRL, data-base 30/06/2026.
 *
 * ⚠️ Acesso proibido a partir de componentes — leia SEMPRE via @modules/performance.
 * Adaptador "mock"; no E5 é substituído por @modules/api (ou por um importador
 * de Excel do Data Room) sem alterar as assinaturas do port.
 */
import type { BurnPoint, PerformanceSnapshot } from "@/modules/performance/types";

const mi = (n: number) => n * 1_000_000;

/** Série mensal de burn (12 meses até a data-base). `avgMi` em milhões de R$;
 *  o retorno é em R$ absolutos (mesma unidade dos demais campos). */
function burn(avgMi: number, jitter: number[]): BurnPoint[] {
  const labels = ["jul", "ago", "set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun"];
  return labels.map((label, i) => ({ label, value: Math.round((avgMi + (jitter[i] ?? 0)) * 100) / 100 * 1_000_000 }));
}

/* Sprint 1.4 — a Ativa vem do ADAPTADOR do workbook da ORE; as demais
   investidas seguem demonstrativas até a ORE fornecer as planilhas. */
import { ativaPerformance } from "@/adapters/ore-workbook";

export const performanceSnapshots: PerformanceSnapshot[] = [
  ativaPerformance,
  {
    assetId: "c-morroverde", companySlug: "morro-verde", currency: "BRL", ownershipPct: 58, asOf: "2026-06-30",
    valuation: {
      current: mi(890), asOf: "2026-06-30", method: "DCF", investedCapital: mi(520),
      annualSeries: [
        { year: 2022, value: mi(600) }, { year: 2023, value: mi(720) },
        { year: 2024, value: mi(910) }, { year: 2025, value: mi(845) }, { year: 2026, value: mi(890) },
      ],
      history: [
        { asOf: "2026-06-30", value: mi(890), method: "DCF", source: "Comitê de valuation" },
        { asOf: "2025-12-31", value: mi(845), method: "DCF", source: "Auditoria anual" },
        { asOf: "2024-12-31", value: mi(910), method: "Múltiplos", source: "Comitê de valuation" },
      ],
    },
    capital: { committed: mi(600), called: mi(520), availableBalance: mi(41) },
    liquidity: {
      cash: mi(58), contingencies: mi(34), burnMonthly: mi(4.2), burnQuarterly: mi(12.6), burnAnnual: mi(50),
      burnSeries: burn(4.2, [0.5, 0.2, -0.3, 0.4, 0.1, -0.2, 0.6, 0.3, -0.1, 0.2, 0.4, -0.2]),
    },
  },
  {
    assetId: "c-nazareno", companySlug: "nazareno-gold", currency: "BRL", ownershipPct: 44, asOf: "2026-06-30",
    valuation: {
      current: mi(96), asOf: "2026-06-30", method: "Múltiplos", investedCapital: mi(70),
      annualSeries: [
        { year: 2022, value: mi(60) }, { year: 2023, value: mi(72) },
        { year: 2024, value: mi(88) }, { year: 2025, value: mi(90) }, { year: 2026, value: mi(96) },
      ],
      history: [
        { asOf: "2026-06-30", value: mi(96), method: "Múltiplos", source: "Comitê de valuation" },
        { asOf: "2025-12-31", value: mi(90), method: "Múltiplos", source: "Auditoria anual" },
      ],
    },
    capital: { committed: mi(85), called: mi(70), availableBalance: mi(9) },
    liquidity: {
      cash: mi(6), contingencies: mi(3), burnMonthly: mi(1.4), burnQuarterly: mi(4.2), burnAnnual: mi(17),
      burnSeries: burn(1.4, [0.2, -0.1, 0.1, 0.2, -0.2, 0.1, 0.3, -0.1, 0.1, 0.2, -0.1, 0.1]),
    },
  },
  {
    assetId: "c-rionovo", companySlug: "rio-novo", currency: "BRL", ownershipPct: 25, asOf: "2026-06-30",
    valuation: {
      current: mi(64), asOf: "2026-06-30", method: "Custo", investedCapital: mi(60),
      annualSeries: [
        { year: 2022, value: mi(60) }, { year: 2023, value: mi(60) },
        { year: 2024, value: mi(62) }, { year: 2025, value: mi(63) }, { year: 2026, value: mi(64) },
      ],
      history: [
        { asOf: "2026-06-30", value: mi(64), method: "Custo", source: "Acordo Centaurus" },
        { asOf: "2025-12-31", value: mi(63), method: "Custo", source: "Auditoria anual" },
      ],
    },
    capital: { committed: mi(65), called: mi(60), availableBalance: mi(4) },
    liquidity: {
      cash: mi(2), contingencies: mi(1), burnMonthly: mi(0.4), burnQuarterly: mi(1.2), burnAnnual: mi(5),
      burnSeries: burn(0.4, [0.1, 0, 0.1, 0, -0.1, 0.1, 0.1, 0, 0.1, 0, -0.1, 0.1]),
    },
  },
  {
    assetId: "c-alvo", companySlug: "alvo-minerals", currency: "BRL", ownershipPct: 10, asOf: "2026-06-30",
    valuation: {
      current: mi(38), asOf: "2026-06-30", method: "Mercado", investedCapital: mi(55),
      annualSeries: [
        { year: 2022, value: mi(70) }, { year: 2023, value: mi(52) },
        { year: 2024, value: mi(44) }, { year: 2025, value: mi(41) }, { year: 2026, value: mi(38) },
      ],
      history: [
        { asOf: "2026-06-30", value: mi(38), method: "Mercado (marcação a mercado)", source: "Cotação ASX" },
        { asOf: "2025-12-31", value: mi(41), method: "Mercado", source: "Cotação ASX" },
      ],
    },
    capital: { committed: mi(55), called: mi(55), availableBalance: mi(0) },
    liquidity: {
      cash: mi(3), contingencies: mi(2), burnMonthly: mi(0.6), burnQuarterly: mi(1.8), burnAnnual: mi(7),
      burnSeries: burn(0.6, [0.1, -0.1, 0.1, 0.1, -0.1, 0.1, 0.2, -0.1, 0.1, 0.1, -0.1, 0.1]),
    },
  },
  {
    assetId: "c-neeo", companySlug: "neeo-exploration", currency: "BRL", ownershipPct: 70, asOf: "2026-06-30",
    valuation: {
      current: mi(18), asOf: "2026-06-30", method: "Custo", investedCapital: mi(22),
      annualSeries: [
        { year: 2022, value: mi(22) }, { year: 2023, value: mi(21) },
        { year: 2024, value: mi(20) }, { year: 2025, value: mi(19) }, { year: 2026, value: mi(18) },
      ],
      history: [
        { asOf: "2026-06-30", value: mi(18), method: "Custo", source: "Comitê de valuation" },
        { asOf: "2025-12-31", value: mi(19), method: "Custo", source: "Auditoria anual" },
      ],
    },
    capital: { committed: mi(25), called: mi(22), availableBalance: mi(2) },
    liquidity: {
      cash: mi(1), contingencies: mi(1), burnMonthly: mi(0.3), burnQuarterly: mi(0.9), burnAnnual: mi(4),
      burnSeries: burn(0.3, [0, 0.1, 0, 0.1, -0.1, 0, 0.1, 0, 0.1, 0, -0.1, 0.1]),
    },
  },
];
