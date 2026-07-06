/**
 * DashboardLayout · Strata (Sprint 04b)
 * Container padrão de página de conteúdo (dentro do MainLayout):
 * largura, respiro vertical e ritmo entre seções — em um único lugar.
 * Páginas NUNCA repetem "mx-auto max-w-content px-6 py-6 space-y-*".
 */
import * as React from "react";
import { cn } from "@/lib/utils";

const spacings = {
  none: "",
  sm: "space-y-5",
  md: "space-y-6",
  lg: "space-y-8",
  xl: "space-y-10",
} as const;

const paddings = {
  default: "py-6",
  relaxed: "py-8",
  tall: "py-10",
} as const;

const widths = {
  content: "max-w-content", // 1440px (DS §3.1)
  narrow: "max-w-[860px]",  // leitura focada (notificações, formulários longos)
} as const;

export interface DashboardLayoutProps {
  /** Ritmo vertical entre seções (space-y). Padrão: sm (20px). */
  spacing?: keyof typeof spacings;
  /** Respiro vertical do container. Padrão: default (24px). */
  padY?: keyof typeof paddings;
  /** Largura máxima. Padrão: content (1440px). */
  width?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  spacing = "sm", padY = "default", width = "content", className, children,
}: DashboardLayoutProps) {
  return (
    <div className={cn("mx-auto px-6", widths[width], paddings[padY], spacings[spacing], className)}>
      {children}
    </div>
  );
}
