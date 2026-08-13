"use client";

/**
 * DetailDrawer · Strata (Sprint 1.4) — drill-down genérico da plataforma.
 *
 * "Clicar e entender o que está por trás do número", sem sair da página. Um só
 * componente serve indicador, etapa do caminho crítico, risco, obrigação e
 * alerta — para que aprofundar sempre tenha a MESMA forma, e a interação vire
 * um hábito em vez de uma descoberta por tela.
 *
 * Não é um formulário nem uma segunda página: é a margem do relatório. Reusa o
 * Drawer (Sheet/Radix) do DS, então foco preso, Escape, retorno de foco à
 * origem e semântica de diálogo vêm de graça.
 */
import * as React from "react";
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "./drawer";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: React.ReactNode;
  /** Ocupa a linha inteira (textos longos). */
  wide?: boolean;
}

export interface DetailItem {
  id: string;
  title: string;
  /** Meta curta à direita do título (prazo, alvo, período). */
  meta?: string;
  /** Etiqueta de estado. */
  status?: string;
  /** Tom da etiqueta. */
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  /** Responsável — nome da pessoa antes do cargo (§11 da Sprint 1.4). */
  owner?: string;
  note?: string;
}

export interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rótulo pequeno acima do título (categoria, módulo). */
  kicker?: string;
  title: string;
  /** Uma frase que responde "o que isso significa?". */
  summary?: string;
  fields?: DetailField[];
  /** Lista do que está por trás do número (ex.: as 2 obrigações vencidas). */
  items?: DetailItem[];
  itemsLabel?: string;
  /** Origem do dado — sempre visível: o leitor precisa saber de onde veio. */
  source?: string;
  /** Ação recomendada / o que se espera do leitor. */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const toneCls: Record<NonNullable<DetailItem["tone"]>, string> = {
  neutral: "border-gray-200 text-gray-600",
  success: "border-success/30 text-success-fg",
  warning: "border-warning/40 text-warning-fg",
  danger: "border-danger/30 text-danger-fg",
  info: "border-info/30 text-info-fg",
};

function Field({ label, value, wide }: DetailField) {
  return (
    <div className={cn("space-y-1", wide && "col-span-2")}>
      <span className="text-caption text-gray-500">{label}</span>
      <div className="text-body-sm leading-6 text-gray-800">{value}</div>
    </div>
  );
}

export function DetailDrawer({
  open, onOpenChange, kicker, title, summary, fields, items, itemsLabel, source, action, children,
}: DetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent wide>
        <DrawerHeader>
          {kicker && <span className="text-caption text-copper-500">{kicker}</span>}
          <DrawerTitle className={cn(kicker && "mt-1.5")}>{title}</DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          {summary && <p className="text-body-sm leading-6 text-gray-700">{summary}</p>}

          {fields && fields.length > 0 && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-5">
              {fields.map((f) => <Field key={f.label} {...f} />)}
            </div>
          )}

          {items && items.length > 0 && (
            <div>
              {itemsLabel && (
                <div className="mb-2.5 flex items-baseline justify-between gap-3">
                  <span className="text-caption text-gray-500">{itemsLabel}</span>
                  <span className="text-caption tnum text-gray-400">{items.length}</span>
                </div>
              )}
              <ul className="divide-y border-t">
                {items.map((it) => (
                  <li key={it.id} className="py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-body-sm font-medium text-navy-900">{it.title}</span>
                      {/* Pill discreta: estado é metadado, não manchete. */}
                      {it.status && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-1.5 py-px text-micro font-medium leading-4",
                            toneCls[it.tone ?? "neutral"]
                          )}
                        >
                          {it.status}
                        </span>
                      )}
                    </div>
                    {it.note && <p className="mt-1 text-body-sm leading-6 text-gray-600">{it.note}</p>}
                    {(it.owner || it.meta) && (
                      <p className="mt-1 flex flex-wrap gap-x-4 text-caption text-gray-500">
                        {it.owner && <span>{it.owner}</span>}
                        {it.meta && <span className="tnum">{it.meta}</span>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children}

          {action && (
            <div className="border-l-2 border-copper-500 bg-copper-500/[0.05] py-2 pl-3.5">
              <p className="text-caption text-copper-500">O que se espera</p>
              <div className="mt-1 text-body-sm leading-6 text-gray-800">{action}</div>
            </div>
          )}
        </DrawerBody>

        {source && (
          <DrawerFooter>
            <span className="text-caption text-gray-500">{source}</span>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
