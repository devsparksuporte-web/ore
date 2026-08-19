"use client";

/**
 * TIMELINE — bloco próprio (solicitação explícita do cliente). Consome o
 * componente reutilizável <Timeline/> do DS, mapeando os eventos do port.
 * Nasce com poucos eventos e cresce (rolagem horizontal) sem refatorar.
 *
 * Fase 5.2 — os marcos passam a ser CLICÁVEIS quando a fonte registra mais do
 * que título e data: responsável, alvo, estado e observação abrem no mesmo
 * DetailDrawer usado pelos indicadores, para que aprofundar tenha sempre a
 * mesma forma. Marco sem detalhe na fonte continua texto: não se cria
 * afordância para uma tela que estaria vazia.
 */
import * as React from "react";
import { Badge, DetailDrawer, type DetailDrawerProps, EditorialSection, Timeline } from "@/components/ui";
import type { StrategyEvent, StrategyEventKind } from "@modules/strategy";

const kindLabel: Record<StrategyEventKind, string> = {
  milestone: "Marco", decision: "Decisão", risk: "Risco", delivery: "Entrega",
};
const kindVariant: Record<StrategyEventKind, "navy" | "info" | "danger" | "success"> = {
  milestone: "info", decision: "navy", risk: "danger", delivery: "success",
};
const stateLabel: Record<StrategyEvent["state"], string> = {
  done: "Concluído", current: "Em curso", upcoming: "A realizar",
};

/** Um evento só é clicável se o drawer tiver o que mostrar além do título. */
function temConteudo(e: StrategyEvent): boolean {
  const d = e.detail;
  return Boolean(d && (d.owner || d.target || d.status || d.notes));
}

export function StrategyTimeline({ events }: { events: StrategyEvent[] }) {
  const [detalhe, setDetalhe] = React.useState<DetailDrawerProps | null>(null);

  if (events.length === 0) return null;

  const abrir = (e: StrategyEvent) => () => {
    const d = e.detail ?? {};
    setDetalhe({
      open: true,
      onOpenChange: () => setDetalhe(null),
      kicker: d.category ?? kindLabel[e.kind],
      title: e.title,
      summary: d.notes,
      fields: [
        { label: "Estado", value: d.status ?? stateLabel[e.state] },
        { label: "Alvo", value: d.target ?? e.dateLabel },
        ...(d.owner ? [{ label: "Responsável", value: d.owner }] : []),
        ...(d.category ? [{ label: "Categoria", value: d.category }] : []),
      ],
      source: d.sourceLabel,
      dataStatus: d.dataStatus,
    });
  };

  const items = events.map((e) => ({
    id: e.id,
    dateLabel: e.dateLabel,
    title: e.title,
    state: e.state,
    meta: <Badge variant={kindVariant[e.kind]}>{kindLabel[e.kind]}</Badge>,
    onSelect: temConteudo(e) ? abrir(e) : undefined,
  }));

  return (
    <EditorialSection title="Timeline de execução">
      <Timeline items={items} />
      {detalhe && <DetailDrawer {...detalhe} />}
    </EditorialSection>
  );
}
