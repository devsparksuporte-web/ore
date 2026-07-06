/**
 * SectionHeader · Strata (Sprint 04)
 * Cabeçalho de seção de dashboard/página: título com hierarquia editorial,
 * subtítulo contextual (contagens, período) e slot de ações à direita.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  /** Leitura de apoio: "12 empresas · atualizado hoje 06:15" */
  subtitle?: string;
  /** Nível do título na página (h2 padrão para seções). */
  as?: "h1" | "h2" | "h3";
  /** Ações à direita (botões, filtros, links). */
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, as: Tag = "h2", actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <Tag className="font-display text-h2 tracking-snug text-gray-900">{title}</Tag>
        {subtitle && <p className="mt-0.5 text-body-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
