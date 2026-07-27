"use client";

/**
 * ExecutiveList · Strata — componente reutilizável (Sprint 1.3).
 * Índice/lista executiva: linhas com título, selos (badges), resumo de uma a
 * duas linhas, meta à direita e acento de prioridade opcional; clicáveis para
 * detalhe (Drawer) ou ação. Agnóstico de domínio — índice de contratos, centro
 * de alertas, lista de documentos, entidades. Substitui tabelões por leitura
 * editorial. Só tokens/componentes do DS.
 */
import * as React from "react";
import { ChevronRight } from "lucide-react";
import { icon as dsIcon } from "@/design-system";
import { cn } from "@/lib/utils";

export type ExecutiveAccent = "danger" | "warning" | "neutral";

export interface ExecutiveListItem {
  id: string;
  title: string;
  /** Selos à direita do título (ex.: tipo + status, ou categoria). */
  badges?: React.ReactNode;
  summary?: string;
  /** Meta à direita (ex.: prazo · responsável). */
  meta?: React.ReactNode;
  /** Barra de acento à esquerda (prioridade/urgência). */
  accent?: ExecutiveAccent;
  onClick?: () => void;
}

const accentBar: Record<ExecutiveAccent, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  neutral: "bg-gray-300",
};

export function ExecutiveList({ items, className }: { items: ExecutiveListItem[]; className?: string }) {
  return (
    <ul className={cn("divide-y", className)}>
      {items.map((it) => {
        const clickable = !!it.onClick;
        const Row: React.ElementType = clickable ? "button" : "div";
        return (
          <li key={it.id}>
            <Row
              {...(clickable ? { type: "button", onClick: it.onClick } : {})}
              className={cn(
                "group relative flex w-full items-start gap-3 py-3 pl-3 pr-1 text-left",
                clickable && "transition-colors duration-fast hover:bg-gray-50 focus-ring rounded-sm -mx-1 px-4"
              )}
            >
              {it.accent && <span aria-hidden className={cn("absolute inset-y-2 left-0 w-[3px] rounded-full", accentBar[it.accent])} />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate text-body-sm font-medium text-navy-900">{it.title}</span>
                  {it.badges}
                </div>
                {it.summary && <p className="mt-1 line-clamp-2 text-body-sm leading-snug text-gray-500">{it.summary}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3 pt-0.5">
                {it.meta && <span className="hidden text-caption tnum text-gray-500 sm:block">{it.meta}</span>}
                {clickable && (
                  <ChevronRight
                    className="h-icon-sm w-icon-sm text-gray-300 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-action-600"
                    strokeWidth={dsIcon.stroke.regular}
                    aria-hidden
                  />
                )}
              </div>
            </Row>
          </li>
        );
      })}
    </ul>
  );
}
