"use client";

/**
 * TIMELINE — bloco próprio (solicitação explícita do cliente). Consome o
 * componente reutilizável <Timeline/> do DS, mapeando os eventos do port.
 * Nasce com poucos eventos e cresce (rolagem horizontal) sem refatorar.
 */
import { Badge, Card, CardContent, CardHeader, CardTitle, Timeline } from "@/components/ui";
import type { StrategyEvent, StrategyEventKind } from "@modules/strategy";

const kindLabel: Record<StrategyEventKind, string> = {
  milestone: "Marco", decision: "Decisão", risk: "Risco", delivery: "Entrega",
};
const kindVariant: Record<StrategyEventKind, "navy" | "info" | "danger" | "success"> = {
  milestone: "info", decision: "navy", risk: "danger", delivery: "success",
};

export function StrategyTimeline({ events }: { events: StrategyEvent[] }) {
  if (events.length === 0) return null;
  const items = events.map((e) => ({
    id: e.id,
    dateLabel: e.dateLabel,
    title: e.title,
    state: e.state,
    meta: <Badge variant={kindVariant[e.kind]}>{kindLabel[e.kind]}</Badge>,
  }));
  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>Timeline de execução</CardTitle></CardHeader>
      <CardContent className="pt-2">
        <Timeline items={items} />
      </CardContent>
    </Card>
  );
}
