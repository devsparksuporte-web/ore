"use client";

/**
 * Controles de visibilidade — menu "•••" por bloco e o aviso de retorno.
 *
 * A linguagem foi escolhida para não induzir a leitura errada: "Ocultar nesta
 * apresentação", nunca "excluir", "remover" ou "restringir". E o aviso de
 * retorno é permanente enquanto houver bloco oculto — quem apresenta precisa
 * saber que a tela está incompleta, e quem recebe a tela também.
 */
import * as React from "react";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVisibility } from "./context";

/** Menu "•••" de um bloco. Não renderiza nada fora de um provider. */
export function BlockMenu({ id, label, className }: { id: string; label: string; className?: string }) {
  const v = useVisibility();
  if (!v.enabled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Opções do bloco ${label}`}
          className={cn(
            "-my-1 rounded-sm p-1 text-gray-300 opacity-0 transition-[color,opacity] duration-fast",
            "hover:text-navy-900 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "group-hover/bloco:opacity-100",
            className
          )}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => v.hide(id, label)}>
          <EyeOff className="h-3.5 w-3.5" /> Ocultar nesta apresentação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Aviso de blocos ocultos. Fica no topo da página enquanto houver algum —
 * uma tela editada não pode parecer uma tela completa.
 */
export function HiddenBlocksNotice({ className }: { className?: string }) {
  const v = useVisibility();
  if (!v.enabled || v.hidden.length === 0) return null;
  const n = v.hidden.length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-dashed bg-gray-50 px-4 py-2.5",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-caption text-gray-600">
        <EyeOff className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        {n === 1 ? "1 bloco oculto nesta apresentação" : `${n} blocos ocultos nesta apresentação`}
      </span>

      <span className="flex flex-wrap items-center gap-1.5">
        {v.hidden.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => v.show(id)}
            className="inline-flex items-center gap-1 rounded-sm border bg-surface px-2 py-0.5 text-caption text-gray-600 transition-colors duration-fast hover:border-action-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eye className="h-3 w-3 text-gray-400" aria-hidden />
            {v.labelOf(id)}
          </button>
        ))}
      </span>

      {n > 1 && (
        <button
          type="button"
          onClick={v.showAll}
          className="text-caption text-action-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mostrar todos
        </button>
      )}

      <span className="w-full text-micro leading-5 text-gray-400">
        Ocultar afeta apenas o que aparece nesta tela, nesta sessão. Não altera,
        apaga nem restringe o acesso a nenhum dado.
      </span>
    </div>
  );
}
