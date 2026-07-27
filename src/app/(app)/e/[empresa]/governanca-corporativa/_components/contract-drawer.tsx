"use client";

/**
 * Drawer de RESUMO EXECUTIVO do contrato (não o contrato). Objeto, partes,
 * resumo, principais obrigações, status, responsável, última atualização e
 * próximos eventos. Reusa o <Drawer/> (Sheet) do DS — "a análise nunca perde
 * o lugar" (doc 06 A3).
 */
import { CalendarClock, User } from "lucide-react";
import {
  Badge, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Contract } from "@modules/corporate-governance";
import { contractStatusMeta, contractTypeLabel } from "./helpers";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-caption text-gray-500">{label}</span>
      <div className="text-body-sm text-gray-800">{children}</div>
    </div>
  );
}

export function ContractDrawer({
  contract, open, onOpenChange,
}: {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent wide>
        {contract && (
          <>
            <DrawerHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <Badge variant="outline">{contractTypeLabel[contract.type]}</Badge>
                <Badge variant={contractStatusMeta[contract.status].variant}>{contractStatusMeta[contract.status].label}</Badge>
              </div>
              <DrawerTitle className="mt-2">{contract.name}</DrawerTitle>
            </DrawerHeader>

            <DrawerBody className="space-y-6">
              <Field label="Objeto"><p className="leading-6">{contract.object}</p></Field>
              <Field label="Partes"><p className="leading-6">{contract.parties.join(" · ")}</p></Field>
              <Field label="Resumo executivo"><p className="leading-6">{contract.executiveSummary}</p></Field>

              {contract.keyObligations.length > 0 && (
                <Field label="Principais obrigações">
                  <ul className="mt-1 space-y-1.5">
                    {contract.keyObligations.map((o, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-snug">
                        <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" aria-hidden />
                        {o}
                      </li>
                    ))}
                  </ul>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-5">
                <Field label="Responsável">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-gray-400" aria-hidden />{contract.responsible}</span>
                </Field>
                <Field label="Última atualização">
                  <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-gray-400" aria-hidden />{formatDate(contract.updatedAt, "short")}</span>
                </Field>
              </div>

              {contract.nextEvents.length > 0 && (
                <Field label="Próximos eventos">
                  <ul className="mt-1 space-y-1.5">
                    {contract.nextEvents.map((e, i) => (
                      <li key={i} className="flex items-baseline gap-2.5 leading-snug">
                        <span className="shrink-0 text-caption tnum text-gray-500">{e.dateLabel}</span>
                        <span>{e.title}</span>
                      </li>
                    ))}
                  </ul>
                </Field>
              )}
            </DrawerBody>

            <DrawerFooter>
              <span className="text-caption text-gray-500">Data Room jurídico</span>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
