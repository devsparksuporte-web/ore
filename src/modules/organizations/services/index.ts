/**
 * PORT de dados do domínio Organizations (portfólio/tenant — M14).
 * Adaptador vigente: mocks locais. Adaptador E5: @modules/api.
 * Consumidores usam APENAS estas funções — nunca @/mocks direto.
 */
import { companies, getCompany as getCompanyRaw, integratedCount } from "@/mocks/companies";
import type { Company, IntegrationStatus } from "@/types/domain";

export type { Company, IntegrationStatus };

export function listCompanies(): Company[] {
  return companies;
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return getCompanyRaw(slug);
}

export function getPortfolioSummary() {
  return {
    total: companies.length,
    integrated: integratedCount,
    implementing: companies.filter((c) => c.integrationStatus === "implementing").length,
  };
}
