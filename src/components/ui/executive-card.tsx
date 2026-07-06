"use client";

/**
 * ExecutiveCard · Strata (Sprint 04)
 * Métrica-herói para leituras de diretoria: rótulo discreto, valor
 * dominante, variação e leitura contextual. Elevation 1→2 no hover.
 * Estados: default · destaque (tone) · com ação (href).
 */
import * as React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { icon as dsIcon } from "@/design-system";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative" | "warning";

export interface ExecutiveCardProps {
  label: string;
  value: string;
  /** Variação formatada (ex.: "+8,4% vs. plano"). Sinal orienta a seta. */
  delta?: string;
  deltaTone?: Tone;
  /** Leitura executiva de uma linha (contexto, nunca só o número). */
  context?: string;
  icon?: LucideIcon;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

const deltaTones: Record<Tone, string> = {
  neutral: "text-gray-500",
  positive: "text-success",
  negative: "text-danger",
  warning: "text-warning",
};

export function ExecutiveCard({
  label, value, delta, deltaTone = "neutral", context, icon: Icon, href, className, children,
}: ExecutiveCardProps) {
  const negative = deltaTone === "negative" || (delta ?? "").trim().startsWith("-");
  const body = (
    <div
      className={cn(
        "group rounded-md border bg-surface p-6 shadow-xs",
        "transition-[box-shadow,transform] duration-fast ease-standard",
        href && "hover:-translate-y-px hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-icon-sm w-icon-sm text-gray-400" strokeWidth={dsIcon.stroke.regular} aria-hidden />}
        <p className="text-label uppercase text-gray-500">{label}</p>
      </div>
      <p className="mt-3 whitespace-nowrap font-display text-kpi text-navy-900 tnum">{value}</p>
      {(delta || context) && (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {delta && (
            <span className={cn("inline-flex items-center gap-0.5 text-body-sm font-medium tnum", deltaTones[deltaTone])}>
              {negative
                ? <ArrowDownRight className="h-icon-xs w-icon-xs" strokeWidth={dsIcon.stroke.bold} aria-hidden />
                : <ArrowUpRight className="h-icon-xs w-icon-xs" strokeWidth={dsIcon.stroke.bold} aria-hidden />}
              {delta}
            </span>
          )}
          {context && <span className="text-caption text-gray-500">{context}</span>}
        </div>
      )}
      {children}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-md focus-ring">{body}</Link>
  ) : body;
}
