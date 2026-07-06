"use client";

/**
 * InsightCard · Strata (Sprint 04)
 * Leitura executiva do Insight Engine em card independente de layout:
 * severidade → cor/ícone; corpo em linguagem de decisão; ação opcional.
 */
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Info, OctagonAlert, type LucideIcon } from "lucide-react";
import { icon as dsIcon } from "@/design-system";
import { cn } from "@/lib/utils";

export type InsightSeverity = "positive" | "info" | "warning" | "critical";

const severities: Record<InsightSeverity, { icon: LucideIcon; iconCls: string; barCls: string }> = {
  positive: { icon: CheckCircle2, iconCls: "text-success", barCls: "bg-success" },
  info: { icon: Info, iconCls: "text-info", barCls: "bg-info" },
  warning: { icon: AlertTriangle, iconCls: "text-warning", barCls: "bg-warning" },
  critical: { icon: OctagonAlert, iconCls: "text-danger", barCls: "bg-danger" },
};

export interface InsightCardProps {
  severity?: InsightSeverity;
  title: string;
  description?: string;
  /** Rota para investigar o insight (widget clicável). */
  href?: string;
  actionLabel?: string;
  className?: string;
}

export function InsightCard({
  severity = "info", title, description, href, actionLabel = "Investigar", className,
}: InsightCardProps) {
  const s = severities[severity];
  const Icon = s.icon;
  const body = (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-surface p-5 pl-6 shadow-xs",
        "transition-[box-shadow,transform] duration-fast ease-standard",
        href && "hover:-translate-y-px hover:shadow-md",
        className
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1 opacity-80", s.barCls)} />
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-icon-md w-icon-md shrink-0", s.iconCls)} strokeWidth={dsIcon.stroke.regular} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-gray-900">{title}</p>
          {description && <p className="mt-1 text-body-sm leading-5 text-gray-500">{description}</p>}
          {href && (
            <span className="mt-2.5 inline-flex items-center gap-1 text-body-sm font-medium text-action-600">
              {actionLabel}
              <ArrowRight className="h-icon-xs w-icon-xs transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="group block rounded-md focus-ring">{body}</Link> : body;
}
