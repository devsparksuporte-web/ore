"use client";

/**
 * LINHA DO TEMPO JURÍDICA — eventos societários/contratuais no tempo
 * (assembleias, aditivos, distratos, decisões, notificações). Reusa o
 * componente <Timeline/> do DS — mesmo fio condutor de Estratégia e Performance.
 */
import { Badge, Card, CardContent, CardHeader, CardTitle, Timeline } from "@/components/ui";
import type { LegalEvent } from "@modules/corporate-governance";
import { eventKindLabel, eventKindVariant } from "./helpers";

export function LegalTimeline({ events }: { events: LegalEvent[] }) {
  if (events.length === 0) return null;
  const items = events.map((e) => ({
    id: e.id,
    dateLabel: e.dateLabel,
    title: e.title,
    state: e.state,
    meta: <Badge variant={eventKindVariant[e.kind]}>{eventKindLabel[e.kind]}</Badge>,
  }));
  return (
    <Card>
      <CardHeader><CardTitle>Linha do tempo jurídica</CardTitle></CardHeader>
      <CardContent className="pt-2">
        <Timeline items={items} />
      </CardContent>
    </Card>
  );
}
