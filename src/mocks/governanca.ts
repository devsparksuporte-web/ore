import type { Alert, AuditEvent, FeedItem, FiscalPeriod } from "@/types/domain";

export const alerts: Alert[] = [
  {
    id: "al-1", severity: "critical", title: "Cobertura de caixa projetada abaixo de 60 dias em ago/26",
    company: "Ativa", companySlug: "ativa-mineracao", timeAgo: "2h",
    action: { label: "Ver caixa", href: "/e/ativa-mineracao/financeiro/fluxo-de-caixa" }, status: "active",
  },
  {
    id: "al-2", severity: "critical", title: "Licença de operação vence em 45 dias",
    company: "Ativa", companySlug: "ativa-mineracao", timeAgo: "1d",
    action: { label: "Ver documento", href: "/e/ativa-mineracao/governanca/auditoria" }, status: "active",
  },
  {
    id: "al-3", severity: "warning", title: "Desvio de custo > 10% em Mineração — jun/26",
    company: "Ativa", companySlug: "ativa-mineracao", timeAgo: "1d",
    action: { label: "Ver OxR", href: "/e/ativa-mineracao/financeiro/oxr" }, status: "active",
  },
  {
    id: "al-4", severity: "warning", title: "3 aprovações paradas há mais de 5 dias",
    company: "Ativa", companySlug: "ativa-mineracao", timeAgo: "3h",
    action: { label: "Ver fila", href: "/e/ativa-mineracao/governanca/aprovacoes" }, status: "active",
  },
  {
    id: "al-5", severity: "warning", title: "Onboarding Nazareno sem avanço há 10 dias (etapa 3/5)",
    company: "Nazareno", timeAgo: "4h",
    action: { label: "Ver integração", href: "/portfolio/investidas" }, status: "active",
  },
];

export const feed: FeedItem[] = [
  { id: "f-1", time: "06:15", kind: "sync", text: "Sincronização Ativa concluída — 1.204 títulos importados", company: "Ativa" },
  { id: "f-2", time: "ontem", kind: "publish", text: "Junho/2026 publicado — snapshot disponível ao fundo", company: "Ativa" },
  { id: "f-3", time: "ontem", kind: "justification", text: "Justificativa enviada — Manutenção +26% (C. Duarte)", company: "Ativa" },
  { id: "f-4", time: "2d", kind: "document", text: "Novo documento: ata do conselho — reunião de mai/26", company: "Ativa" },
  { id: "f-5", time: "3d", kind: "deal", text: "Deal “Projeto Serra Azul” avançou para Due Diligence", company: "Ore" },
  { id: "f-6", time: "3d", kind: "approval", text: "PC-2201 aprovado pelo CFO — Locação escavadeira", company: "Ativa" },
  { id: "f-7", time: "4d", kind: "sync", text: "Template de orçamento enviado à Morro Verde", company: "Morro Verde" },
];

export const auditEvents: AuditEvent[] = [
  { id: "ae-1", occurredAt: "2026-07-01 18:42", actor: "Bruna M. Cruz", action: "periodo.publicar", entity: "Período jun/2026", company: "Ativa", origin: "ui", before: "status: em fechamento", after: "status: publicado · snapshot #s-0626" },
  { id: "ae-2", occurredAt: "2026-07-01 14:30", actor: "C. Duarte", action: "justificativa.enviar", entity: "OxR · Manutenção jun/26", company: "Ativa", origin: "ui", after: "causa: quebra não prevista moinho SAG" },
  { id: "ae-3", occurredAt: "2026-07-01 06:15", actor: "sistema", action: "sync.executar", entity: "Conexão Protheus — Ativa", company: "Ativa", origin: "sync", after: "1.204 títulos · 342 lançamentos · 28 pedidos" },
  { id: "ae-4", occurredAt: "2026-06-30 16:20", actor: "Bruna M. Cruz", action: "alcada.alterar", entity: "Política Compras > 500k", company: "Ativa", origin: "ui", before: "aprovador: CFO", after: "aprovador: CFO + Diretoria Ore (> 1mi)" },
  { id: "ae-5", occurredAt: "2026-06-30 11:05", actor: "Mauro Barros", action: "aprovacao.decidir", entity: "PC-2201 · Locação HeavyMaq", company: "Ativa", origin: "ui", after: "decisão: aprovado" },
  { id: "ae-6", occurredAt: "2026-06-28 09:40", actor: "M. Botaro", action: "usuario.convidar", entity: "g.kiefer@ore… (Analista)", company: "—", origin: "ui" },
  { id: "ae-7", occurredAt: "2026-06-27 08:12", actor: "sistema", action: "alerta.disparar", entity: "Desvio custo > 10% — Mineração", company: "Ativa", origin: "system" },
];

export const fiscalPeriods: FiscalPeriod[] = [
  { month: "Julho/2026", status: "open" },
  { month: "Junho/2026", status: "published", publishedBy: "Bruna M. Cruz", publishedAt: "01/07/2026 18:42" },
  { month: "Maio/2026", status: "published", publishedBy: "Bruna M. Cruz", publishedAt: "05/06/2026 17:10" },
  { month: "Abril/2026", status: "published", publishedBy: "Bruna M. Cruz", publishedAt: "07/05/2026 19:02" },
];

export const pipelineMini = [
  { stage: "Originação", count: 8 },
  { stage: "Análise", count: 5 },
  { stage: "Due Diligence", count: 2, highlight: "Projeto Serra Azul" },
  { stage: "Proposta", count: 1 },
  { stage: "Fechamento", count: 0 },
];

export const milestones = [
  { date: "15/jul", label: "Reunião de conselho — Ativa", kind: "board", upcoming: true },
  { date: "31/jul", label: "Fechamento contábil jul/26 — Ativa", kind: "closing", upcoming: true },
  { date: "ago/26", label: "Go-live integração — Nazareno Gold", kind: "golive", upcoming: true },
  { date: "set/26", label: "Abertura ciclo orçamentário 2027", kind: "budget", upcoming: true },
  { date: "jun/26", label: "Publicação junho — Ativa ✓", kind: "done", upcoming: false },
];
