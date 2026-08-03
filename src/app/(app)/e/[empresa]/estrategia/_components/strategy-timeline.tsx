"use client";

/**
 * TIMELINE — bloco próprio (solicitação explícita do cliente). Consome o
 * componente reutilizável <Timeline/> do DS, mapeando os eventos do port.
 * Nasce com poucos eventos e cresce (rolagem horizontal) sem refatorar.
 */
import { Badge, EditorialSection, Timeline } from "@/components/ui";
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
    <EditorialSection title="Timeline de execução">
        <Timeline items={items} />
    </EditorialSection>
  );
}
