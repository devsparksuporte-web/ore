"use client";

/**
 * MetricStrip · Strata — faixa de indicadores de topo (composição editorial).
 * Números grandes em peso REGULAR (não negrito) com rótulo discreto abaixo,
 * separados por fios verticais — leitura de relatório. Sem caixas: o dado
 * assenta na página. Cor apenas quando há sinal.
 *
 * Agnóstico de domínio: qualquer módulo com 2 a 6 números de topo.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type MetricTone = "default" | "danger" | "warning" | "success";

export interface MetricItem {
  label: string;
  value: string;
  tone?: MetricTone;
  /** Leitura de apoio de uma linha (ex.: "vs. aporte 2,3x"). */
  hint?: string;
  /**
   * Sprint 1.4 — o valor não é um número, e sim a declaração de que a fonte não
   * o forneceu. Renderiza em tipo pequeno e cinza: a ausência precisa ser
   * legível, nunca protagonista. Em 30px, "Não disponibilizado" quebrava em
   * duas linhas e virava o elemento mais chamativo da faixa.
   */
  muted?: boolean;
  /**
   * Sprint 1.4 — drill-down do indicador. Quando existe, a célula inteira vira
   * botão: "o que significa este número?" e "o que fazer a respeito?" passam a
   * ser respondíveis sem sair da tela. Indicador sem contexto extra continua
   * texto, sem afordância falsa.
   */
  onSelect?: () => void;
}

const toneCls: Record<MetricTone, string> = {
  default: "text-navy-900",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

const cols: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

export function MetricStrip({ items, className }: { items: MetricItem[]; className?: string }) {
  const n = Math.min(6, Math.max(2, items.length));
  return (
    <section className={cn("grid grid-cols-2 gap-y-6 border-y py-6", cols[n], className)}>
      {items.map((it, i) => {
        const Cell = it.onSelect ? "button" : "div";
        return (
        <Cell
          key={it.label}
          {...(it.onSelect
            ? { type: "button" as const, onClick: it.onSelect, "aria-haspopup": "dialog" as const,
                "aria-label": `${it.label}: ${it.value}. Ver detalhe` }
            : {})}
          className={cn(
            "px-6 first:pl-0",
            i > 0 && "border-l",
            i % 2 === 0 && "max-sm:border-l-0 max-sm:pl-0",
            it.onSelect &&
              "group cursor-pointer text-left transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <p
            className={cn(
              "font-display font-normal tracking-[-0.02em] tnum",
              it.muted
                ? "text-body-sm leading-6 text-gray-400"
                : cn("text-[30px] leading-none", toneCls[it.tone ?? "default"])
            )}
          >
            {it.value}
          </p>
          <p className={cn("mt-2.5 text-caption text-gray-500", it.onSelect && "group-hover:text-navy-900")}>
            {it.label}
            {it.onSelect && (
              <span aria-hidden className="ml-1 text-gray-300 transition-colors duration-fast group-hover:text-copper-500">→</span>
            )}
          </p>
          {it.hint && <p className="mt-0.5 text-caption tnum text-gray-400">{it.hint}</p>}
        </Cell>
        );
      })}
    </section>
  );
}
