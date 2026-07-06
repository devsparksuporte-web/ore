import { Badge } from "@/components/ui/badge";
import type { IntegrationStatus, OrderStatus } from "@/types/domain";

const integrationMap: Record<IntegrationStatus, { label: string; variant: "success" | "warning" | "default" }> = {
  integrated: { label: "Integrada", variant: "success" },
  implementing: { label: "Em implantação", variant: "warning" },
  not_integrated: { label: "Sem integração", variant: "default" },
};

export function IntegrationBadge({ status }: { status: IntegrationStatus }) {
  const s = integrationMap[status];
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}

const orderMap: Record<OrderStatus, { label: string; variant: "warning" | "info" | "success" | "default" | "danger" }> = {
  pending_approval: { label: "Aguardando aprovação", variant: "warning" },
  approved: { label: "Aprovado", variant: "info" },
  issued: { label: "Emitido", variant: "info" },
  partially_received: { label: "Receb. parcial", variant: "default" },
  received: { label: "Recebido", variant: "success" },
  canceled: { label: "Cancelado", variant: "danger" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = orderMap[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function PeriodBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="success" dot>Jun/2026 · Publicado ✓</Badge>
  ) : (
    <Badge variant="warning" dot>Jul/2026 · Prévia</Badge>
  );
}
