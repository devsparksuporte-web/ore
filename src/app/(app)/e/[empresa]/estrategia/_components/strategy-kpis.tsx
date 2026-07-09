"use client";

/**
 * Faixa de KPIs do módulo Estratégia & Execução (escopo da empresa investida).
 * Reusa o <MetricCard/> (KpiCard) do Design System. Recebe os indicadores já
 * derivados pelo port (total, em andamento, concluídas, bloqueadas, atrasadas,
 * riscos críticos). Client component: passa ícones ao MetricCard (que é client).
 */
import { AlertTriangle, Ban, CheckCircle2, Clock, ListChecks, Timer } from "lucide-react";
import { MetricCard } from "@/components/ui";
import type { KpiData } from "@/types/domain";
import type { StrategyKpis } from "@modules/strategy";

const SOURCE = "Mapa estratégico · workbook Ore";

export function StrategyKpisRow({ kpis }: { kpis: StrategyKpis }) {
  const cards: { kpi: KpiData; icon: typeof ListChecks }[] = [
    { icon: ListChecks, kpi: { key: "total", label: "Total de decisões", value: String(kpis.totalDecisions), source: SOURCE } },
    { icon: Timer, kpi: { key: "in_progress", label: "Em andamento", value: String(kpis.inProgress), source: SOURCE } },
    { icon: CheckCircle2, kpi: { key: "done", label: "Concluídas", value: String(kpis.done), source: SOURCE } },
    { icon: Ban, kpi: { key: "blocked", label: "Bloqueadas", value: String(kpis.blocked), source: SOURCE } },
    { icon: Clock, kpi: { key: "overdue", label: "Atrasadas", value: String(kpis.overdue), source: SOURCE } },
    { icon: AlertTriangle, kpi: { key: "critical", label: "Riscos críticos", value: String(kpis.criticalRisks), source: SOURCE } },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ kpi, icon }) => (
        <MetricCard key={kpi.key} kpi={kpi} icon={icon} />
      ))}
    </div>
  );
}
