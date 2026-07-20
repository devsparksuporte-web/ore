"use client";

/**
 * (Descontinuado na Sprint 1.1) — a leitura de marcos migrou para o bloco
 * próprio <StrategyTimeline/> (componente reutilizável <Timeline/> do DS).
 * Mantido como stub autossuficiente para não quebrar imports legados; não é
 * usado na composição atual da página.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export interface Milestone { id: string; date: string; title: string }

export function NextMilestones({ items }: { items: Milestone[] }) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader><CardTitle>Próximos marcos</CardTitle></CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="flex gap-4">
              <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-copper-500" aria-hidden />
              <div>
                <div className="text-caption font-medium uppercase tracking-wide tnum text-muted-foreground">{m.date}</div>
                <div className="mt-1 text-body-sm text-navy-900">{m.title}</div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
