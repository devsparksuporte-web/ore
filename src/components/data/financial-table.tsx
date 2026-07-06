"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatAccounting, formatPct } from "@/lib/format";
import type { DreLine } from "@/types/domain";
import { cn } from "@/lib/utils";

/**
 * FinancialTable — o componente mais crítico da v1 (doc 06 B6):
 * hierarquia contábil colapsável, números tnum à direita, negativos em
 * parênteses vermelhos, totais em Semibold com borda superior, Δ semântico.
 */
export function FinancialTable({
  lines,
  onLineClick,
  unitLabel = "R$ mil",
}: {
  lines: DreLine[];
  onLineClick?: (line: DreLine) => void;
  unitLabel?: string;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const renderLine = (line: DreLine): React.ReactNode => {
    const hasChildren = !!line.children?.length;
    const isOpen = open[line.id];
    const deviation = line.budget !== 0 ? ((line.actual - line.budget) / Math.abs(line.budget)) * 100 : 0;
    // Favorável: receita acima do orçado OU custo (negativo) menor em módulo
    const favorable = line.budget >= 0 ? line.actual >= line.budget : line.actual >= line.budget;

    return (
      <React.Fragment key={line.id}>
        <tr
          className={cn(
            "border-b transition-colors hover:bg-gray-50/70",
            line.isTotal && "border-t-2 border-t-gray-300 bg-gray-50/50 font-semibold",
            (hasChildren || onLineClick) && "cursor-pointer"
          )}
          onClick={() => (hasChildren ? toggle(line.id) : onLineClick?.(line))}
        >
          <td className="py-2 pr-3 text-body-sm" style={{ paddingLeft: `${12 + line.level * 20}px` }}>
            <span className="inline-flex items-center gap-1.5">
              {hasChildren ? (
                isOpen ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <span className="w-3.5" />
              )}
              {line.label}
            </span>
          </td>
          <td className={cn("px-3 py-2 text-right text-body-sm tnum", line.actual < 0 && "text-danger")}>
            {formatAccounting(line.actual)}
          </td>
          <td className={cn("px-3 py-2 text-right text-body-sm tnum text-muted-foreground")}>
            {formatAccounting(line.budget)}
          </td>
          <td
            className={cn(
              "px-3 py-2 text-right text-body-sm font-medium tnum",
              Math.abs(deviation) < 0.05 ? "text-gray-400" : favorable ? "text-success" : "text-danger"
            )}
          >
            {formatPct(deviation, { signed: true })}
          </td>
        </tr>
        {hasChildren && isOpen && line.children!.map(renderLine)}
      </React.Fragment>
    );
  };

  return (
    <div className="overflow-x-auto rounded-md border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2.5 text-left text-caption font-medium uppercase tracking-wide text-muted-foreground">
              Linha ({unitLabel})
            </th>
            <th className="px-3 py-2.5 text-right text-caption font-medium uppercase tracking-wide text-muted-foreground">Realizado</th>
            <th className="px-3 py-2.5 text-right text-caption font-medium uppercase tracking-wide text-muted-foreground">Orçado</th>
            <th className="px-3 py-2.5 text-right text-caption font-medium uppercase tracking-wide text-muted-foreground">Δ%</th>
          </tr>
        </thead>
        <tbody>{lines.map(renderLine)}</tbody>
      </table>
    </div>
  );
}
