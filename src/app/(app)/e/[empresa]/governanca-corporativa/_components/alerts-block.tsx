"use client";

/**
 * ALERTAS — centro de ação: itens priorizados (Alta/Média/Baixa) e classificados
 * (Jurídico/Societário/Contratual/Compliance), com responsável e prazo. Responde
 * "onde eu ajo agora?". Reusa <ExecutiveList/> com acento de prioridade; itens
 * derivados no serviço (obrigações vencidas, contratos em risco, riscos).
 */
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ExecutiveList, type ExecutiveListItem } from "@/components/ui";
import type { GovernanceAlert } from "@modules/corporate-governance";
import { alertCategoryLabel, alertPriorityAccent } from "./helpers";

export function AlertsBlock({ alerts }: { alerts: GovernanceAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
        <CardContent>
          <EmptyState kind="all-clear" title="Sem alertas" description="Nenhuma pendência jurídica, contratual ou de compliance exige ação no momento." />
        </CardContent>
      </Card>
    );
  }

  const items: ExecutiveListItem[] = alerts.map((a) => ({
    id: a.id,
    title: a.title,
    accent: alertPriorityAccent[a.priority],
    badges: <Badge variant="outline">{alertCategoryLabel[a.category]}</Badge>,
    summary: a.detail,
    meta: [a.dueLabel, a.owner].filter(Boolean).join(" · ") || undefined,
  }));

  return (
    <Card>
      <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
      <CardContent className="pt-1">
        <ExecutiveList items={items} />
      </CardContent>
    </Card>
  );
}
