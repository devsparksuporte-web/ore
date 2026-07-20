"use client";

/**
 * ESTRATÉGIA DA INVESTIDA — bloco HERO. Narra a evolução da tese (original →
 * atual), o caminho crítico (stepper), os objetivos e a decisão estratégica
 * (callout). Conteúdo mais nobre da página. Só tokens/componentes do DS.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { CriticalPathStep, StrategicMap } from "@modules/strategy";

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">{children}</div>;
}

function CriticalPath({ steps }: { steps: CriticalPathStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((s, i) => {
        const state = s.done ? "done" : s.current ? "current" : "upcoming";
        return (
          <li key={i} className="flex items-center gap-1">
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium " +
                (state === "current"
                  ? "bg-copper-100 text-copper-500"
                  : state === "done"
                    ? "bg-navy-100 text-navy-900"
                    : "bg-gray-100 text-gray-500")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (state === "current" ? "bg-copper-500" : state === "done" ? "bg-navy-900" : "bg-gray-300")
                }
                aria-hidden
              />
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="text-gray-300" aria-hidden>›</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function StrategyHero({ map }: { map: StrategicMap }) {
  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>Estratégia da investida</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {map.thesisOriginal && (
              <div>
                <Label>Tese original</Label>
                <p className="max-w-prose text-body-sm leading-6 text-gray-500">{map.thesisOriginal}</p>
              </div>
            )}
            <div>
              <Label>Tese atual</Label>
              <p className="max-w-prose text-body-sm leading-6 text-gray-600">{map.thesis}</p>
            </div>
          </div>

          {map.criticalPath && map.criticalPath.length > 0 && (
            <div>
              <Label>Caminho crítico</Label>
              <CriticalPath steps={map.criticalPath} />
            </div>
          )}

          {map.objectives && map.objectives.length > 0 && (
            <div>
              <Label>Objetivos estratégicos</Label>
              <ul className="grid gap-2 sm:grid-cols-2">
                {map.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm leading-snug text-gray-600">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md bg-copper-100/40 p-4">
            <div className="mb-1.5 text-caption font-medium uppercase tracking-wide text-copper-500">Decisão estratégica</div>
            <p className="max-w-prose text-body-sm font-medium leading-6 text-navy-900">{map.decision}</p>
          </div>
        </CardContent>
    </Card>
  );
}
