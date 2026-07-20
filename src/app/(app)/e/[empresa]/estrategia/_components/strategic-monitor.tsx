"use client";

/**
 * MONITORAMENTO ESTRATÉGICO — rail lateral de vigilância: riscos críticos,
 * pontos de atenção (derivados de bloqueios/atrasos) e indicadores-chave.
 * "O que merece atenção?" sem parecer checklist. Só tokens/componentes do DS.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { KeyRisk, RiskSeverity } from "@modules/strategy";
import type { AttentionPoint, Indicator } from "./helpers";

const riskDot: Record<RiskSeverity, string> = { critical: "bg-danger", high: "bg-warning", medium: "bg-gray-400" };
const riskWord: Record<RiskSeverity, string> = { critical: "Crítico", high: "Alto", medium: "Médio" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-caption font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function StrategicMonitor({
  risks, attention, indicators,
}: {
  risks: KeyRisk[];
  attention: AttentionPoint[];
  indicators: Indicator[];
}) {
  return (
    <Card className="anim-rise">
      <CardHeader><CardTitle>Monitoramento estratégico</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <Section title="Riscos-chave">
            <ul className="space-y-2.5">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${riskDot[r.severity]}`} aria-hidden />
                  <span className="text-body-sm leading-snug text-gray-600">
                    {r.label}
                    <span className="ml-1.5 text-caption uppercase tracking-wide text-gray-400">{riskWord[r.severity]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {attention.length > 0 && (
            <Section title="Pontos de atenção">
              <ul className="space-y-2">
                {attention.map((p) => (
                  <li key={p.id} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${p.tone === "danger" ? "bg-danger" : "bg-warning"}`} aria-hidden />
                    <span className="text-body-sm leading-snug text-gray-600">{p.label}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Indicadores">
            <dl className="divide-y">
              {indicators.map((ind) => (
                <div key={ind.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <dt className="text-body-sm text-gray-600">{ind.label}</dt>
                  <dd className="font-display text-base font-semibold tnum text-navy-900">{ind.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </CardContent>
    </Card>
  );
}
