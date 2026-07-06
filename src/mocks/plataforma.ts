import type { AccountMapping, Connection, Notification, SyncRun, User } from "@/types/domain";

export const connections: Connection[] = [
  { id: "cn-1", connector: "TOTVS Protheus (API)", companyName: "Ativa Mineração", status: "healthy", lastSync: "hoje 06:15", nextSync: "amanhã 05:00", recordsImported: 1_574, detail: "Títulos, lançamentos, pedidos, fornecedores, CCs, filiais" },
  { id: "cn-2", connector: "Planilha — Orçamento", companyName: "Ativa Mineração", status: "healthy", lastSync: "28/jun", recordsImported: 1_118, detail: "Orçamento 2026 v2 (versão ativa)" },
  { id: "cn-3", connector: "Planilha — KPIs operacionais", companyName: "Ativa Mineração", status: "healthy", lastSync: "01/jul", recordsImported: 36, detail: "Produção, teor, disponibilidade — jun/26" },
  { id: "cn-4", connector: "TOTVS Protheus (API)", companyName: "Nazareno Gold", status: "configuring", detail: "Em configuração — etapa 3 de 5 (de-para)" },
  { id: "cn-5", connector: "Planilhas", companyName: "Morro Verde", status: "configuring", detail: "Template enviado, aguardando primeiro arquivo" },
];

export const syncRuns: SyncRun[] = [
  { id: "sr-1", startedAt: "02/07 06:15", duration: "11 min", records: 1_574, status: "success" },
  { id: "sr-2", startedAt: "01/07 06:15", duration: "12 min", records: 1_538, status: "success" },
  { id: "sr-3", startedAt: "30/06 06:15", duration: "14 min", records: 1_602, status: "success" },
  { id: "sr-4", startedAt: "29/06 06:15", duration: "9 min", records: 214, status: "partial", error: "SE2: timeout na página 4 — 38 títulos reprocessados na execução seguinte" },
  { id: "sr-5", startedAt: "28/06 06:15", duration: "12 min", records: 1_490, status: "success" },
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
  { id: "n-5", kind: "sync", title: "Sincronização concluída", body: "1.204 títulos importados da Ativa", time: "hoje 06:15", read: true, href: "/e/ativa-mineracao/config/integracoes" },
];
