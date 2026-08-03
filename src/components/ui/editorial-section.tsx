"use client";

/**
 * EditorialSection · Strata — seção de relatório (Sprint de composição).
 * Substitui o Card em blocos de conteúdo: em vez de moldura fechada, uma
 * REGRA superior firme ancora a seção e o conteúdo assenta na página. Aceita
 * uma coluna de margem (`aside`) para notas laterais — a estrutura de um
 * relatório impresso, não de um dashboard.
 *
 * Agnóstico de domínio. Só tokens do DS.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface EditorialSectionProps {
  title: string;
  /** Metadado à direita do título (fonte, data-base, contagem). */
  meta?: React.ReactNode;
  /** Nota de margem — coluna estreita à direita, separada por fio. */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function EditorialSection({ title, meta, aside, className, children }: EditorialSectionProps) {
  return (
    <section className={cn("border-t-2 border-navy-900/85 pt-3.5", className)}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-body font-medium tracking-snug text-navy-900">{title}</h2>
        {meta && <span className="text-caption tnum text-gray-500">{meta}</span>}
      </div>

      {aside ? (
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_216px]">
          <div className="min-w-0">{children}</div>
          <aside className="lg:border-l lg:pl-6">{aside}</aside>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
