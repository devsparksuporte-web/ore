"use client";

/**
 * ThresholdMeter · Strata — componente reutilizável (Sprint 1.2).
 * Barra horizontal de um valor contra faixas semânticas (crítico/atenção/ok).
 * Agnóstico de domínio: runway, cobertura de caixa, consumo de orçamento,
 * índices de cobertura, SLA. Só tokens do DS. A cor do preenchimento segue a
 * ZONA em que o valor cai (não o sinal aritmético) — julgamento embutido.
 *
 * Convenção das zonas: lista ascendente por `limit`; a primeira cujo `limit`
 * for >= value define a zona atual. Ex. runway:
 *   [{limit:6,tone:'danger'},{limit:12,tone:'warning'},{limit:Infinity,tone:'success'}]
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type MeterTone = "danger" | "warning" | "success" | "neutral";

export interface MeterZone {
  /** Limite superior (exclusivo) desta zona. */
  limit: number;
  tone: MeterTone;
}

/** Preenchimento com gradiente muito discreto (profundidade, não decoração). */
const fill: Record<MeterTone, string> = {
  danger: "bg-gradient-to-r from-danger/85 to-danger",
  warning: "bg-gradient-to-r from-warning/85 to-warning",
  success: "bg-gradient-to-r from-success/85 to-success",
  neutral: "bg-gradient-to-r from-gray-400/85 to-gray-400",
};
const text: Record<MeterTone, string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
  neutral: "text-gray-500",
};

export interface ThresholdMeterProps {
  value: number;
  /** Extensão da trilha (100%). Padrão: 1.5× o maior limite finito. */
  max?: number;
  zones: MeterZone[];
  /** Rótulo do valor exibido (ex.: "8,4 meses"). Se ausente, usa o número. */
  valueLabel?: string;
  /** Legenda curta das faixas (ex.: "crítico < 6m · atenção 6–12m"). */
  caption?: string;
  className?: string;
}

function zoneOf(value: number, zones: MeterZone[]): MeterTone {
  for (const z of zones) if (value < z.limit) return z.tone;
  return zones[zones.length - 1]?.tone ?? "neutral";
}

export function ThresholdMeter({ value, max, zones, valueLabel, caption, className }: ThresholdMeterProps) {
  const finiteLimits = zones.map((z) => z.limit).filter((n) => Number.isFinite(n));
  const scale = max ?? (finiteLimits.length ? Math.max(...finiteLimits) * 1.5 : value * 1.5 || 1);
  const tone = zoneOf(value, zones);
  const pct = Math.max(0, Math.min(100, (value / scale) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn("font-display text-kpi tnum tracking-kpi", text[tone])}>
          {valueLabel ?? value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
        </span>
      </div>
      <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={scale}>
        {/* marcadores de faixa (limites finitos) */}
        {finiteLimits.map((lim, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-0 h-full w-px bg-white"
            style={{ left: `${Math.min(100, (lim / scale) * 100)}%` }}
          />
        ))}
        <span className={cn("block h-full rounded-full transition-[width] duration-base ease-standard", fill[tone])} style={{ width: `${pct}%` }} />
      </div>
      {caption && <p className="mt-2 text-caption text-gray-500">{caption}</p>}
    </div>
  );
}
