/**
 * PERFORMANCE DO INVESTIMENTO — origem documental (Sprint 1.5).
 *
 * Este arquivo era um mock: seis snapshots em BRL com valuation, capital,
 * caixa, burn e runway inventados. Os documentos da ORE (workbook de gestão +
 * relatórios trimestrais) trazem cost basis, fair value, ownership, método,
 * série trimestral e cenários de saída para AS SEIS investidas — e não trazem
 * caixa nem consumo por investida (exceto Morro Verde).
 *
 * O arquivo deixa de inventar e passa a reexportar o ADAPTADOR. O nome e o
 * caminho são preservados porque o port `@modules/performance` os consome; o
 * que mudou é a origem do dado.
 *
 * ⚠️ Acesso proibido a partir de componentes — leia SEMPRE via
 * @modules/performance.
 */
import type { PerformanceSnapshot } from "@/modules/performance/types";
import { portfolioPerformance } from "@/adapters/ore-workbook";

export const performanceSnapshots: PerformanceSnapshot[] = portfolioPerformance;
