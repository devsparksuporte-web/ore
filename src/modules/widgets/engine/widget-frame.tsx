"use client";

/**
 * WidgetFrame — o chrome universal de todo widget:
 * título discreto + ações · corpo · rodapé com origem do dado ·
 * 6 estados (ready/loading/empty/error/negado/oculto) · tom semântico ·
 * animação de entrada contida · clicável quando href.
 */
import * as React from "react";
import Link from "next/link";
import { Lock, RefreshCw } from "lucide-react";
import { authorize } from "@modules/permissions";
import { SourceCaption } from "@/components/data/source-caption";
import { EmptyState } from "@/components/data/empty-state";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WidgetConfig, WidgetTone } from "./types";

const toneBorder: Record<WidgetTone, string> = {
  default: "",
  navy: "border-l-[3px] border-l-navy-900",
  success: "border-l-[3px] border-l-success",
  warning: "border-l-[3px] border-l-warning",
  danger: "border-l-[3px] border-l-danger",
  info: "border-l-[3px] border-l-info",
};

export function WidgetFrame({
  config,
  index = 0,
  children,
}: {
  config: WidgetConfig<unknown>;
  index?: number;
  children: React.ReactNode; // corpo já resolvido pelo registry (estado ready)
}) {
  /* AUTORIZAÇÃO CENTRALIZADA (ADR-021): todo widget verifica empresa +
     papel + permissão + escopo ANTES de renderizar — automático, aqui,
     nunca espalhado pela aplicação. A fronteira real é o backend (P-E4). */
  const decision = config.requires
    ? authorize({ capability: config.requires, company: config.company, costCenter: config.costCenter })
    : { allowed: true as const, reason: "ok" };
  const allowed = decision.allowed;
  if (!allowed && config.deniedBehavior === "hide") return null;

  const body = !allowed ? (
    <div className="flex min-h-[96px] flex-col items-center justify-center gap-1.5 text-muted-foreground">
      <Lock className="h-4 w-4" aria-hidden />
      <span className="text-caption">{decision.reason}</span>
    </div>
  ) : config.data.status === "loading" ? (
    <WidgetSkeleton variant={config.skeleton ?? "kpi"} />
  ) : config.data.status === "error" ? (
    <div className="flex min-h-[96px] flex-col items-center justify-center gap-2">
      <p className="text-body-sm text-muted-foreground">
        {config.data.message ?? "Não foi possível carregar"}
      </p>
      {config.data.retry && (
        <Button variant="outline" size="sm" onClick={config.data.retry}>
          <RefreshCw /> Tentar novamente
        </Button>
      )}
    </div>
  ) : config.data.status === "empty" ? (
    <EmptyState
      kind="no-results"
      title={config.data.message ?? "Sem dados para o recorte"}
      actionLabel={config.data.actionLabel}
      onAction={config.data.onAction}
      className="border-0 py-6"
    />
  ) : (
    children
  );

  const frame = (
    <section
      aria-label={config.title ?? config.type}
      /* Entrada CSS por movimento — nunca opacidade (conteúdo sempre visível) */
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
      className={cn(
        "widget-enter",
        "group flex h-full flex-col rounded-md border bg-surface shadow-sm",
        toneBorder[config.tone ?? "default"],
        config.href &&
          "cursor-pointer transition-[border-color,box-shadow,transform] duration-fast ease-standard hover:-translate-y-px hover:border-action-600/60 hover:shadow-md active:translate-y-0"
      )}
    >
      {(config.title || config.actions) && (
        <header className="flex items-start justify-between gap-3 px-6 pb-3 pt-5">
          <div className="min-w-0">
            {config.title && <h3 className="text-sm font-medium leading-5 text-gray-700">{config.title}</h3>}
            {config.description && <p className="mt-0.5 text-caption text-muted-foreground">{config.description}</p>}
          </div>
          {config.actions && <div className="flex shrink-0 items-center gap-2">{config.actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 px-6", config.title || config.actions ? "pb-5" : "py-6")}>{body}</div>
      {config.source && allowed && (
        <footer className="flex items-center justify-between border-t px-6 py-2.5">
          <SourceCaption source={config.source} />
          {config.href && (
            <span aria-hidden className="text-gray-300 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-action-600">→</span>
          )}
        </footer>
      )}
    </section>
  );

  if (config.frameless) return <>{body}</>;
  if (config.href)
    return (
      <Link href={config.href} className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {frame}
      </Link>
    );
  return frame;
}

function WidgetSkeleton({ variant }: { variant: "kpi" | "chart" | "list" | "table" }) {
  if (variant === "chart")
    return (
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    );
  if (variant === "table") return <SkeletonTable rows={5} />;
  if (variant === "list")
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
      </div>
    );
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}
