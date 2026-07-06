"use client";

import Link from "next/link";
import { AlertOctagon, AlertTriangle, ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Alert } from "@/types/domain";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: { icon: AlertOctagon, border: "border-l-danger", text: "text-danger" },
  warning: { icon: AlertTriangle, border: "border-l-warning", text: "text-warning-fg" },
  info: { icon: Info, border: "border-l-info", text: "text-info-fg" },
};

export function AlertRow({ alert }: { alert: Alert }) {
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;
  return (
    <div className={cn("flex items-center gap-3 border-b border-l-[3px] px-4 py-3 last:border-b-0", cfg.border)}>
      <Icon className={cn("h-4 w-4 shrink-0", cfg.text)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-foreground">{alert.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant="outline" className="text-micro">{alert.company}</Badge>
          <span className="text-caption text-muted-foreground">há {alert.timeAgo}</span>
        </div>
      </div>
      <Link
        href={alert.action.href}
        className="flex shrink-0 items-center gap-1 text-body-sm font-medium text-action-600 hover:underline"
      >
        {alert.action.label} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
