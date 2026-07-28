/**
 * Mapas de APRESENTAÇÃO do módulo Governança (UI only) — enum → rótulo/tom.
 * Não tocam serviço nem mocks.
 */
import type {
  AlertCategory, AlertPriority, ContractStatus, ContractType, LegalEventKind, LegalStatus,
} from "@modules/corporate-governance";
import type { ExecutiveAccent } from "@/components/ui";

/* ── Status jurídico geral ── */
export const legalStatusMeta: Record<LegalStatus, { label: string; dot: string; text: string; tone: "success" | "warning" | "danger" }> = {
  regular: { label: "Regular", dot: "bg-success", text: "text-success", tone: "success" },
  attention: { label: "Atenção", dot: "bg-warning", text: "text-warning", tone: "warning" },
  critical: { label: "Crítico", dot: "bg-danger", text: "text-danger", tone: "danger" },
};

/* ── Contratos ── */
export const contractTypeLabel: Record<ContractType, string> = {
  investment: "Investimento",
  divestment: "Desinvestimento",
  shareholders: "Acordo de acionistas",
  other: "Outro",
};

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default" | "outline" | "navy" | "copper";
export const contractStatusMeta: Record<ContractStatus, { label: string; variant: BadgeVariant }> = {
  fulfilled: { label: "Em cumprimento", variant: "success" },
  pending: { label: "Pendência", variant: "warning" },
  at_risk: { label: "Em risco", variant: "danger" },
  closed: { label: "Encerrado", variant: "default" },
};

/* ── Alertas ── */
export const alertPriorityLabel: Record<AlertPriority, string> = { high: "Alta", medium: "Média", low: "Baixa" };
export const alertPriorityAccent: Record<AlertPriority, ExecutiveAccent> = { high: "danger", medium: "warning", low: "neutral" };
export const alertPriorityVariant: Record<AlertPriority, BadgeVariant> = { high: "danger", medium: "warning", low: "outline" };
export const alertCategoryLabel: Record<AlertCategory, string> = {
  legal: "Jurídico", corporate: "Societário", contractual: "Contratual", compliance: "Compliance",
};
/** Cor por categoria: identifica o domínio de encaminhamento num relance. */
export const alertCategoryVariant: Record<AlertCategory, BadgeVariant> = {
  legal: "default", corporate: "navy", contractual: "info", compliance: "copper",
};

/* ── Timeline jurídica ── */
export const eventKindLabel: Record<LegalEventKind, string> = {
  assembly: "Assembleia", amendment: "Aditivo", termination: "Distrato", decision: "Decisão", notice: "Notificação",
};
export const eventKindVariant: Record<LegalEventKind, BadgeVariant> = {
  assembly: "navy", amendment: "info", termination: "default", decision: "navy", notice: "warning",
};
