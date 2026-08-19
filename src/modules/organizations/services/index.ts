/**
 * PORT de dados do domínio Organizations (portfólio/tenant — M14).
 * Adaptador vigente: mocks locais. Adaptador E5: @modules/api.
 * Consumidores usam APENAS estas funções — nunca @/mocks direto.
 */
import { companies, getCompany as getCompanyRaw } from "@/mocks/companies";
import type { Company, IntegrationStatus } from "@/types/domain";
import {
  coberturaDe, coberturaPorModulo, resumoCobertura, MODULO_LABEL,
  dashboardDoPortfolio, type BlocoDashboard,
  type CoberturaInvestida, type ModuloCrystal,
} from "@/adapters/ore-workbook";

export type { Company, IntegrationStatus };

export function listCompanies(): Company[] {
  return companies;
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return getCompanyRaw(slug);
}

/**
 * Sprint 1.4 · B-01 — o resumo contava integrações ("1 integrada · 2 em
 * implantação"). Nenhuma existe. Passa a contar FONTE DOCUMENTAL, que é o que
 * distingue de fato as investidas hoje. `integratedCount` segue EXPORTADO em
 * `mocks/companies.ts` para quando houver ingestão real — apenas deixou de ser
 * importado aqui, já que nada mais o consome.
 *
 * Fase 5.2 · ORE-51-001 — o resumo deixou de ser tudo-ou-nada. Contar
 * investidas "com fonte" agora daria 6 de 6 e sugeriria cobertura completa,
 * que é falso ao contrário. Quem responde passa a ser a cobertura por módulo.
 */
export function getPortfolioSummary() {
  const financeiro = coberturaPorModulo("financeiro");
  const caixa = coberturaPorModulo("caixa");
  return {
    total: companies.length,
    comFonteReal: companies.filter((c) => c.dataStatus === "REAL").length,
    /** Investidas cujo Financeiro OU Caixa ainda aguarda dados da Ore. */
    aguardandoDados: companies.filter((c) => {
      const cob = coberturaDe(c.slug);
      return !cob || cob.financeiro === "AGUARDANDO_DADOS" || cob.caixa === "AGUARDANDO_DADOS";
    }).length,
    financeiroReal: financeiro.REAL,
    caixaReal: caixa.REAL,
  };
}

/* ── Cobertura documental por módulo (Fase 5.2 · ORE-51-001) ──────────────
   A interface nunca importa o adaptador direto: pergunta ao PORT. Trocar o
   workbook por API significa reapontar estas duas funções e mais nada. */

export type { CoberturaInvestida, ModuloCrystal };
export { MODULO_LABEL };

/** Estado do dado por módulo nesta investida. `undefined` = slug desconhecido. */
export function getCobertura(slug: string): CoberturaInvestida | undefined {
  return coberturaDe(slug);
}

/** Frase curta de cobertura — o que tem fonte e o que ainda falta. */
export function getResumoCobertura(slug: string): string | undefined {
  return coberturaDe(slug) ? resumoCobertura(slug as Parameters<typeof resumoCobertura>[0]) : undefined;
}

/* ── Dashboard geral da Ore (Fase 6) ──────────────────────────────────────
   Cockpit por ativo + posição do fundo, como o próprio workbook mantém.
   A página compõe; quem conhece o documento é o adaptador (ADR-029). */

export type { BlocoDashboard };

export function getDashboardDoPortfolio(): BlocoDashboard[] {
  return dashboardDoPortfolio();
}
