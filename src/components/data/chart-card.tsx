"use client";

import { MoreHorizontal, Download, Table2, Maximize2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SourceCaption } from "./source-caption";
import { toast } from "sonner";

/**
 * ChartCard Strata (DS §4): título + ação ⋯ (exportar, ver dados, expandir)
 * + corpo + rodapé com origem do dado.
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
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-sm p-1 text-muted-foreground hover:bg-gray-100">
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
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <SourceCaption source={source} />
      </CardFooter>
    </Card>
  );
}
