"use client";

/**
 * AÇÕES REQUERIDAS — centro de ação: itens priorizados (acento à esquerda) e
 * classificados por domínio (selo colorido), com prazo e responsável em coluna
 * própria. Responde "onde eu ajo agora?". Itens e prioridades derivados no
 * serviço (obrigações vencidas e A VENCER, contratos em risco, riscos-chave).
 */
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import type { GovernanceAlert } from "@modules/corporate-governance";
import { alertCategoryLabel, alertCategoryVariant, alertPriorityLabel } from "./helpers";
import { cn } from "@/lib/utils";

/** Acento de prioridade — cor + posição fixa (não depende só da cor). */
const accent: Record<GovernanceAlert["priority"], string> = {
  high: "bg-danger",
  medium: "bg-warning",
  low: "bg-gray-300",
};

/** Tom do prazo: vencido em danger, a vencer em warning, demais neutro. */
function dueTone(due?: string) {
  if (!due) return "text-gray-500";
  if (due.startsWith("Venceu")) return "text-danger";
  if (due.startsWith("Vence")) return "text-warning";
  return "text-gray-500";
}

export function AlertsBlock({ alerts }: { alerts: GovernanceAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Ações requeridas</CardTitle></CardHeader>
        <CardContent>
          <EmptyState kind="all-clear" title="Nenhuma ação pendente" description="Não há obrigações, documentos ou riscos exigindo tratativa no momento." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Ações requeridas</CardTitle></CardHeader>
      <CardContent className="pt-1">
        <ul className="divide-y">
          {alerts.map((a) => (
            <li key={a.id} className="relative flex items-start gap-4 py-3.5 pl-4">
              <span aria-hidden className={cn("absolute inset-y-3 left-0 w-[3px] rounded-full", accent[a.priority])} />
              <span className="sr-only">Prioridade {alertPriorityLabel[a.priority]}.</span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-body-sm font-medium text-navy-900">{a.title}</span>
                  <Badge variant={alertCategoryVariant[a.category]}>{alertCategoryLabel[a.category]}</Badge>
                </div>
                {a.detail && <p className="mt-1 text-body-sm leading-snug text-gray-500">{a.detail}</p>}
              </div>

              <div className="hidden w-44 shrink-0 text-right sm:block">
                {a.dueLabel && <p className={cn("text-caption tnum", dueTone(a.dueLabel))}>{a.dueLabel}</p>}
                {a.owner && <p className="mt-0.5 text-caption text-gray-500">{a.owner}</p>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
