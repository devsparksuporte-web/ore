"use client";

/**
 * Timeline · Strata — componente reutilizável (Sprint 1.1, refinado 1.3).
 * Rail horizontal de eventos, preparado para crescer (rolagem horizontal
 * quando os eventos passam da largura). Rótulos ALINHADOS À ESQUERDA sob cada
 * nó — leitura editorial e sem quebras órfãs, ao contrário do texto centrado.
 * Só tokens do DS. Estados: done · current · upcoming.
 *
 * Uso: qualquer módulo que precise narrar execução ao longo do tempo.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type TimelineState = "done" | "current" | "upcoming";

export interface TimelineItem {
  id: string;
  dateLabel: string;
  title: string;
  state?: TimelineState;
  /** Selo/etiqueta opcional (ex.: tipo do evento). */
  meta?: React.ReactNode;
  /**
   * Fase 5.2 — drill-down do evento. Quando existe, o bloco de texto do nó
   * vira botão: "o que há por trás deste marco?" passa a ser respondível sem
   * sair da tela. Evento sem detalhe continua texto — sem afordância falsa.
   */
  onSelect?: () => void;
}

const dot: Record<TimelineState, string> = {
  done: "bg-copper-500 border-copper-500",
  current: "bg-surface border-copper-500 ring-4 ring-copper-500/20",
  upcoming: "bg-surface border-gray-300",
};

const dateTone: Record<TimelineState, string> = {
  done: "text-gray-500",
  current: "text-copper-500",
  upcoming: "text-gray-400",
};

/** Bloco de texto do nó — botão quando há drill-down, div quando não há. */
function Bloco({
  item, state, className,
}: { item: TimelineItem; state: TimelineState; className?: string }) {
  const conteudo = (
    <>
      <div className={cn("text-micro tnum", dateTone[state])}>{item.dateLabel}</div>
      <div
        className={cn(
          "mt-0.5 text-body-sm leading-snug",
          state === "upcoming" ? "text-gray-500" : "text-navy-900",
          item.onSelect && "group-hover:text-navy-900"
        )}
      >
        {item.title}
        {item.onSelect && (
          <span aria-hidden className="ml-1 text-gray-300 transition-colors duration-fast group-hover:text-copper-500">→</span>
        )}
      </div>
      {item.meta && <div className="mt-1.5">{item.meta}</div>}
    </>
  );
  if (!item.onSelect) return <div className={className}>{conteudo}</div>;
  return (
    <button
      type="button"
      onClick={item.onSelect}
      aria-haspopup="dialog"
      aria-label={`${item.title}. Ver detalhe`}
      className={className}
    >
      {conteudo}
    </button>
  );
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <ol className="flex min-w-full" role="list">
        {items.map((it, i) => {
          const state = it.state ?? "upcoming";
          const last = i === items.length - 1;
          return (
            <li key={it.id} className="min-w-[172px] flex-1 pr-5">
              {/* Nó + conector (linha à direita, exceto no último) */}
              <div className="relative flex h-2.5 items-center">
                <span
                  className={cn(
                    "relative z-10 block h-2.5 w-2.5 shrink-0 rounded-full border-2",
                    dot[state],
                    // O evento atual "emana" um halo lento — orienta o olho
                    // para o agora sem competir com o conteúdo.
                    state === "current" && "pulse-halo"
                  )}
                  aria-hidden
                />
                {!last && <span className="ml-1 h-px flex-1 bg-gray-200" aria-hidden />}
              </div>

              <Bloco
                item={it}
                state={state}
                className={cn(
                  "mt-2.5",
                  it.onSelect &&
                    "group -mx-2 block w-[calc(100%+1rem)] rounded-sm px-2 py-1 text-left transition-colors duration-fast ease-standard hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
