"use client";

/**
 * WidgetGrid — grid responsivo de 12 colunas com stagger de entrada.
 * Spans declarados no config (mobile-first); classes estáticas para o Tailwind.
 */
import { Widget } from "./registry";
import type { WidgetConfig } from "./types";
import { cn } from "@/lib/utils";

const baseCols: Record<number, string> = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4", 5: "col-span-5", 6: "col-span-6",
  7: "col-span-7", 8: "col-span-8", 9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};
const mdCols: Record<number, string> = {
  1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 5: "md:col-span-5", 6: "md:col-span-6",
  7: "md:col-span-7", 8: "md:col-span-8", 9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12",
};
const xlCols: Record<number, string> = {
  1: "xl:col-span-1", 2: "xl:col-span-2", 3: "xl:col-span-3", 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6",
  7: "xl:col-span-7", 8: "xl:col-span-8", 9: "xl:col-span-9", 10: "xl:col-span-10", 11: "xl:col-span-11", 12: "xl:col-span-12",
};

export function WidgetGrid({ widgets, className }: { widgets: WidgetConfig<any>[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-12 gap-4 xl:gap-6", className)}>
      {widgets.map((w, i) => (
        <div
          key={w.id}
          className={cn(
            baseCols[w.span?.base ?? 12],
            mdCols[w.span?.md ?? w.span?.base ?? 12],
            xlCols[w.span?.xl ?? w.span?.md ?? w.span?.base ?? 12]
          )}
        >
          <Widget config={w} index={i} />
        </div>
      ))}
    </div>
  );
}
