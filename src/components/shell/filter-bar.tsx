"use client";

import * as React from "react";
import { CalendarDays, Coins, GitCompareArrows, Presentation } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * FilterBar persistente (doc 04 §2): período · comparar com · moeda.
 * "Comparar com" é o referencial ÚNICO da página — trocar atualiza todos os deltas.
 */
export function FilterBar({
  showCompare = true,
  right,
}: {
  showCompare?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 border-b px-6 py-3">
      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
      <Select defaultValue="jun26">
        <SelectTrigger chip>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="jun26">Período: Jun/2026</SelectItem>
          <SelectItem value="mai26">Período: Mai/2026</SelectItem>
          <SelectItem value="ytd">Período: YTD 2026</SelectItem>
          <SelectItem value="ltm">Período: LTM</SelectItem>
        </SelectContent>
      </Select>

      {showCompare && (
        <>
          <GitCompareArrows className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          <Select defaultValue="orcado">
            <SelectTrigger chip>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orcado">Comparar com: Orçado</SelectItem>
              <SelectItem value="forecast">Comparar com: Forecast</SelectItem>
              <SelectItem value="aa">Comparar com: Ano anterior</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      <Coins className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
      <Select defaultValue="brl">
        <SelectTrigger chip>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="brl">Moeda: BRL</SelectItem>
          <SelectItem value="usd">Moeda: USD</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-3">
        {right}
        <span className="hidden items-center gap-1.5 text-caption text-muted-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Dados atualizados hoje às 06:15
        </span>
        <Button
          variant="ghost" size="sm"
          onClick={() => toast.info("Modo apresentação", { description: "Tela cheia com tipografia ampliada — reunião de conselho sem PowerPoint." })}
        >
          <Presentation /> Apresentação
        </Button>
      </div>
    </div>
  );
}
