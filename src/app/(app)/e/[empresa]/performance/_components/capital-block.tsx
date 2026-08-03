"use client";

/**
 * CAPITAL & EXPOSIÇÃO — seção editorial: barra de composição (chamado vs não
 * chamado) e os valores em linha, separados por fios. Responde "quanto
 * colocamos e quanto ainda devemos?".
 */
import { EditorialSection } from "@/components/ui";
import { formatMoney, formatPct } from "@/lib/format";
import type { CapitalPosition, PerformanceDerived } from "@modules/performance";
import { cn } from "@/lib/utils";

function Stat({ label, value, hint, first }: { label: string; value: string; hint?: string; first?: boolean }) {
  return (
    <div className={cn("px-6", first ? "pl-0" : "border-l")}>
      <p className="font-display text-h2 font-normal leading-none tracking-snug tnum text-navy-900">{value}</p>
      <p className="mt-2 text-caption text-gray-500">{label}</p>
      {hint && <p className="mt-0.5 text-caption text-gray-400">{hint}</p>}
    </div>
  );
}

export function CapitalBlock({ capital, derived }: { capital: CapitalPosition; derived: PerformanceDerived }) {
  const calledPct = Math.max(0, Math.min(100, derived.calledPct));
  const uncalledPct = 100 - calledPct;

  return (
    <EditorialSection title="Capital &amp; exposição" meta={`Comprometido ${formatMoney(capital.committed, { compact: true })}`}>
      <div className="mb-6">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Composição do capital comprometido">
          <span className="h-full bg-gradient-to-r from-navy-800 to-navy-900" style={{ width: `${calledPct}%` }} />
          <span className="h-full bg-gradient-to-r from-copper-500/80 to-copper-500" style={{ width: `${uncalledPct}%` }} />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-caption text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-navy-900" aria-hidden /> Chamado {formatPct(calledPct, { digits: 0 })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-copper-500" aria-hidden /> Não chamado {formatPct(uncalledPct, { digits: 0 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
        <Stat first label="Capital chamado" value={formatMoney(capital.called, { compact: true })} />
        <Stat label="Não chamado" value={formatMoney(derived.uncalled, { compact: true })} hint="obrigação futura" />
        <Stat label="Saldo disponível" value={formatMoney(capital.availableBalance, { compact: true })} />
        <Stat label="Comprometido" value={formatMoney(capital.committed, { compact: true })} />
      </div>
    </EditorialSection>
  );
}
