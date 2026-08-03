"use client";

/**
 * SITUAÇÃO JURÍDICA (rail) — status geral (Regular/Atenção/Crítico) + os
 * principais pontos que explicam o status. Responde "há risco jurídico
 * relevante?" com veredito, não com lista de riscos. Só tokens do DS.
 */
import { EditorialSection } from "@/components/ui";
import type { AttentionPoint, LegalStatus } from "@modules/corporate-governance";
import { legalStatusMeta } from "./helpers";

export function LegalStatusCard({ status, points }: { status: LegalStatus; points: AttentionPoint[] }) {
  const s = legalStatusMeta[status];
  return (
    <EditorialSection title="Situação jurídica">
        <div>
          <p className="text-body-sm text-gray-500">Status geral</p>
          <p className={`mt-1.5 flex items-center gap-2 font-display text-h2 font-semibold tracking-snug ${s.text}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} aria-hidden />
            {s.label}
          </p>
        </div>
        {points.length > 0 && (
          <div>
            <p className="mb-3 text-body-sm text-gray-500">Principais pontos de atenção</p>
            <ul className="space-y-2">
              {points.map((p) => (
                <li key={p.id} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${p.tone === "danger" ? "bg-danger" : "bg-warning"}`} aria-hidden />
                  <span className="text-body-sm leading-snug text-gray-600">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </EditorialSection>
  );
}
