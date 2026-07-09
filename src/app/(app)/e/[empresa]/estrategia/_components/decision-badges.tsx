/**
 * Badges de domínio de Estratégia & Execução.
 * Reusam exclusivamente o primitivo <Badge/> do Design System (só mapeiam
 * enum → variant + rótulo pt-BR). Nenhum estilo novo é introduzido.
 */
import { Badge } from "@/components/ui";
import type {
  DecisionStatus, DecisionType, Priority, RiskSeverity,
} from "@modules/strategy";

type Variant =
  | "default" | "success" | "warning" | "danger" | "info" | "navy" | "copper" | "outline";

const statusMap: Record<DecisionStatus, { label: string; variant: Variant; dot?: boolean }> = {
  open: { label: "Aberto", variant: "outline", dot: true },
  in_progress: { label: "Em andamento", variant: "info", dot: true },
  done: { label: "Concluído", variant: "success", dot: true },
  blocked: { label: "Bloqueado", variant: "danger", dot: true },
  canceled: { label: "Cancelado", variant: "default", dot: true },
};

const priorityMap: Record<Priority, { label: string; variant: Variant }> = {
  high: { label: "Alta", variant: "danger" },
  medium: { label: "Média", variant: "warning" },
  low: { label: "Baixa", variant: "outline" },
};

const typeMap: Record<DecisionType, { label: string; variant: Variant }> = {
  decision: { label: "Decisão", variant: "navy" },
  action: { label: "Ação", variant: "outline" },
};

const riskMap: Record<RiskSeverity, { label: string; variant: Variant }> = {
  critical: { label: "Crítico", variant: "danger" },
  high: { label: "Alto", variant: "warning" },
  medium: { label: "Médio", variant: "default" },
};

export function StatusBadge({ status }: { status: DecisionStatus }) {
  const s = statusMap[status];
  return <Badge variant={s.variant} dot={s.dot}>{s.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = priorityMap[priority];
  return <Badge variant={p.variant}>{p.label}</Badge>;
}

export function TypeBadge({ type }: { type: DecisionType }) {
  const t = typeMap[type];
  return <Badge variant={t.variant}>{t.label}</Badge>;
}

export function RiskBadge({ severity }: { severity: RiskSeverity }) {
  const r = riskMap[severity];
  return <Badge variant={r.variant} dot>{r.label}</Badge>;
}
