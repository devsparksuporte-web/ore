"use client";

/**
 * OrgFlow · Strata — componente reutilizável (Sprint 1.3).
 * Hierarquia vertical de nós conectados (organograma executivo): cada nível
 * com rótulo, valor e apoio, ligados por um conector. Um nó pode ter ênfase
 * (ex.: presidência). Agnóstico de domínio: estrutura de governança, cadeia de
 * escalonamento, etapas de um processo, níveis de aprovação. Só tokens do DS.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface OrgFlowNode {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}

export function OrgFlow({ nodes, className }: { nodes: OrgFlowNode[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {nodes.map((n, i) => (
        <li key={i}>
          <div
            className={cn(
              "rounded-md border px-4 py-2.5 transition-colors duration-fast",
              // Destaque em cobre translúcido: legível em claro E escuro
              // (copper-100 é primitivo que não flipa no dark — nunca usar aqui).
              n.emphasis ? "border-copper-500/35 bg-copper-500/[0.07]" : "bg-surface"
            )}
          >
            <p className="font-display text-base font-semibold tracking-snug text-navy-900">{n.value}</p>
            <p className={cn("mt-0.5 text-caption", n.emphasis ? "text-copper-500" : "text-gray-500")}>{n.label}</p>
            {n.hint && <p className="mt-0.5 text-caption text-gray-400">{n.hint}</p>}
          </div>
          {i < nodes.length - 1 && (
            <div className="flex justify-center py-0.5" aria-hidden>
              <span className="h-3 w-px bg-gray-300" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
