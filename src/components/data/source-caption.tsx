import { Database } from "lucide-react";
import { DATA_STATUS_LABEL, type DataStatus } from "@modules/data-source";
import { cn } from "@/lib/utils";

/**
 * Origem + estado do dado — presente em todo card analítico (P-X2).
 *
 * Sprint 1.1: gray-400 → gray-500 (contraste AA 4,6:1 em texto pequeno).
 * Sprint 1.4 · item 5: prop OPCIONAL `dataStatus`. Sem ela, o componente
 * renderiza exatamente como antes — os usos que não declararem estado seguem
 * intactos. Com ela, o bloco passa a responder não só "de onde veio" mas
 * "isto é verdade?".
 *
 * Por que discreto: a origem é nota de rodapé, não manchete. Um selo por bloco
 * em tipo pequeno informa sem transformar o card numa ficha técnica.
 */

/** Cor do selo por estado. Só tokens semânticos existentes — sem cor nova. */
const statusTone: Record<DataStatus, string> = {
  REAL: "text-success-fg",
  DEMONSTRATIVO: "text-warning-fg",
  AGUARDANDO_DADOS: "text-warning-fg",
  NAO_DISPONIVEL: "text-gray-500",
  PLANEJADO: "text-gray-500",
};

const dotTone: Record<DataStatus, string> = {
  REAL: "bg-success",
  DEMONSTRATIVO: "bg-warning",
  AGUARDANDO_DADOS: "bg-warning",
  NAO_DISPONIVEL: "bg-gray-300",
  PLANEJADO: "bg-gray-300",
};

export function SourceCaption({ source, dataStatus }: { source: string; dataStatus?: DataStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption text-gray-500">
      <span className="flex items-center gap-1">
        <Database className="h-3 w-3 shrink-0" aria-hidden />
        <span>{source}</span>
      </span>
      {dataStatus && (
        <span className={cn("flex items-center gap-1.5", statusTone[dataStatus])}>
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotTone[dataStatus])} aria-hidden />
          {DATA_STATUS_LABEL[dataStatus]}
        </span>
      )}
    </div>
  );
}
