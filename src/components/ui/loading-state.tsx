/**
 * LoadingState · Strata (Sprint 04)
 * Estado de carregamento padrão (par do EmptyState): spinner sóbrio +
 * mensagem. Para blocos de conteúdo, preferir Skeleton; LoadingState é
 * para operações (envio, recarga, transição de contexto).
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  /** compact: inline em cards; full: bloco centralizado */
  variant?: "compact" | "full";
  className?: string;
}

export function LoadingState({ message = "Carregando…", variant = "full", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 text-gray-500",
        variant === "full" ? "min-h-[160px] flex-col py-12" : "py-2",
        className
      )}
    >
      <span
        aria-hidden
        className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-action-600"
      />
      <span className="text-body-sm">{message}</span>
    </div>
  );
}
