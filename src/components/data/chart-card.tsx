"use client";

import { MoreHorizontal, Download, Table2, Maximize2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SourceCaption } from "./source-caption";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ChartCard Strata — composição editorial: sem moldura fechada. Regra superior
 * ancora o gráfico, título à esquerda, ações à direita e a origem do dado num
 * rodapé com fio. Mesma gramática das seções de relatório.
 */
export function ChartCard({
  title,
  subtitle,
  source,
  children,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  source: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex h-full flex-col border-t-2 border-navy-900/85 pt-3.5", className)}>
      <div className="flex items-start justify-between gap-3 pb-4">
        <div className="min-w-0">
          <h3 className="font-display text-body font-medium tracking-snug text-navy-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-caption text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-sm p-1 text-gray-400 transition-colors duration-fast hover:bg-gray-100 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.success("Exportação iniciada (PNG + XLSX)")}>
                <Download className="h-3.5 w-3.5" /> Exportar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Tabela equivalente — disponível na Fase 4 (acessibilidade)")}>
                <Table2 className="h-3.5 w-3.5" /> Ver dados em tabela
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Modo expandido — em breve")}>
                <Maximize2 className="h-3.5 w-3.5" /> Expandir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <div className="mt-4 border-t pt-2.5">
        <SourceCaption source={source} />
      </div>
    </section>
  );
}
