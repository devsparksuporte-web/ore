"use client";

/**
 * COMPLIANCE — status de cumprimento das obrigações em destaque próprio:
 * % geral (medidor de faixa) + cumpridas/pendentes/vencidas + última
 * atualização e responsável. Responde "existe obrigação vencida?". Reusa
 * <ThresholdMeter/>; não esconde o cumprimento dentro dos contratos.
 */
import { Card, CardContent, CardHeader, CardTitle, ThresholdMeter } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { ComplianceData } from "@modules/corporate-governance";

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <p className="text-body-sm text-gray-500">{label}</p>
      <p className={`mt-1 font-display text-h3 font-semibold tnum ${danger ? "text-danger" : "text-navy-900"}`}>{value}</p>
    </div>
  );
}

export function ComplianceBlock({ compliance, pct }: { compliance: ComplianceData; pct: number }) {
  return (
    <Card>
      <CardHeader><CardTitle>Compliance</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <ThresholdMeter
              value={pct}
              max={100}
              zones={[
                { limit: 80, tone: "danger" },
                { limit: 95, tone: "warning" },
                { limit: Infinity, tone: "success" },
              ]}
              valueLabel={`${Math.round(pct)}%`}
              caption="Compliance geral · meta ≥ 95%"
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Cumpridas" value={`${compliance.fulfilled}/${compliance.total}`} />
              <Stat label="Pendentes" value={String(compliance.pending)} />
              <Stat label="Vencidas" value={String(compliance.overdue)} danger={compliance.overdue > 0} />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-body-sm text-gray-500">Última atualização</p>
                <p className="mt-1 text-body-sm tnum text-gray-700">{formatDate(compliance.updatedAt, "short")}</p>
              </div>
              <div>
                <p className="text-body-sm text-gray-500">Responsável</p>
                <p className="mt-1 text-body-sm text-gray-700">{compliance.responsible}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
