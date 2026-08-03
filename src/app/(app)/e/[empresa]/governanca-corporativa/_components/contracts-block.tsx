"use client";

/**
 * DOCUMENTOS — índice executivo (não tabelão): nome + tipo + status + resumo de
 * uma linha; clicar abre o Drawer com o resumo executivo. Responde "quais
 * documentos exigem atenção?". Abrange contratos e demais instrumentos
 * societários. Reusa <ExecutiveList/> + Drawer.
 */
import * as React from "react";
import { Badge, EditorialSection, ExecutiveList, type ExecutiveListItem } from "@/components/ui";
import type { Contract } from "@modules/corporate-governance";
import { contractStatusMeta, contractTypeLabel } from "./helpers";
import { ContractDrawer } from "./contract-drawer";

export function ContractsBlock({ contracts }: { contracts: Contract[] }) {
  const [selected, setSelected] = React.useState<Contract | null>(null);
  const [open, setOpen] = React.useState(false);

  const items: ExecutiveListItem[] = contracts.map((c) => ({
    id: c.id,
    title: c.name,
    badges: (
      <>
        <Badge variant="outline">{contractTypeLabel[c.type]}</Badge>
        <Badge variant={contractStatusMeta[c.status].variant}>{contractStatusMeta[c.status].label}</Badge>
      </>
    ),
    summary: c.executiveSummary,
    onClick: () => { setSelected(c); setOpen(true); },
  }));

  return (
    <EditorialSection title="Documentos">
        <ExecutiveList items={items} />
      <ContractDrawer contract={selected} open={open} onOpenChange={setOpen} />
    </EditorialSection>
  );
}
