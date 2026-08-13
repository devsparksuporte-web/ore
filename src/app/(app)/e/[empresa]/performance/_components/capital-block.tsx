"use client";

/**
 * CAPITAL & RETORNO — seção editorial com duas leituras possíveis:
 *
 *  1. Quando a fonte controla capital POR INVESTIDA: barra de composição
 *     (chamado vs não chamado) e os valores em linha.
 *  2. Quando NÃO controla (caso do workbook da ORE, que consolida commitments
 *     no nível do Fundo): a seção não finge — declara a ausência e entrega no
 *     lugar os CENÁRIOS DE SAÍDA, que é o dado real de retorno que a ORE
 *     projeta por ativo. Espaço ocupado com substância, não com estimativa.
 */
import { EditorialSection } from "@/components/ui";
import { formatMoney, formatPct } from "@/lib/format";
import type { CapitalPosition, PerformanceDerived, ReturnScenarios } from "@modules/performance";
import { moicLabel, opcional, SEM_DADO } from "./helpers";
import { cn } from "@/lib/utils";

function Stat({ label, value, hint, first }: { label: string; value: string; hint?: string; first?: boolean }) {
  const vazio = value === SEM_DADO;
  return (
    <div className={cn("px-6", first ? "pl-0" : "border-l")}>
      <p
        className={cn(
          "font-display leading-none tracking-snug tnum",
          vazio ? "text-body-sm font-normal text-gray-400" : "text-h2 font-normal text-navy-900"
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-caption text-gray-500">{label}</p>
      {hint && <p className="mt-0.5 text-caption text-gray-400">{hint}</p>}
    </div>
  );
}

/** Régua de cenários: downside · base · upside, com a marcação atual ancorada. */
function ScenarioScale({ s, currency }: { s: ReturnScenarios; currency: string }) {
  const money = (n: number) => formatMoney(n, { compact: true, currency });
  const span = Math.max(s.upside - Math.min(s.downside, s.current), 1);
  const pos = (n: number) => ((n - Math.min(s.downside, s.current)) / span) * 100;

  return (
    <div>
      <div className="relative h-9" role="img" aria-label={`Cenários de saída: downside ${money(s.downside)}, base ${money(s.base)}, upside ${money(s.upside)}; marcação atual ${money(s.current)}`}>
        <span className="absolute left-0 right-0 top-4 h-px bg-gradient-to-r from-gray-300 via-navy-900/40 to-copper-500/60" />
        {([["downside", s.downside], ["base", s.base], ["upside", s.upside]] as const).map(([k, v]) => (
          <span key={k} className="absolute top-2.5 h-2 w-px bg-gray-400" style={{ left: `${pos(v)}%` }} aria-hidden />
        ))}
        <span
          className="absolute top-[9px] h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-copper-500 bg-surface"
          style={{ left: `${pos(s.current)}%` }}
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {([["Downside", s.downside], ["Base", s.base], ["Upside", s.upside]] as const).map(([label, v], i) => (
          <div key={label} className={cn(i > 0 && "border-l pl-4")}>
            <p className="font-display text-h3 font-normal tracking-snug tnum text-navy-900">{money(v)}</p>
            <p className="mt-1 text-caption text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CapitalBlock({
  capital,
  derived,
  scenarios,
  currency,
}: {
  capital: CapitalPosition;
  derived: PerformanceDerived;
  scenarios?: ReturnScenarios;
  currency: string;
}) {
  const money = (n: number) => formatMoney(n, { compact: true, currency });
  const temCapitalPorInvestida = capital.committed !== null && capital.called !== null;

  /* ── Caso 2: a fonte não controla capital por investida ── */
  if (!temCapitalPorInvestida) {
    return (
      <EditorialSection
        title="Retorno &amp; cenários de saída"
        meta={scenarios ? `Janela ${scenarios.window}` : undefined}
        aside={
          <div>
            <p className="text-caption text-gray-500">Capital investido</p>
            <p className="mt-1.5 font-display text-h2 font-normal leading-none tracking-snug tnum text-navy-900">
              {opcional(capital.invested, money)}
            </p>
            {derived.baseCaseMultiple != null && (
              <>
                <p className="mt-4 text-caption text-gray-500">Múltiplo no cenário base</p>
                <p className="mt-1 font-display text-h3 font-normal tnum text-navy-900">
                  {moicLabel(derived.baseCaseMultiple)}
                </p>
              </>
            )}
            <div className="mt-4 border-t pt-3">
              <p className="text-caption text-gray-500">Posição de capital por investida</p>
              <p className="mt-1 text-caption text-gray-400">{SEM_DADO}</p>
              {capital.unavailableReason && (
                <p className="mt-1.5 text-caption leading-6 text-gray-500">{capital.unavailableReason}</p>
              )}
            </div>
          </div>
        }
      >
        {scenarios ? (
          <>
            <ScenarioScale s={scenarios} currency={currency} />
            <div className="mt-6 space-y-2 border-t pt-4">
              <p className="text-body-sm leading-6 text-gray-700">{scenarios.mechanism}</p>
              {scenarios.buyers && (
                <p className="text-caption leading-6 text-gray-500">Compradores potenciais · {scenarios.buyers}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-body-sm text-gray-500">{SEM_DADO}</p>
        )}
      </EditorialSection>
    );
  }

  /* ── Caso 1: a fonte controla capital por investida ── */
  const calledPct = Math.max(0, Math.min(100, derived.calledPct ?? 0));
  const uncalledPct = 100 - calledPct;

  return (
    <EditorialSection title="Capital &amp; exposição" meta={`Comprometido ${opcional(capital.committed, money)}`}>
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
        <Stat first label="Capital chamado" value={opcional(capital.called, money)} />
        <Stat label="Não chamado" value={opcional(derived.uncalled, money)} hint="obrigação futura" />
        <Stat label="Saldo disponível" value={opcional(capital.availableBalance, money)} />
        <Stat label="Comprometido" value={opcional(capital.committed, money)} />
      </div>
    </EditorialSection>
  );
}
