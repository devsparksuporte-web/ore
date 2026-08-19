/**
 * @modules/companies — contexto empresa (M00/M01).
 * O dashboard executivo compõe dados de @modules/financials e
 * @modules/governance via barrels — nunca internals.
 *
 * Fase 6 — passa a expor o DASHBOARD DA INVESTIDA. Até aqui a tela lia
 * `mocks/financeiro.ts` sem receber o slug, e as seis investidas exibiam os
 * mesmos números. Agora a composição vem por investida, do adaptador
 * documental (ADR-029), e é ADAPTATIVA: cada uma mostra os blocos que a sua
 * aba de KPI sustenta, e só eles.
 */
export { getCompanyBySlug } from "@modules/organizations";

import { dashboardDaInvestida, kpiDe, type BlocoDashboard } from "@/adapters/ore-workbook";

export type { BlocoDashboard };

/** Blocos do dashboard desta investida. `undefined` = slug desconhecido. */
export function getDashboardDaInvestida(slug: string): BlocoDashboard[] | undefined {
  return dashboardDaInvestida(slug);
}

/** Nome da investida como a fonte documental a registra. */
export function getNomeDaFonte(slug: string): string | undefined {
  return kpiDe(slug)?.nomeFonte;
}

/** Status de acompanhamento declarado pela Ore no cockpit do workbook. */
export function getStatusDeAcompanhamento(slug: string): string | undefined {
  return kpiDe(slug)?.snapshot.status;
}
