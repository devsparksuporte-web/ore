"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeltaIndicator } from "./delta-indicator";
import { Sparkline } from "./sparkline";
import { SourceCaption } from "./source-caption";
import type { KpiData } from "@/types/domain";
import { cn } from "@/lib/utils";
import { icon as dsIcon, motion as dsMotion } from "@/design-system";

/**
 * KpiCard Strata v1.1 — hierarquia Stripe/Linear/Vercel:
 *   1º o VALOR (display tnum) · 2º o delta semântico · 3º label discreto.
 * Micro-animações contidas: fade+rise 4px na entrada, hover de borda+sombra
 * discreta, seta do drill desliza 2px. Sem efeitos exagerados (P-X7).
 * Dark-ready: apenas tokens semânticos.
 */
export function KpiCard({
  kpi,
  hrefBase,
  icon: Icon,
  className,
}: {
  kpi: KpiData;
  hrefBase?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dsMotion.duration.base / 1000, ease: [0.2, 0, 0, 1] }}
      className={cn(
        "group flex h-full flex-col rounded-md border bg-surface p-6",
        kpi.href &&
          "cursor-pointer transition-[border-color,box-shadow] duration-fast ease-standard hover:border-action-600/70 hover:shadow-sm",
        className
      )}
    >
      {/* Linha 1 — label discreto + ícone/badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-caption font-medium uppercase tracking-wider text-gray-500">
          {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" strokeWidth={dsIcon.stroke.regular} aria-hidden />}
          {kpi.label}
        </span>
        {kpi.badge && <Badge variant="warning">{kpi.badge}</Badge>}
      </div>

      {/* Linha 2 — o protagonista */}
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-kpi tnum tracking-tight text-navy-900">{kpi.value}</div>
          {kpi.subMetric && (
            <div className="mt-1 truncate text-body-sm tnum text-gray-500">{kpi.subMetric}</div>
          )}
          {kpi.delta && (
            <div className="mt-2">
              <DeltaIndicator value={kpi.delta.value} favorable={kpi.delta.favorable} label={kpi.delta.label} />
            </div>
          )}
        </div>
        {kpi.spark && (
          <Sparkline
            data={kpi.spark}
            className="shrink-0 text-navy-900 opacity-70 transition-opacity duration-fast group-hover:opacity-100"
          />
        )}
      </div>

      {/* Rodapé — origem do dado (P-X2) */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <SourceCaption source={kpi.source} />
        {kpi.href && (
          <span
            aria-hidden
            className="text-gray-300 transition-transform duration-fast ease-standard group-hover:translate-x-0.5 group-hover:text-action-600"
          >
            →
          </span>
        )}
      </div>
    </motion.div>
  );

  if (kpi.href && hrefBase)
    return (
      <Link
        href={`${hrefBase}/${kpi.href}`}
        className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  return inner;
}
