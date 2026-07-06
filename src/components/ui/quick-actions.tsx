"use client";

/**
 * QuickActions · Strata (Sprint 04)
 * Fileira de ações rápidas (ícone + rótulo) para topos de dashboard.
 * Cada ação: navegação (href) ou comando (onClick). Estados de hover
 * com micro-elevação; desabilitada com motivo em tooltip.
 */
import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { icon as dsIcon } from "@/design-system";
import { cn } from "@/lib/utils";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

function ActionChip({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  const cls = cn(
    "inline-flex items-center gap-2 rounded border bg-surface px-3 py-2 text-body-sm font-medium text-gray-700 shadow-xs",
    "transition-[box-shadow,transform,color] duration-fast ease-standard",
    !action.disabled && "hover:-translate-y-px hover:text-gray-900 hover:shadow-sm active:translate-y-0 active:shadow-xs",
    action.disabled && "cursor-not-allowed opacity-disabled"
  );
  const inner = (
    <>
      <Icon className="h-icon-sm w-icon-sm text-gray-500" strokeWidth={dsIcon.stroke.regular} aria-hidden />
      {action.label}
    </>
  );
  if (action.disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><span className={cls}>{inner}</span></TooltipTrigger>
        <TooltipContent>{action.disabledReason ?? "Indisponível"}</TooltipContent>
      </Tooltip>
    );
  }
  return action.href ? (
    <Link href={action.href} className={cn(cls, "focus-ring")}>{inner}</Link>
  ) : (
    <button type="button" onClick={action.onClick} className={cn(cls, "focus-ring")}>{inner}</button>
  );
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actions.map((a) => <ActionChip key={a.label} action={a} />)}
    </div>
  );
}
