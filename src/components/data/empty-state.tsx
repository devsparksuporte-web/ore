import { type LucideIcon, CheckCircle2, PlugZap, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { icon as dsIcon } from "@/design-system";

type EmptyKind = "not-configured" | "no-results" | "all-clear";

const defaults: Record<EmptyKind, { icon: LucideIcon; tone: string }> = {
  "not-configured": { icon: PlugZap, tone: "text-navy-700" },
  "no-results": { icon: SearchX, tone: "text-gray-400" },
  "all-clear": { icon: CheckCircle2, tone: "text-success" },
};

/** Os 3 tipos de estado vazio do produto (doc 05 §12) — nunca tela em branco. */
export function EmptyState({
  kind,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  kind: EmptyKind;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const { icon: Icon, tone } = defaults[kind];
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-10 text-center", className)}>
      <Icon className={cn("h-8 w-8", tone)} strokeWidth={dsIcon.stroke.regular} />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>}
      {actionLabel && (
        <Button variant={kind === "not-configured" ? "default" : "outline"} size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
