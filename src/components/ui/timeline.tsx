"use client";

/**
 * Timeline · Strata — componente reutilizável da plataforma (Sprint 1.1).
 * Rail horizontal de eventos, preparado para crescer (rolagem horizontal
 * quando os eventos passam da largura). Só tokens do DS; sem dependência de
 * domínio — recebe itens genéricos. Estados: done · current · upcoming.
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
}

const dot: Record<TimelineState, string> = {
  done: "bg-copper-500 border-copper-500",
  current: "bg-surface border-copper-500 ring-4 ring-copper-100",
  upcoming: "bg-surface border-gray-300",
};

const dateTone: Record<TimelineState, string> = {
  done: "text-gray-500",
  current: "text-copper-500",
  upcoming: "text-gray-400",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <ol className="flex min-w-full gap-0" role="list">
        {items.map((it, i) => {
          const state = it.state ?? "upcoming";
          const first = i === 0;
          const last = i === items.length - 1;
          return (
            <li key={it.id} className="relative flex min-w-[168px] flex-1 flex-col px-1">
              {/* Linha + nó */}
              <div className="relative flex h-5 items-center">
                <span className={cn("absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 bg-gray-200", first && "opacity-0")} aria-hidden />
                <span className={cn("absolute right-0 top-1/2 h-px w-1/2 -translate-y-1/2 bg-gray-200", last && "opacity-0")} aria-hidden />
                <span className={cn("relative z-10 mx-auto block h-2.5 w-2.5 rounded-full border-2", dot[state])} aria-hidden />
              </div>
              {/* Rótulos */}
              <div className="mt-2.5 text-center">
                <div className={cn("text-micro font-medium uppercase tracking-overline tnum", dateTone[state])}>{it.dateLabel}</div>
                <div className={cn("mx-auto mt-1 max-w-[150px] text-body-sm leading-snug", state === "upcoming" ? "text-gray-500" : "text-navy-900")}>
                  {it.title}
                </div>
                {it.meta && <div className="mt-1.5 flex justify-center">{it.meta}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
