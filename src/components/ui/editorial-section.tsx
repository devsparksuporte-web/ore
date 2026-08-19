"use client";

/**
 * EditorialSection · Strata — seção de relatório (Sprint de composição).
 * Substitui o Card em blocos de conteúdo: em vez de moldura fechada, uma
 * REGRA superior firme ancora a seção e o conteúdo assenta na página. Aceita
 * uma coluna de margem (`aside`) para notas laterais — a estrutura de um
 * relatório impresso, não de um dashboard.
 *
 * Fase 5.2 — a seção passa a ser OCULTÁVEL para apresentação. O menu "•••" só
 * aparece dentro de um PresentationProvider e só quando o ponteiro está sobre
 * o bloco (ou o foco chega nele pelo teclado): o controle existe sem poluir a
 * leitura. Ocultar é composição de tela, não exclusão de dado — a semântica
 * inteira está documentada em @modules/presentation.
 *
 * Agnóstico de domínio. Só tokens do DS.
 */
import * as React from "react";
import { BlockMenu, useVisibility } from "@modules/presentation";
import { cn } from "@/lib/utils";

export interface EditorialSectionProps {
  title: string;
  /** Metadado à direita do título (fonte, data-base, contagem). */
  meta?: React.ReactNode;
  /** Nota de margem — coluna estreita à direita, separada por fio. */
  aside?: React.ReactNode;
  /**
   * Identidade do bloco para mostrar/ocultar. Sem ela, deriva do título — o
   * que basta enquanto os títulos forem únicos na rota. Declare explicitamente
   * quando dois blocos da mesma página puderem se chamar igual.
   */
  blockId?: string;
  /** Bloco que não deve oferecer o controle de ocultar. */
  alwaysVisible?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Identidade estável a partir do título — sem acento, sem espaço. */
function slug(texto: string): string {
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function EditorialSection({
  title, meta, aside, blockId, alwaysVisible, className, children,
}: EditorialSectionProps) {
  const id = blockId ?? `sec-${slug(title)}`;
  const v = useVisibility();

  /* Oculto = fora da composição desta tela. O conteúdo não é alterado nem
     apagado: mostrar de novo devolve o bloco exatamente como estava. */
  if (!alwaysVisible && v.isHidden(id)) return null;

  return (
    <section className={cn("group/bloco border-t-2 border-navy-900/85 pt-3.5", className)}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-body font-medium tracking-snug text-navy-900">{title}</h2>
        <span className="flex items-center gap-2">
          {meta && <span className="text-caption tnum text-gray-500">{meta}</span>}
          {!alwaysVisible && <BlockMenu id={id} label={title} />}
        </span>
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
