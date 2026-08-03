"use client";

/**
 * (Descontinuado na Sprint 1.1) — a leitura de marcos migrou para o bloco
 * próprio <StrategyTimeline/> (componente reutilizável <Timeline/> do DS).
 * Mantido como stub autossuficiente para não quebrar imports legados; não é
 * usado na composição atual da página.
 */
import { EditorialSection } from "@/components/ui";

export interface Milestone { id: string; date: string; title: string }

export function NextMilestones({ items }: { items: Milestone[] }) {
  if (items.length === 0) return null;
  return (
    <EditorialSection title="Próximos marcos">
      <ol className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className="flex gap-4">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" aria-hidden />
            <div>
              <div className="text-caption tnum text-gray-500">{m.date}</div>
              <div className="mt-0.5 text-body-sm text-navy-900">{m.title}</div>
            </div>
          </li>
        ))}
      </ol>
    </EditorialSection>
  );
}
