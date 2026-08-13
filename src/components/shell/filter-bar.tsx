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

      {/* Sprint 1.4 · Data Truth — o selo "Dados atualizados hoje às 06:15"
          foi REMOVIDO. Era um horário fixo em código, exibido em toda tela com
          filtros, afirmando uma sincronização que não existe. Não foi
          substituído por outra data de propósito: frescor de dado é por BLOCO
          (cada um declara sua fonte e data-base via SourceCaption), nunca
          global — um carimbo único no topo mentiria sobre os demais blocos. */}
      <div className="ml-auto flex items-center gap-3">
        {right}
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
