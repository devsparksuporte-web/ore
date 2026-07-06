import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Timeline de aprovação — quem aprovou, quando, quem está com a bola (doc 05 §4 domínio). */
export function ApprovalTimeline({
  steps,
}: {
  steps: { step: string; who: string; when?: string; status: "done" | "current" | "waiting" }[];
}) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-border" />}
          <span
            className={cn(
              "z-10 mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
              s.status === "done" && "border-success bg-success text-white",
              s.status === "current" && "border-action-600 bg-action-100 text-action-600",
              s.status === "waiting" && "border-gray-300 bg-surface text-gray-300"
            )}
          >
            {s.status === "done" ? <Check className="h-2.5 w-2.5" /> : s.status === "current" ? <Clock className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2" />}
          </span>
          <div>
            <p className={cn("text-body-sm font-medium", s.status === "waiting" ? "text-muted-foreground" : "text-foreground")}>
              {s.step}
            </p>
            <p className="text-caption text-muted-foreground">
              {s.who} {s.when && `· ${s.when}`}
              {s.status === "current" && " · aguardando"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
