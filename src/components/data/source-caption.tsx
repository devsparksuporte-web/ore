import { Database } from "lucide-react";

/**
 * Origem + frescor do dado — presente em todo card analítico (P-X2).
 * Sprint 1.1: gray-400 → gray-500 (contraste AA 4,6:1 em texto pequeno).
 */
export function SourceCaption({ source }: { source: string }) {
  return (
    <div className="flex items-center gap-1 text-caption text-gray-500">
      <Database className="h-3 w-3 shrink-0" aria-hidden />
      <span>{source}</span>
    </div>
  );
}
