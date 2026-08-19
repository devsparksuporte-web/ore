"use client";

/**
 * DASHBOARD GERAL DA ORE (Fase 6).
 *
 * Espelha o cockpit que a própria Ore mantém no workbook (aba 3) mais a
 * posição do fundo (abas 1 e 4): commitments, capital chamado, valor não
 * realizado, TVPI, composição do portfólio, uso do capital e dry powder.
 *
 * Antes esta tela misturava indicadores documentais com números
 * demonstrativos genéricos — caixa consolidado com variação e minicurva sobre
 * um valor declarado indisponível, receita YTD sem origem por investida.
 * Agora ela mostra o que o fundo registra, e só isso.
 */
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/data/block-renderer";
import { EntityCard } from "@/components/data/entity-card";
import { getDashboardDoPortfolio, listCompanies, getCobertura } from "@modules/organizations";
import { icon as dsIcon } from "@/design-system";

export default function PortfolioOverviewPage() {
  const blocos = getDashboardDoPortfolio();
  const companies = listCompanies();
  const comFinanceiro = companies.filter((c) => getCobertura(c.slug)?.financeiro === "REAL").length;

  return (
    <DashboardLayout spacing="xl" padY="relaxed">
      <PageHeader
        title="Dashboard do Portfólio"
        description="Ore Mining PE I FIP · 6 investidas · data-base 31/12/2025"
      />

      <BlockRenderer blocos={blocos} />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-snug text-navy-900">
              <Building2 className="h-4 w-4 text-gray-400" strokeWidth={dsIcon.stroke.regular} /> Investidas
            </h2>
            <p className="mt-0.5 text-caption text-gray-500">
              Estratégia, Performance e Valuation com fonte documental da Ore · Financeiro e Caixa em {comFinanceiro} delas
            </p>
          </div>
          <Link href="/portfolio/investidas">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((c) => <EntityCard key={c.id} company={c} />)}
        </div>
      </section>
    </DashboardLayout>
  );
}
