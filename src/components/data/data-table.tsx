"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => React.ReactNode;
}

/**
 * DataTable Strata — grid reutilizável: colunas declarativas, clique em linha
 * (abre drawer), export com filtros aplicados (mock: toast).
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  exportable = true,
  footer,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  exportable?: boolean;
  footer?: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <div className="rounded-md border bg-surface">
      {exportable && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs text-muted-foreground tnum">{rows.length} registros</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.success("Exportação XLSX iniciada", { description: "Com os filtros aplicados. Você será notificado ao concluir." })}
          >
            <Download /> Exportar
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.key} className={cn(c.align === "right" && "text-right", c.align === "center" && "text-center")}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-clickable={!!onRowClick} onClick={() => onRowClick?.(row)}>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  className={cn(
                    dense && "py-1.5",
                    c.align === "right" && "text-right tnum",
                    c.align === "center" && "text-center"
                  )}
                >
                  {c.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
