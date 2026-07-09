"use client";

/**
 * Drawer lateral de detalhe da Decisão/Ação. Reusa o <Drawer/> (Sheet) do DS —
 * "a análise nunca perde o lugar" (doc 06 A3). Controlado pela tabela.
 * A seção "evolução" é apenas informativa: comentários, timeline, histórico,
 * auditoria e IA serão ligados no Crystal (não implementados nesta entrega).
 */
import { CalendarClock, Hash, MessagesSquare, User } from "lucide-react";
import {
  Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/components/ui";
import type { Decision } from "@modules/strategy";
import { PriorityBadge, StatusBadge, TypeBadge } from "./decision-badges";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-caption font-medium uppercase tracking-wider text-gray-500">{label}</span>
      <div className="text-body-sm text-gray-800">{children}</div>
    </div>
  );
}

export function DecisionDrawer({
  decision, open, onOpenChange,
}: {
  decision: Decision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent wide>
        {decision && (
          <>
            <DrawerHeader>
              <div className="flex items-center gap-2 pr-8">
                <span className="text-caption tnum text-gray-400">#{decision.ref}</span>
                <TypeBadge type={decision.type} />
              </div>
              <DrawerTitle className="mt-2">{decision.title}</DrawerTitle>
              <p className="mt-1 text-body-sm text-gray-500">{decision.asset.label}</p>
            </DrawerHeader>

            <DrawerBody className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={decision.status} />
                <PriorityBadge priority={decision.priority} />
              </div>

              <Field label="Descrição / Contexto">
                <p className="leading-6">{decision.context}</p>
              </Field>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Responsável">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-gray-400" aria-hidden />{decision.owner}</span>
                </Field>
                <Field label="Data limite">
                  <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-gray-400" aria-hidden />{decision.dueDate}</span>
                </Field>
                <Field label="Ativo">
                  <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-gray-400" aria-hidden />{decision.asset.label}</span>
                </Field>
                <Field label="Última atualização">{decision.lastUpdate}</Field>
              </div>

              {/* Preparado para evolução (Crystal) — não implementado nesta entrega */}
              <div className="rounded-md border border-dashed bg-gray-50 px-4 py-3">
                <span className="flex items-center gap-1.5 text-caption font-medium uppercase tracking-wider text-gray-500">
                  <MessagesSquare className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Evolução do módulo
                </span>
                <p className="mt-1 text-body-sm leading-5 text-gray-500">
                  Comentários, timeline, histórico, aprovação e insights de IA serão habilitados aqui na próxima fase, sem alterar esta visualização.
                </p>
              </div>
            </DrawerBody>

            <DrawerFooter>
              <span className="text-caption text-gray-400">Fonte: workbook de gestão Ore · dado mockado</span>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
