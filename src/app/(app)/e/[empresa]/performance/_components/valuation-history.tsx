"use client";

/**
 * HISTÓRICO DE VALUATION — seção editorial: tabela sem moldura, fios entre
 * linhas. Registro auditável das marcações; consulta, não decisão.
 */
import { EditorialSection } from "@/components/ui";
import { formatMoney, formatDate, formatPct } from "@/lib/format";
import type { ValuationRecord } from "@modules/performance";
import { cn } from "@/lib/utils";

/**
 * Sprint 1.4 · item 6 — a moeda passa a vir da FONTE, via prop.
 *
 * Antes, `formatMoney` era chamado sem `currency` e caía no padrão "R$": a
 * mesma marcação da Ativa aparecia como `US$ 11,3 mi` no card acima e
 * `R$ 11,3 mi` nesta tabela. Dois símbolos para o mesmo número, na mesma tela.
 * Nenhum VALOR foi alterado — só o símbolo passou a acompanhar a moeda em que
 * a fonte registra.
 */
export function ValuationHistory({ history, currency }: { history: ValuationRecord[]; currency: string }) {
  const rows = history.map((r, i) => {
    const prev = history[i + 1]?.value;
    return { ...r, deltaPct: prev ? ((r.value - prev) / prev) * 100 : null };
  });

  return (
    <EditorialSection title="Histórico de valuation" meta={`${rows.length} marcações`}>
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b text-caption text-gray-500">
            <th className="pb-2 text-left font-normal">Data-base</th>
            <th className="pb-2 text-right font-normal">Valuation</th>
            <th className="pb-2 text-left font-normal pl-6">Método</th>
            <th className="pb-2 text-right font-normal">Δ vs anterior</th>
            <th className="pb-2 text-right font-normal">Fonte</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.asOf} className="border-b last:border-b-0">
              <td className="py-2.5 tnum text-gray-600">{formatDate(r.asOf, "short")}</td>
              <td className="py-2.5 text-right font-medium tnum text-navy-900">{formatMoney(r.value, { compact: true, currency })}</td>
              <td className="py-2.5 pl-6 text-gray-600">{r.method}</td>
              <td className={cn("py-2.5 text-right tnum", r.deltaPct === null ? "text-gray-400" : r.deltaPct >= 0 ? "text-success" : "text-danger")}>
                {r.deltaPct === null ? "—" : formatPct(r.deltaPct, { signed: true })}
              </td>
              <td className="py-2.5 text-right text-caption text-gray-500">{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </EditorialSection>
  );
}
