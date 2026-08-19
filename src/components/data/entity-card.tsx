"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeltaIndicator } from "./delta-indicator";
import { Sparkline } from "./sparkline";
import { formatMoney } from "@/lib/format";
import { getCobertura, MODULO_LABEL, type ModuloCrystal } from "@modules/organizations";
import { DATA_STATUS_LABEL, type DataStatus } from "@modules/data-source";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/domain";

/**
 * EntityCard — card de investida (doc 03 §4); grid 24px; micro-hover na seta.
 *
 * Sprint 1.4 · B-01 — os três estados deixaram de ser de INTEGRAÇÃO e passaram
 * a ser de DADO. Antes: "Integrada" abria KPIs; "Em implantação" desenhava uma
 * barra de progresso com go-live estimado; "Sem integração" dizia "Dados ainda
 * não conectados · Integração disponível no plano de implantação". Nada disso
 * existia — não há pipeline, etapa nem cronograma acordado com a ORE.
 * Agora o card mostra KPIs quando existem números com fonte e, quando não
 * existem, declara o estado do dado em vez de desenhar progresso inventado.
 *
 * Fase 5.2 · ORE-51-001 — o card dizia "Sem fonte documental disponibilizada
 * pela ORE" em cinco investidas cujo capital investido, valor justo,
 * participação, série trimestral e mapa estratégico vêm de documento. A frase
 * era falsa. No lugar dela entra a cobertura POR MÓDULO: o que tem fonte, o que
 * ainda aguarda dados e o que os documentos não permitem afirmar.
 */
export function EntityCard({ company }: { company: Company }) {
  const body = (
    <section className="group flex h-full flex-col border-t-2 border-navy-900/85 pt-3.5">
        {/* Topo: identidade */}
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-100 font-display text-xs font-bold text-navy-900">
              {company.shortName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-navy-900">{company.name}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">{company.region}</p>
            </div>
        </div>

        {/* Corpo: números quando há; cobertura documental quando não há */}
        <div className="mt-4 flex-1">
          {company.kpis && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <MiniKpi label="Caixa" value={formatMoney(company.kpis.cash, { compact: true })} />
                <MiniKpi
                  label="Receita mês"
                  value={formatMoney(company.kpis.revenueMonth, { compact: true })}
                  delta={<DeltaIndicator value={company.kpis.revenueDelta} favorable={company.kpis.revenueDelta >= 0} className="text-caption" />}
                />
                <MiniKpi
                  label="OxR"
                  value=""
                  delta={<DeltaIndicator value={company.kpis.oxrDeviation} favorable={false} className="text-body-sm" />}
                />
              </div>
              {company.cashSpark && <Sparkline data={company.cashSpark} className="text-navy-900" />}
            </div>
          )}

          {!company.kpis && <CoverageBreakdown slug={company.slug} />}

          {company.alerts > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-body-sm font-medium text-warning-fg">
              <AlertTriangle className="h-3.5 w-3.5" /> {company.alerts} alertas ativos
            </p>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="navy">{company.commodity}</Badge>
            <span className="text-caption text-muted-foreground tnum">{company.ownershipPct === null ? "participação a definir" : `${company.ownershipPct}%`} · desde {company.investedSince}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-action-600 transition-transform duration-fast ease-standard group-hover:translate-x-0.5" />
        </div>
    </section>
  );

  return (
    <Link
      href={`/e/${company.slug}/overview`}
      className="block h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  );
}

/* ── Cobertura documental por módulo ──────────────────────────────────────
   Agrupada por estado em vez de listada módulo a módulo: três linhas dizem
   mais do que cinco e cabem no card sem competir com a identidade da
   investida. Sem cor nova — os mesmos tokens do SourceCaption. */

const ORDEM_MODULOS: ModuloCrystal[] = ["estrategia", "performance", "valuation", "financeiro", "caixa"];
const ORDEM_ESTADOS: DataStatus[] = ["REAL", "DEMONSTRATIVO", "AGUARDANDO_DADOS", "NAO_DISPONIVEL", "PLANEJADO"];

const dotTone: Record<DataStatus, string> = {
  REAL: "bg-success",
  DEMONSTRATIVO: "bg-warning",
  AGUARDANDO_DADOS: "bg-warning",
  NAO_DISPONIVEL: "bg-gray-300",
  PLANEJADO: "bg-gray-300",
};

function CoverageBreakdown({ slug }: { slug: string }) {
  const cobertura = getCobertura(slug);
  if (!cobertura) return null;

  const grupos = ORDEM_ESTADOS.map((estado) => ({
    estado,
    modulos: ORDEM_MODULOS.filter((m) => cobertura[m] === estado).map((m) => MODULO_LABEL[m]),
  })).filter((g) => g.modulos.length > 0);

  return (
    <dl className="space-y-1.5">
      {grupos.map((g) => (
        <div key={g.estado} className="flex items-baseline gap-2 text-caption">
          <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", dotTone[g.estado])} aria-hidden />
          <dt className="shrink-0 text-gray-500">{DATA_STATUS_LABEL[g.estado]}</dt>
          <dd className="min-w-0 text-navy-900">{g.modulos.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}

function MiniKpi({ label, value, delta }: { label: string; value: string; delta?: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-gray-500">{label}</p>
      {value && <p className="text-body-sm font-semibold tnum text-navy-900">{value}</p>}
      {delta}
    </div>
  );
}
