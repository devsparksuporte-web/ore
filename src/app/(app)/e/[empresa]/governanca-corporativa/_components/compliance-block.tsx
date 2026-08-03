"use client";

/**
 * COMPLIANCE — status de cumprimento das obrigações em destaque próprio:
 * % geral (medidor de faixa) + cumpridas/pendentes/vencidas + última
 * atualização e responsável. Responde "existe obrigação vencida?". Reusa
 * <ThresholdMeter/>; não esconde o cumprimento dentro dos contratos.
 */
import { EditorialSection } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { ComplianceData } from "@modules/corporate-governance";
import { cn } from "@/lib/utils";

/** Meta de conformidade (%) — abaixo dela o indicador sinaliza. */
const COMPLIANCE_TARGET = 95;

/**
 * Progresso de conformidade: barra 0–100% com marcador da meta.
 * O julgamento vive no NÚMERO (cor) e na posição da meta — não em pintar a
 * barra inteira, que faria 95% parecer "tudo verde". Preenchimento em navy
 * (institucional); só fica em alerta quando o resultado está abaixo da meta.
 */
function ComplianceBar({ pct }: { pct: number }) {
  const value = Math.max(0, Math.min(100, pct));
  const belowTarget = value < COMPLIANCE_TARGET;
  const tone = value < 80 ? "danger" : belowTarget ? "warning" : "ok";

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-kpi tnum tracking-kpi",
            tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-navy-900"
          )}
        >
          {Math.round(value)}%
        </span>
        <span className="text-body-sm text-gray-500">de conformidade</span>
      </div>

      <div className="relative mt-3 h-1.5 w-full rounded-full bg-gray-100">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            tone === "danger"
              ? "bg-danger"
              : tone === "warning"
                ? "bg-warning"
                : "bg-gradient-to-r from-navy-800 to-navy-900"
          )}
          style={{ width: `${value}%` }}
        />
        {/* Marcador da meta */}
        <span
          aria-hidden
          className="absolute -top-1 h-3.5 w-px bg-copper-500"
          style={{ left: `${COMPLIANCE_TARGET}%` }}
        />
      </div>

      <p className="mt-2 text-caption text-gray-500">
        Meta {COMPLIANCE_TARGET}%{belowTarget ? " · abaixo da meta" : " · meta atingida"}
      </p>
    </div>
  );
}

function Stat({ label, value, danger, first }: { label: string; value: string; danger?: boolean; first?: boolean }) {
  return (
    <div className={cn("px-6", first ? "pl-0" : "border-l")}>
      <p className={cn("font-display text-h2 font-normal leading-none tracking-snug tnum", danger ? "text-danger" : "text-navy-900")}>
        {value}
      </p>
      <p className="mt-2 text-caption text-gray-500">{label}</p>
    </div>
  );
}

export function ComplianceBlock({ compliance, pct }: { compliance: ComplianceData; pct: number }) {
  return (
    <EditorialSection
      title="Compliance"
      meta={`Atualizado ${formatDate(compliance.updatedAt, "short")} · ${compliance.responsible}`}
    >
      <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
          <ComplianceBar pct={pct} />
          <div className="grid grid-cols-3 self-center">
            <Stat first label="Cumpridas" value={`${compliance.fulfilled}/${compliance.total}`} />
            <Stat label="Pendentes" value={String(compliance.pending)} />
            <Stat label="Vencidas" value={String(compliance.overdue)} danger={compliance.overdue > 0} />
          </div>
        </div>
    </EditorialSection>
  );
}
