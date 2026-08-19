import { Badge } from "@/components/ui/badge";
import { DATA_STATUS_LABEL, type DataStatus } from "@modules/data-source";
import type { OrderStatus } from "@/types/domain";

/**
 * Sprint 1.4 · B-01 — o selo da investida responde "o que está na tela é
 * verdade?", e não "existe pipeline?".
 *
 * Até aqui existia um `IntegrationBadge` que lia `Company.integrationStatus` e
 * escrevia "Integrada" (verde), "Em implantação" (âmbar) e "Sem integração".
 * Nenhuma integração existe — nem para a Ativa. O selo afirmava, na porta de
 * entrada do produto, exatamente a ficção que esta sprint existe para remover.
 *
 * `IntegrationStatus` PERMANECE no domínio (`types/domain.ts`): a capacidade
 * futura não foi removida, apenas deixou de ser renderizada como fato. Quando
 * houver ingestão real, um selo próprio pode voltar — com dado por trás.
 */
const dataStatusVariant: Record<DataStatus, "success" | "warning" | "default"> = {
  REAL: "success",
  DEMONSTRATIVO: "default",
  AGUARDANDO_DADOS: "warning",
  NAO_DISPONIVEL: "default",
  PLANEJADO: "default",
};

export function DataStatusBadge({ status }: { status: DataStatus }) {
  return <Badge variant={dataStatusVariant[status]} dot>{DATA_STATUS_LABEL[status]}</Badge>;
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

/**
 * Selo de período contábil.
 *
 * Fase 5.2 · ORE-51-006 — o selo escrevia "Jun/2026 · Publicado ✓" em verde no
 * topo do DRE e do Overview, sobre demonstrativos que a ORE não forneceu.
 * "Publicado ✓" é uma afirmação de fechamento contábil aprovado: quem lê
 * conclui que aqueles números foram conferidos e liberados. Nenhum foi.
 *
 * A capacidade permanece: quando o período vier de fonte real (`dataStatus`
 * REAL), o selo volta a declarar publicação. Enquanto isso, ele diz o estado
 * do dado — que é a pergunta que o leitor precisa ver respondida ali.
 */
export function PeriodBadge({
  published,
  period,
  dataStatus = "DEMONSTRATIVO",
}: {
  published: boolean;
  /** Rótulo do período (ex.: "Jun/2026"). */
  period?: string;
  /** Estado do dado do período. Sem fonte real, o selo não afirma publicação. */
  dataStatus?: DataStatus;
}) {
  const label = period ?? (published ? "Jun/2026" : "Jul/2026");
  if (dataStatus === "REAL") {
    return (
      <Badge variant={published ? "success" : "warning"} dot>
        {label} · {published ? "Publicado ✓" : "Prévia"}
      </Badge>
    );
  }
  return (
    <Badge variant={dataStatusVariant[dataStatus]} dot>
      {label} · {DATA_STATUS_LABEL[dataStatus]}
    </Badge>
  );
}
