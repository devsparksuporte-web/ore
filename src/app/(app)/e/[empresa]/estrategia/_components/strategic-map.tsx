"use client";

/**
 * ESTRATÉGIA DA INVESTIDA — bloco HERO. Narra a evolução da tese (original →
 * atual), o caminho crítico (stepper), os objetivos e a decisão estratégica
 * (callout). Conteúdo mais nobre da página. Só tokens/componentes do DS.
 */
import * as React from "react";
import { DetailDrawer, EditorialSection } from "@/components/ui";
import { SourceCaption } from "@/components/data/source-caption";
import { DATA_STATUS_LABEL } from "@modules/data-source";
import type { CriticalPathStep, StrategicMap } from "@modules/strategy";

/** Tom da etiqueta de status do marco, a partir do texto do workbook. */
function toneDoStatus(status: string) {
  if (status === "Concluído") return "success" as const;
  if (status === "Bloqueado") return "danger" as const;
  if (status === "Em andamento" || status === "Agendado") return "warning" as const;
  return "neutral" as const;
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-body-sm text-gray-500">{children}</div>;
}

function CriticalPath({ steps }: { steps: CriticalPathStep[] }) {
  /* Drill-down (§15): a etapa continua um stepper executivo — quem tem marcos
     por trás vira botão; quem não tem segue como texto, sem afordância falsa. */
  const [aberta, setAberta] = React.useState<CriticalPathStep | null>(null);

  return (
    <>
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((s, i) => {
        const state = s.done ? "done" : s.current ? "current" : "upcoming";
        const temDetalhe = (s.items?.length ?? 0) > 0;
        const Chip = temDetalhe ? "button" : "span";
        return (
          <li key={i} className="flex items-center gap-1">
            <Chip
              {...(temDetalhe
                ? {
                    type: "button" as const,
                    onClick: () => setAberta(s),
                    "aria-haspopup": "dialog" as const,
                    "aria-label": `${s.label} — ver os ${s.items!.length} marcos desta etapa`,
                  }
                : {})}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium " +
                (temDetalhe
                  ? "cursor-pointer transition-colors duration-fast ease-standard hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 "
                  : "") +
                (state === "current"
                  ? "bg-copper-500/[0.12] text-copper-500"
                  : state === "done"
                    ? "bg-navy-100 text-navy-900"
                    : "bg-gray-100 text-gray-500")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (state === "current" ? "bg-copper-500" : state === "done" ? "bg-navy-900" : "bg-gray-300")
                }
                aria-hidden
              />
              {s.label}
            </Chip>
            {i < steps.length - 1 && <span className="text-gray-300" aria-hidden>›</span>}
          </li>
        );
      })}
    </ol>

    <DetailDrawer
      open={aberta !== null}
      onOpenChange={(o) => !o && setAberta(null)}
      kicker="Caminho crítico"
      title={aberta?.label ?? ""}
      summary={
        aberta?.done
          ? "Etapa concluída — todos os marcos que a sustentam estão fechados na fonte."
          : aberta?.current
            ? "Etapa atual: é o primeiro elo ainda aberto do caminho crítico. Enquanto ela não fechar, as seguintes não avançam."
            : "Etapa futura — depende do fechamento das anteriores."
      }
      items={(aberta?.items ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        owner: m.owner,
        meta: `Prazo · ${m.target}`,
        status: m.status,
        tone: toneDoStatus(m.status),
        note: m.notes,
      }))}
      itemsLabel="Marcos desta etapa"
      source="Workbook de gestão · KPI Ativa"
      dataStatus="REAL"
    />
    </>
  );
}

export function StrategyHero({ map }: { map: StrategicMap }) {
  return (
    <EditorialSection title="Estratégia da investida">
      <div className="space-y-6">
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {/* Tese original — o bloco NÃO some quando falta o texto. Omiti-lo
                fazia a investida com dados reais parecer menos documentada que
                as demonstrativas, que exibem uma tese de entrada escrita para
                demonstração: inversão que engana. Some apenas quando a fonte
                não declara nem texto nem estado.

                Quem decide o estado é o ADAPTADOR, nunca esta tela — por isso
                o rótulo sai de `DATA_STATUS_LABEL[map.thesisOriginalStatus]`,
                sem valor padrão. Mesmo espaço, mesma coluna e mesmos tokens da
                Tese atual; ausência em cinza e corpo pequeno, como a
                plataforma já a trata em Performance. */}
            {(map.thesisOriginal || map.thesisOriginalStatus) && (
              <div>
                <Label>Tese original</Label>
                {map.thesisOriginal ? (
                  <p className="max-w-prose text-body-sm leading-6 text-gray-500">{map.thesisOriginal}</p>
                ) : (
                  <div className="max-w-prose">
                    <p className="text-body-sm leading-6 text-gray-400">
                      {DATA_STATUS_LABEL[map.thesisOriginalStatus!]}
                    </p>
                    {map.thesisOriginalUnavailableReason && (
                      <p className="mt-1.5 text-caption leading-6 text-gray-500">
                        {map.thesisOriginalUnavailableReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <Label>Tese atual</Label>
              <p className="max-w-prose text-body-sm leading-6 text-gray-600">{map.thesis}</p>
            </div>
          </div>

          {map.criticalPath && map.criticalPath.length > 0 && (
            <div>
              <Label>Caminho crítico</Label>
              <CriticalPath steps={map.criticalPath} />
            </div>
          )}

          {map.objectives && map.objectives.length > 0 && (
            <div>
              <Label>Objetivos estratégicos</Label>
              <ul className="grid gap-2 sm:grid-cols-2">
                {map.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm leading-snug text-gray-600">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-copper-500/25 bg-copper-500/[0.07] p-4">
            <div className="mb-1.5 text-body-sm text-copper-500">Decisão estratégica</div>
            <p className="max-w-prose text-body-sm font-medium leading-6 text-navy-900">{map.decision}</p>
          </div>

          {/* Sprint 1.5 — origem e estado do bloco, no rodapé, com o mesmo
              SourceCaption dos demais módulos. Sem esta linha, a Estratégia de
              uma investida demonstrativa era indistinguível da de uma real:
              é a lacuna que a auditoria registrou como AUD-003. */}
          {map.source && (
            <div className="border-t pt-3">
              <SourceCaption source={map.source.label} dataStatus={map.dataStatus} />
            </div>
          )}
      </div>
    </EditorialSection>
  );
}
