/**
 * StatusBadge · Strata (Sprint 04)
 * Selo de status genérico com tom semântico (pares AA bg/fg do DS §3.5).
 * Badges de domínio (integração, pedido, período) permanecem em
 * components/data/status-badge.tsx e devem compor este primitivo.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<StatusTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
  info: "bg-info-bg text-info-fg",
};

export interface StatusBadgeProps {
  tone?: StatusTone;
  /** Ponto de cor à esquerda (para listas densas). */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function StatusBadge({ tone = "neutral", dot = false, className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium",
        tones[tone],
        className
      )}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
