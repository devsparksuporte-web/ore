"use client";

/** Widgets built-in de métrica: KPI · Insight · Progress · Status. */
import { AlertTriangle, CheckCircle2, CircleSlash, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeltaIndicator } from "@/components/data/delta-indicator";
import { Sparkline } from "@/components/data/sparkline";
import { cn } from "@/lib/utils";
import type { InsightWidgetData, KpiWidgetData, ProgressWidgetData, StatusWidgetData, WidgetConfig, WidgetTone } from "../types";

export function KpiWidgetBody({ data }: { data: KpiWidgetData; config: WidgetConfig<KpiWidgetData> }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-medium uppercase tracking-wider text-gray-500">{data.label}</span>
        {data.badge && <Badge variant="warning">{data.badge}</Badge>}
      </div>
      {/* Valor SEMPRE alinhado ao topo (linhas de cards irmãos não afundam
          o número) e SEM quebra — se apertar, o span do widget está errado. */}
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="whitespace-nowrap font-display text-kpi tnum tracking-tight text-navy-900">{data.value}</div>
          {data.reading && <p className="mt-1 truncate text-body-sm text-gray-700">{data.reading}</p>}
          {data.delta && (
            <div className="mt-2">
              <DeltaIndicator value={data.delta.value} favorable={data.delta.favorable} label={data.delta.label} />
            </div>
          )}
        </div>
        {data.spark && (
          <Sparkline
            data={data.spark}
            className="mt-1 hidden shrink-0 text-navy-900 opacity-70 transition-opacity duration-fast group-hover:opacity-100 sm:block"
          />
        )}
      </div>
    </div>
  );
}

const insightTone: Record<WidgetTone, string> = {
  default: "bg-sunken text-gray-700",
  navy: "bg-navy-50 text-navy-900",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
  info: "bg-info-bg text-info-fg",
};

export function InsightWidgetBody({ data }: { data: InsightWidgetData; config: WidgetConfig<InsightWidgetData> }) {
  return (
    <div className={cn("rounded-md px-4 py-3 text-body-sm leading-6", insightTone[data.tone ?? "default"])}>
      {data.emphasis && <span className="font-semibold">{data.emphasis} </span>}
      {data.text}
    </div>
  );
}

export function ProgressWidgetBody({ data }: { data: ProgressWidgetData; config: WidgetConfig<ProgressWidgetData> }) {
  const pct = Math.min((data.value / data.max) * 100, 100);
  const fmt = data.format ?? ((v: number) => v.toLocaleString("pt-BR"));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl font-semibold tnum text-navy-900">{fmt(data.value)}</span>
        <span className="text-body-sm text-muted-foreground tnum">de {fmt(data.max)}</span>
      </div>
      <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-navy-900 transition-[width] duration-slow ease-out" style={{ width: `${pct}%` }} />
        {data.marker && (
          <div
            className="absolute top-[-3px] h-3.5 w-[2px] rounded bg-copper-500"
            style={{ left: `${Math.min((data.marker.at / data.max) * 100, 100)}%` }}
            title={data.marker.label}
          />
        )}
      </div>
      {data.caption && <p className="mt-1.5 text-caption text-muted-foreground">{data.caption}</p>}
    </div>
  );
}

const stateIcon = {
  ok: { icon: CheckCircle2, cls: "text-success" },
  warn: { icon: AlertTriangle, cls: "text-warning-fg" },
  error: { icon: XCircle, cls: "text-danger" },
  off: { icon: CircleSlash, cls: "text-gray-300" },
};

export function StatusWidgetBody({ data }: { data: StatusWidgetData; config: WidgetConfig<StatusWidgetData> }) {
  return (
    <div className="space-y-2.5">
      {data.items.map((it) => {
        const S = stateIcon[it.state];
        return (
          <div key={it.label + (it.detail ?? "")} className="flex items-center gap-2.5 text-body-sm">
            <S.icon className={cn("h-4 w-4 shrink-0", S.cls)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-700">{it.label}</p>
              {it.detail && <p className="truncate text-caption text-muted-foreground">{it.detail}</p>}
            </div>
            {it.meta && <span className="shrink-0 text-caption text-muted-foreground tnum">{it.meta}</span>}
          </div>
        );
      })}
    </div>
  );
}
