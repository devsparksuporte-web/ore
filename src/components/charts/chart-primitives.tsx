"use client";

/**
 * Primitivos compartilhados de dataviz (v2 premium).
 * Todos os gráficos Strata consomem daqui — tooltip, legenda, gradientes.
 * Nenhum gráfico define visual próprio fora destes primitivos (DoD 3.8).
 */

import * as React from "react";
import { chartColors, gradientIds } from "./chart-tokens";
import { cn } from "@/lib/utils";

/* ── Gradientes discretos (topo ≤10% → 0) — assinatura Stripe/Vercel ── */
export function ChartDefs() {
  return (
    <defs>
      <linearGradient id={gradientIds.navy} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={chartColors.actual} stopOpacity={0.1} />
        <stop offset="100%" stopColor={chartColors.actual} stopOpacity={0} />
      </linearGradient>
      <linearGradient id={gradientIds.blue} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={chartColors.forecast} stopOpacity={0.08} />
        <stop offset="100%" stopColor={chartColors.forecast} stopOpacity={0} />
      </linearGradient>
      <linearGradient id={gradientIds.copper} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={chartColors.target} stopOpacity={0.08} />
        <stop offset="100%" stopColor={chartColors.target} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/* ── Tooltip premium — painel navy "glass", linhas com dot + valor tnum ── */
export interface TooltipRow {
  name: string;
  value: string;
  color?: string;
  dashed?: boolean;
  muted?: boolean;
}

export function PremiumTooltip({
  label,
  rows,
  footer,
}: {
  label?: string;
  rows: TooltipRow[];
  footer?: string;
}) {
  if (!rows.length) return null;
  return (
    <div className="anim-scale-in min-w-[190px] rounded-lg border border-white/[0.12] bg-navy-950/95 px-4 py-3 shadow-overlay backdrop-blur-md">
      {label && (
        <p className="mb-1.5 text-micro font-medium uppercase tracking-wider text-white/50">{label}</p>
      )}
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-caption text-white/70">
              {r.color && (
                <span
                  aria-hidden
                  className={cn("inline-block h-[3px] w-3 rounded-full", r.dashed && "opacity-60")}
                  style={{ backgroundColor: r.color, ...(r.dashed && { backgroundImage: `repeating-linear-gradient(90deg, ${r.color} 0 3px, transparent 3px 5px)` }) }}
                />
              )}
              {r.name}
            </span>
            <span className={cn("text-xs font-semibold tnum text-white", r.muted && "font-normal text-white/60")}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
      {footer && <p className="mt-1.5 border-t border-white/10 pt-1.5 text-micro text-white/40">{footer}</p>}
    </div>
  );
}

/** Adaptador do content do Recharts → PremiumTooltip. */
export function rechartsTooltip(
  mapPayload: (label: string | number | undefined, payload: any[]) => { label?: string; rows: TooltipRow[]; footer?: string } | null
) {
  return function TooltipContent({ active, label, payload }: any) {
    if (!active || !payload?.length) return null;
    const mapped = mapPayload(label, payload);
    if (!mapped) return null;
    return <PremiumTooltip {...mapped} />;
  };
}

/* ── Legenda moderna — flat, fora do SVG, traço demonstrando o estilo ── */
export interface LegendItem {
  label: string;
  color: string;
  style?: "solid" | "dashed" | "dotted" | "area";
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 pt-4", className)} aria-hidden={false}>
      {items.map((it) => (
        <span
          key={it.label}
          className="flex items-center gap-2 text-micro font-medium uppercase tracking-caps text-gray-500 transition-colors duration-fast hover:text-gray-700"
        >
          <LegendSwatch color={it.color} style={it.style ?? "solid"} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function LegendSwatch({ color, style }: { color: string; style: NonNullable<LegendItem["style"]> }) {
  if (style === "area") {
    return (
      <span aria-hidden className="inline-block h-2.5 w-3.5 rounded-[2px]" style={{ background: `linear-gradient(180deg, ${color}26, ${color}05)`, boxShadow: `inset 0 1.5px 0 ${color}` }} />
    );
  }
  const dash = style === "dashed" ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : style === "dotted" ? `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 5px)` : undefined;
  return (
    <span
      aria-hidden
      className="inline-block h-[3px] w-4 rounded-full"
      style={dash ? { backgroundImage: dash } : { backgroundColor: color }}
    />
  );
}
