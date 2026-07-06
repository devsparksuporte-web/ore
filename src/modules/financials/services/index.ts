/**
 * PORT de dados do domínio Financials (M02 caixa · M03 DRE · M04 OxR · M11 forecast).
 * Dono único dos dados financeiros no front (regra doc 04 §3).
 * Adaptador vigente: mocks. Adaptador E5: @modules/api (mesmas assinaturas → Promise).
 */
import {
  ativaKpis, bankAccounts, cashFlow, CASH_MINIMUM, cashTitles, dreTree, forecastSeries,
  operationalKpis, oxrLines, oxrWaterfall, UNMAPPED_ACCOUNTS, upcomingOutflows,
} from "@/mocks/financeiro";
import type { CashPoint, CashTitle, DreLine, KpiData, OxrLine } from "@/types/domain";

export type { CashPoint, CashTitle, DreLine, KpiData, OxrLine };

/* Fluxo de caixa (M02) */
export const getCashFlow = (): CashPoint[] => cashFlow;
export const getCashMinimum = (): number => CASH_MINIMUM;
export const getBankAccounts = () => bankAccounts;
export const getUpcomingOutflows = () => upcomingOutflows;
export const listCashTitles = (): CashTitle[] => cashTitles;

/* DRE (M03) */
export const getDreTree = (): DreLine[] => dreTree;
export const getUnmappedAccountsCount = (): number => UNMAPPED_ACCOUNTS;

/* OxR (M04) */
export const listOxrLines = (): OxrLine[] => oxrLines;
export const getOxrWaterfall = () => oxrWaterfall;

/* Dashboard executivo (M01 — agregados) */
export const getExecutiveKpis = (): KpiData[] => ativaKpis;
export const getOperationalKpis = () => operationalKpis;

/* Forecast (M11) */
export const getForecastSeries = () => forecastSeries;
