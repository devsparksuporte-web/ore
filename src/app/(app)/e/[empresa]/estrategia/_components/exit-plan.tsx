"use client";

/**
 * PLANO DE SAÍDA — bloco próprio: estratégia, estágio atual (stepper),
 * próximos passos e horizonte. Fecha a jornada ("Como pretendemos sair?").
 * Simples nesta Sprint, preparado para crescer. Só tokens/componentes do DS.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ExitPlan } from "@modules/strategy";

function Stepper({ stages, current }: { stages: { label: string }[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {stages.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={i} className="flex items-center gap-1.5">
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
            {i < stages.length - 1 && <span className="text-gray-300" aria-hidden>›</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ExitPlanSection({ plan }: { plan: ExitPlan }) {
  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>Plano de saída</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">Estratégia de saída</div>
              <p className="text-body-sm font-medium leading-6 text-navy-900">{plan.strategy}</p>
            </div>
            <div>
              <div className="mb-1.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">Horizonte estimado</div>
              <p className="font-display text-lg font-semibold tnum text-navy-900">{plan.horizon}</p>
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">Estágio atual</div>
            <Stepper stages={plan.stages} current={plan.currentStageIndex} />
          </div>

          {plan.nextSteps.length > 0 && (
            <div>
              <div className="mb-2 text-caption font-medium uppercase tracking-wide text-muted-foreground">Próximos passos</div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {plan.nextSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm leading-snug text-gray-600">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
    </Card>
  );
}
