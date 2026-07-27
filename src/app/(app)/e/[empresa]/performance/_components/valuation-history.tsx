"use client";

/**
 * HISTÓRICO DE VALUATION — registro auditável das marcações (data-base, valor,
 * método, variação vs anterior, fonte). Fecha a tela; consulta, não decisão.
 * Reusa o <DataTable/> do DS. Drill-down por marcação fica para a Sprint 1.3.
 */
import { Card, CardContent, CardHeader, CardTitle, DataTable, type Column } from "@/components/ui";
import { formatMoney, formatDate, formatPct } from "@/lib/format";
import type { ValuationRecord } from "@modules/performance";

interface Row extends ValuationRecord { id: string; deltaPct: number | null }

export function ValuationHistory({ history }: { history: ValuationRecord[] }) {
  const rows: Row[] = history.map((r, i) => {
    const prev = history[i + 1]?.value;
    return { ...r, id: r.asOf, deltaPct: prev ? ((r.value - prev) / prev) * 100 : null };
  });

  const columns: Column<Row>[] = [
    { key: "asOf", header: "Data-base", render: (r) => <span className="whitespace-nowrap tnum text-gray-600">{formatDate(r.asOf, "short")}</span> },
    { key: "value", header: "Valuation", align: "right", render: (r) => <span className="whitespace-nowrap font-medium tnum text-navy-900">{formatMoney(r.value, { compact: true })}</span> },
    { key: "method", header: "Método", render: (r) => <span className="whitespace-nowrap text-gray-600">{r.method}</span> },
    {
      key: "delta", header: "Δ vs anterior", align: "right",
      render: (r) => r.deltaPct === null
        ? <span className="text-gray-400">—</span>
        : <span className={`whitespace-nowrap tnum ${r.deltaPct >= 0 ? "text-success" : "text-danger"}`}>{formatPct(r.deltaPct, { signed: true })}</span>,
    },
    { key: "source", header: "Fonte", render: (r) => <span className="whitespace-nowrap text-gray-500">{r.source}</span> },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Histórico de valuation</CardTitle></CardHeader>
      <CardContent className="pt-1">
        <DataTable columns={columns} rows={rows} dense exportable={false} />
      </CardContent>
    </Card>
  );
}
