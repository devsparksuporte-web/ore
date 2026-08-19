import type { AccountMapping, Connection, Notification, User } from "@/types/domain";

/**
 * FONTES DE DADOS do Crystal (Sprint 1.4 · item 3).
 *
 * Antes: catálogo de conectores com saúde, última/próxima sincronização e
 * contagem de registros — narrativa completa de uma integração TOTVS Protheus
 * que nunca existiu. Reprovou a auditoria de aceite.
 *
 * Agora: proveniência. Cada entrada declara o que É a fonte, seu estado e,
 * quando comprovado, quais partes do Crystal a consomem. Nenhum campo de
 * sincronização é preenchido — e não deve voltar a ser enquanto não houver
 * ingestão real.
 *
 * ⚠️ `usedBy` só é preenchido quando a relação está comprovada no código. Os
 * demais documentos do escopo da ORE existem, mas ainda não foram lidos pela
 * plataforma — associá-los a indicadores seria inventar rastreabilidade.
 *
 * Fase 5.2 · ORE-51-009 — o catálogo atribuía o workbook só à Ativa e listava
 * as demais como "sem fonte documental disponibilizada". Falso desde a Sprint
 * 1.5: a aba Base de Dados traz posição, série trimestral e participação das
 * SEIS, e cada investida tem sua própria aba de KPI. As entradas passam a
 * refletir o alcance real de cada documento.
 */
export const connections: Connection[] = [
  {
    id: "cn-1",
    connector: "Workbook de gestão — Ore Mining PE I FIP",
    companyName: "Todas as investidas",
    dataStatus: "REAL",
    detail:
      "Base de Dados, Mapa Estratégico e as abas de KPI de cada investida: tese, riscos, decisões e ações, marcos, capital investido, valor justo, participação, série trimestral e cenários de saída.",
    usedBy: ["Estratégia & Execução", "Performance do Investimento", "Valuation"],
  },
  {
    id: "cn-2",
    connector: "Forecast operacional — Ativa",
    companyName: "Ativa Mineração",
    dataStatus: "REAL",
    detail: "Realizado × orçado por atividade. Sustenta o consumo mensal em Performance.",
    usedBy: ["Performance do Investimento"],
  },
  {
    id: "cn-3",
    connector: "Relatórios trimestrais Q4 2025 e Q1 2026 e Assembleia Geral 2026",
    companyName: "Todas as investidas",
    dataStatus: "REAL",
    detail:
      "Participação, marcos e leitura operacional por investida. O relatório do Q1 2026 sustenta o caixa da Morro Verde, com data-base própria de 31/03/2026.",
    usedBy: ["Performance do Investimento", "Caixa"],
  },
  {
    id: "cn-4",
    connector: "OneDrive corporativo",
    companyName: "Todas as investidas",
    dataStatus: "PLANEJADO",
    detail: "Ingestão automatizada dos documentos da ORE. Não implementada nesta fase.",
  },
  {
    id: "cn-5",
    connector: "TOTVS Protheus",
    companyName: "Todas as investidas",
    dataStatus: "PLANEJADO",
    detail: "Integração com o ERP. Não implementada nesta fase.",
  },
  {
    id: "cn-6",
    connector: "Demonstrações financeiras e extratos de caixa",
    companyName: "Investidas exceto Morro Verde",
    dataStatus: "AGUARDANDO_DADOS",
    detail:
      "Os módulos Financeiro e Caixa dependem destes documentos. Enquanto não chegam, exibem dados demonstrativos.",
  },
];

export const accountMappings: AccountMapping[] = [
  { id: "m1", erpCode: "3.1.1.01.001", erpName: "VENDA CONC TITANIO MI", canonical: "Receita · Concentrado TiO₂", status: "confirmed" },
  { id: "m2", erpCode: "3.1.1.01.002", erpName: "VENDA V2O5 ME", canonical: "Receita · V₂O₅", status: "confirmed" },
  { id: "m3", erpCode: "4.1.2.02.004", erpName: "ENERGIA ELETR PLANTA", canonical: "Custos · Energia elétrica", status: "confirmed" },
  { id: "m4", erpCode: "4.1.2.03.001", erpName: "MANUT MECANICA", canonical: "Custos · Manutenção", status: "confirmed" },
  { id: "m5", erpCode: "4.1.2.03.009", erpName: "MANUT PREDIAL ADM", canonical: "Despesas · Administrativas", status: "suggested", score: 0.82 },
  { id: "m6", erpCode: "4.1.9.01.003", erpName: "DESP DIVERSAS OPER", canonical: null, status: "unmapped" },
  { id: "m7", erpCode: "3.9.1.01.001", erpName: "REC EVENTUAL SUCATA", canonical: null, status: "unmapped" },
  { id: "m8", erpCode: "4.1.2.05.002", erpName: "FRETE RODOV CONC", canonical: "Custos · Frete e logística", status: "confirmed" },
];
export const MAPPING_PROGRESS = { mapped: 218, total: 230 };

export const users: User[] = [
  { id: "u-1", name: "Mauro Barros", email: "mauro@oreinvestments.com.br", roles: ["Sócio / Diretoria"], companies: ["Portfólio (todas)"], lastAccess: "hoje 08:12", status: "active" },
  { id: "u-2", name: "Eduardo Cardoso", email: "eduardo@oreinvestments.com.br", roles: ["Sócio / Diretoria"], companies: ["Portfólio (todas)"], lastAccess: "ontem", status: "active" },
  { id: "u-3", name: "Bruna M. Cruz", email: "bruna@oreinvestments.com.br", roles: ["CFO/Controller"], companies: ["Ativa Mineração"], lastAccess: "hoje 07:40", status: "active" },
  { id: "u-4", name: "Márcio Botaro", email: "marcio@oreinvestments.com.br", roles: ["Super Admin"], companies: ["Tenant"], lastAccess: "hoje 09:05", status: "active" },
  { id: "u-5", name: "Pedro Lopes", email: "pedro@oreinvestments.com.br", roles: ["Gestor de área", "Aprovador"], companies: ["Ativa Mineração"], lastAccess: "ontem", status: "active" },
  { id: "u-6", name: "Rafael Meireles", email: "r.meireles@ativa.com.br", roles: ["Gestor de área", "Aprovador"], companies: ["Ativa Mineração"], lastAccess: "hoje 06:55", status: "active" },
  { id: "u-7", name: "Gustavo Kiefer", email: "gustavo@oreinvestments.com.br", roles: ["Analista do fundo"], companies: ["Portfólio (leitura)"], lastAccess: "—", status: "invited" },
];

export const notifications: Notification[] = [
  { id: "n-1", kind: "alert", title: "Alerta crítico: cobertura de caixa", body: "Projeção da Ativa abaixo de 60 dias em ago/26", time: "2h", read: false, href: "/e/ativa-mineracao/financeiro/fluxo-de-caixa" },
  { id: "n-2", kind: "approval", title: "7 aprovações aguardam você", body: "2 fora do SLA — PC-2214 há 8 dias", time: "3h", read: false, href: "/e/ativa-mineracao/governanca/aprovacoes" },
  { id: "n-3", kind: "publish", title: "Junho/2026 publicado", body: "Snapshot da Ativa disponível para o fundo", time: "ontem", read: true, href: "/e/ativa-mineracao/financeiro/dre" },
  { id: "n-4", kind: "justification", title: "Justificativa enviada", body: "Manutenção +26% — aguardando seu aceite", time: "ontem", read: true, href: "/e/ativa-mineracao/financeiro/oxr" },
  /* Sprint 1.4 · item 3 — removida a notificação "Sincronização concluída ·
     1.204 títulos importados da Ativa · hoje 06:15". Anunciava um evento que
     nunca ocorreu. Não foi substituída: não há evento verdadeiro de ingestão
     a notificar enquanto a atualização das fontes for feita pela própria Ore. */
];
