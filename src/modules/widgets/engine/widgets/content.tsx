"use client";

/** Widgets built-in de conteúdo: Chart · Table · Forecast · Card · Timeline · Alert. */
import Link from "next/link";
import { AlertOctagon, AlertTriangle, ArrowRight, CalendarClock, Info } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AlertWidgetData, CardWidgetData, ChartWidgetData, ForecastWidgetData, TableWidgetData, TimelineWidgetData, WidgetConfig,
} from "../types";

export function ChartWidgetBody({ data }: { data: ChartWidgetData; config: WidgetConfig<ChartWidgetData> }) {
  return <>{data.chart}</>;
}

export function TableWidgetBody({ data }: { data: TableWidgetData; config: WidgetConfig<TableWidgetData> }) {
  return (
    <div className="-mx-2">
      <DataTable columns={data.columns} rows={data.rows} onRowClick={data.onRowClick} exportable={data.exportable ?? false} />
    </div>
  );
}

export function ForecastWidgetBody({ data }: { data: ForecastWidgetData; config: WidgetConfig<ForecastWidgetData> }) {
  return (
    <div>
      <ForecastChart data={data.series} height={200} />
      {data.summary && (
        <div className={cn("mt-3 grid gap-2 border-t pt-3 text-center", data.summary.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {data.summary.map((s) => (
            <div key={s.label}>
              <p className="text-caption text-muted-foreground">{s.label}</p>
              <p className="font-semibold tnum text-navy-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CardWidgetBody({ data }: { data: CardWidgetData; config: WidgetConfig<CardWidgetData> }) {
  return <>{data.children}</>;
}

export function TimelineWidgetBody({ data }: { data: TimelineWidgetData; config: WidgetConfig<TimelineWidgetData> }) {
  return (
    <div className="space-y-3">
      {data.items.map((m, i) => (
        <div key={i} className="flex items-center gap-3 text-body-sm">
          <CalendarClock className={cn("h-4 w-4 shrink-0", m.done ? "text-gray-300" : m.highlight ? "text-copper-500" : "text-navy-900")} aria-hidden />
          <span className={cn("w-14 shrink-0 font-medium tnum", m.done ? "text-gray-400" : "text-navy-900")}>{m.when}</span>
          <span className={cn("min-w-0 truncate", m.done ? "text-gray-400" : "text-gray-700")}>{m.label}</span>
        </div>
      ))}
    </div>
  );
}

const sevCfg = {
  critical: { icon: AlertOctagon, border: "border-l-danger", text: "text-danger" },
  warning: { icon: AlertTriangle, border: "border-l-warning", text: "text-warning-fg" },
  info: { icon: Info, border: "border-l-info", text: "text-info-fg" },
};

export function AlertWidgetBody({ data }: { data: AlertWidgetData; config: WidgetConfig<AlertWidgetData> }) {
  return (
    <div className="-mx-6 -my-1">
      {data.alerts.map((a) => {
        const S = sevCfg[a.severity];
        return (
          <div key={a.id} className={cn("flex items-center gap-3 border-b border-l-[3px] px-6 py-3 last:border-b-0", S.border)}>
            <S.icon className={cn("h-4 w-4 shrink-0", S.text)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium text-foreground">{a.title}</p>
              {a.meta && (
                <p className="mt-0.5 flex items-center gap-2 text-caption text-muted-foreground">
                  <Badge variant="outline" className="text-micro">{a.meta}</Badge>
                </p>
              )}
            </div>
            {a.action && (
              <Link href={a.action.href} className="flex shrink-0 items-center gap-1 text-body-sm font-medium text-action-600 hover:underline">
                {a.action.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
