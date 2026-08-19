"use client";

/**
 * DASHBOARD DA INVESTIDA (Fase 6).
 *
 * Antes: esta tela lia `mocks/financeiro.ts` sem receber o slug da empresa —
 * caixa, orçamento, forecast, contas bancárias e KPIs operacionais eram os
 * MESMOS nas seis investidas. Mudavam o nome no cabeçalho, os alertas e os
 * links; os números, não. Uma plataforma de governança não pode atribuir os
 * indicadores de uma empresa a outra.
 *
 * Agora: a composição vem do adaptador documental, por investida, e é
 * ADAPTATIVA — cada uma exibe os blocos que a sua aba de KPI sustenta.
 * Nenhum bloco é preenchido para manter simetria visual.
 *
 * A tela só compõe: quem conhece o documento é o adaptador (ADR-029), e quem
 * decide o que existe é a camada de composição.
 */
import { useParams } from "next/navigation";
import { Badge, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/shell/page-header";
import { DashboardLayout } from "@/components/layouts";
import { BlockRenderer } from "@/components/data/block-renderer";
import {
  getCompanyBySlug, getDashboardDaInvestida, getNomeDaFonte, getStatusDeAcompanhamento,
} from "@modules/companies";
import { getCobertura, MODULO_LABEL, type ModuloCrystal } from "@modules/organizations";
import { DATA_STATUS_LABEL } from "@modules/data-source";

const MODULOS: ModuloCrystal[] = ["estrategia", "performance", "valuation", "financeiro", "caixa"];

export default function CompanyOverviewPage() {
  const { empresa } = useParams<{ empresa: string }>();
  const company = getCompanyBySlug(empresa);
  const companyName = company?.shortName ?? company?.name ?? empresa;

  const blocos = getDashboardDaInvestida(empresa);
  const nomeFonte = getNomeDaFonte(empresa);
  const statusAcompanhamento = getStatusDeAcompanhamento(empresa);
  const cobertura = getCobertura(empresa);

  if (!blocos || blocos.length === 0) {
    return (
      <DashboardLayout spacing="lg">
        <PageHeader
          title="Dashboard Executivo"
          description={companyName}
          badge={<Badge variant="outline">{companyName}</Badge>}
        />
        <EmptyState
          kind="not-configured"
          title="Sem fonte documental para esta investida"
          description="Os documentos disponibilizados pela Ore não trazem indicadores desta empresa. Nada é exibido aqui até que a fonte exista."
        />
      </DashboardLayout>
    );
  }

  /* Cobertura por módulo, no topo: o leitor precisa saber onde há fonte e
     onde ainda não há, ANTES de ler os números. */
  const aguardando = cobertura
    ? MODULOS.filter((m) => cobertura[m] === "AGUARDANDO_DADOS").map((m) => MODULO_LABEL[m])
    : [];

  return (
    <DashboardLayout spacing="xl">
      <PageHeader
        title="Dashboard Executivo"
        description={[nomeFonte, statusAcompanhamento].filter(Boolean).join(" · ")}
        badge={<Badge variant="outline">{companyName}</Badge>}
      />

      {aguardando.length > 0 && (
        <p className="max-w-3xl text-body-sm leading-6 text-gray-500">
          {`${DATA_STATUS_LABEL.REAL} nos blocos abaixo, transcritos do workbook de gestão da Ore. `}
          {aguardando.join(" e ")} {aguardando.length === 1 ? "ainda aguarda" : "ainda aguardam"} dados
          desta investida e {aguardando.length === 1 ? "não aparece" : "não aparecem"} aqui.
        </p>
      )}

      <BlockRenderer blocos={blocos} />
    </DashboardLayout>
  );
}
