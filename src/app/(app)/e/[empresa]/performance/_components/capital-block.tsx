"use client";

/**
 * CAPITAL & EXPOSIÇÃO — comprometido, chamado, não chamado e saldo, com uma
 * barra de composição (partes de um todo) que comunica proporção e obrigação
 * futura (dry powder) de relance. Responde "quanto colocamos e quanto devemos?".
 * Barra composta inline com tokens do DS (não é gráfico de dataviz).
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatMoney, formatPct } from "@/lib/format";
import type { CapitalPosition, PerformanceDerived } from "@modules/performance";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-body-sm text-gray-500">{label}</p>
      <p className="mt-1 font-display text-h3 font-semibold tnum text-navy-900">{value}</p>
      {hint && <p className="mt-0.5 text-caption tnum text-gray-400">{hint}</p>}
    </div>
  );
}

export function CapitalBlock({ capital, derived }: { capital: CapitalPosition; derived: PerformanceDerived }) {
  const calledPct = Math.max(0, Math.min(100, derived.calledPct));
  const uncalledPct = 100 - calledPct;
  return (
    <Card>
      <CardHeader><CardTitle>Capital &amp; exposição</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {/* Barra de composição: chamado + não chamado = comprometido */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-body-sm text-gray-500">Comprometido</span>
            <span className="font-display text-body-sm font-semibold tnum text-navy-900">{formatMoney(capital.committed, { compact: true })}</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Composição do capital comprometido">
            <span className="h-full bg-gradient-to-r from-navy-800 to-navy-900" style={{ width: `${calledPct}%` }} />
            <span className="h-full bg-gradient-to-r from-copper-500/80 to-copper-500" style={{ width: `${uncalledPct}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-caption text-gray-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-navy-900" aria-hidden /> Chamado {formatPct(calledPct, { digits: 0 })}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-copper-500" aria-hidden /> Não chamado {formatPct(uncalledPct, { digits: 0 })}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 sm:grid-cols-4">
          <Stat label="Capital chamado" value={formatMoney(capital.called, { compact: true })} />
          <Stat label="Não chamado" value={formatMoney(derived.uncalled, { compact: true })} hint="obrigação futura" />
          <Stat label="Saldo disponível" value={formatMoney(capital.availableBalance, { compact: true })} />
          <Stat label="Comprometido" value={formatMoney(capital.committed, { compact: true })} />
        </div>
      </CardContent>
    </Card>
  );
}
