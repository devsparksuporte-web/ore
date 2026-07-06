"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, PlugZap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationBadge } from "./status-badge";
import { DeltaIndicator } from "./delta-indicator";
import { Sparkline } from "./sparkline";
import { formatMoney } from "@/lib/format";
import type { Company } from "@/types/domain";

/** EntityCard v1.1 — card de investida com 3 estados (doc 03 §4); grid 24px; micro-hover na seta. */
export function EntityCard({ company }: { company: Company }) {
  const isIntegrated = company.integrationStatus === "integrated";

  const body = (
    <Card interactive={isIntegrated} className="group h-full">
      <CardContent className="flex h-full flex-col p-6">
        {/* Topo: identidade + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-navy-100 font-display text-xs font-bold text-navy-900">
              {company.shortName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-navy-900">{company.name}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">{company.region}</p>
            </div>
          </div>
          <IntegrationBadge status={company.integrationStatus} />
        </div>

        {/* Corpo por estado */}
        <div className="mt-4 flex-1">
          {isIntegrated && company.kpis && (
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
              {company.alerts > 0 && (
                <p className="flex items-center gap-1.5 text-body-sm font-medium text-warning-fg">
                  <AlertTriangle className="h-3.5 w-3.5" /> {company.alerts} alertas ativos
                </p>
              )}
            </div>
          )}

          {company.integrationStatus === "implementing" && company.onboardingStep && (
            <div className="space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${(company.onboardingStep.current / company.onboardingStep.total) * 100}%` }}
                />
              </div>
              <p className="text-body-sm text-gray-700">
                {company.onboardingStep.label} · etapa {company.onboardingStep.current} de {company.onboardingStep.total}
              </p>
              <p className="text-caption text-muted-foreground">go-live estimado: {company.onboardingStep.goLiveEstimate}</p>
            </div>
          )}

          {company.integrationStatus === "not_integrated" && (
            <div className="flex flex-col items-start gap-2 text-body-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><PlugZap className="h-4 w-4" /> Dados ainda não conectados</span>
              <span className="text-caption">Integração disponível no plano de implantação</span>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="navy">{company.commodity}</Badge>
            <span className="text-caption text-muted-foreground tnum">{company.ownershipPct}% · desde {company.investedSince}</span>
          </div>
          {isIntegrated && (
            <ArrowRight className="h-4 w-4 text-action-600 transition-transform duration-fast ease-standard group-hover:translate-x-0.5" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isIntegrated)
    return (
      <Link
        href={`/e/${company.slug}/overview`}
        className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {body}
      </Link>
    );
  return body;
}

function MiniKpi({ label, value, delta }: { label: string; value: string; delta?: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption uppercase tracking-wide text-muted-foreground">{label}</p>
      {value && <p className="text-body-sm font-semibold tnum text-navy-900">{value}</p>}
      {delta}
    </div>
  );
}
