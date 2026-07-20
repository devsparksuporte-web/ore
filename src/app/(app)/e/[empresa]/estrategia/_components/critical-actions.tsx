"use client";

/**
 * AÇÕES CRÍTICAS — bloco independente de leitura rápida (não é tabela densa):
 * as ações prioritárias com responsável, prazo, prioridade e status. Clicar
 * abre o mesmo Drawer de detalhe. Ordena por prioridade e prazo. Só DS.
 */
import * as React from "react";
import { CalendarClock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { icon as dsIcon } from "@/design-system";
import { isDecisionOverdue } from "@modules/strategy";
import type { Decision, Priority } from "@modules/strategy";
import { PriorityBadge, StatusBadge } from "./decision-badges";
import { DecisionDrawer } from "./decision-drawer";

const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function CriticalActions({ actions }: { actions: Decision[] }) {
  const [selected, setSelected] = React.useState<Decision | null>(null);
  const [open, setOpen] = React.useState(false);

  const rows = React.useMemo(
    () =>
      [...actions].sort((a, b) => {
        const p = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (p !== 0) return p;
        return (a.dueDateISO ?? "9999") < (b.dueDateISO ?? "9999") ? -1 : 1;
      }),
    [actions]
  );

  if (rows.length === 0) return null;

  const openRow = (d: Decision) => { setSelected(d); setOpen(true); };

  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>Ações críticas</CardTitle></CardHeader>
      <CardContent className="pt-1">
        <ul className="divide-y">
          {rows.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => openRow(d)}
                className="group flex w-full items-center gap-4 py-3 text-left transition-colors duration-fast hover:bg-gray-50 focus-ring rounded-sm -mx-2 px-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-medium text-navy-900">{d.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-caption text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-icon-xs w-icon-xs text-gray-400" strokeWidth={dsIcon.stroke.regular} aria-hidden />
                      {d.owner}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 tnum ${isDecisionOverdue(d) ? "font-medium text-danger" : ""}`}>
                      <CalendarClock className="h-icon-xs w-icon-xs text-gray-400" strokeWidth={dsIcon.stroke.regular} aria-hidden />
                      {d.dueDate}
                    </span>
                  </span>
                </span>
                <span className="hidden shrink-0 sm:block"><PriorityBadge priority={d.priority} /></span>
                <span className="shrink-0"><StatusBadge status={d.status} /></span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>

      <DecisionDrawer decision={selected} open={open} onOpenChange={setOpen} />
    </Card>
  );
}
