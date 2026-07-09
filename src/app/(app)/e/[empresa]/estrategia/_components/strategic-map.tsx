"use client";

/**
 * Bloco 1 · MAPA ESTRATÉGICO (escopo da empresa) — painel executivo com Tese,
 * Riscos-chave, Sucesso Esperado e Decisão Estratégica. Composto só com tokens
 * e primitivos do DS (Card, Badge via RiskBadge, tipografia editorial). Motion
 * contido e hover discreto, alinhados ao padrão da plataforma. Sem cara de Excel.
 */
import { motion } from "framer-motion";
import { Compass, Flag, ShieldAlert, Target } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { icon as dsIcon, motion as dsMotion } from "@/design-system";
import type { StrategicMap } from "@modules/strategy";
import { RiskBadge } from "./decision-badges";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-caption font-medium uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

export function StrategicMapSection({ map }: { map: StrategicMap }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Mapa Estratégico" subtitle={`${map.asset.label} · tese, riscos, sucesso e decisão`} />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dsMotion.duration.base / 1000, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="flex flex-col gap-5 p-6 transition-[border-color,box-shadow] duration-fast ease-standard hover:border-action-600/40 hover:shadow-sm">
          {/* Cabeçalho do Ativo */}
          <div className="flex items-center gap-2 border-b pb-3">
            <Compass className="h-icon-sm w-icon-sm text-copper-500" strokeWidth={dsIcon.stroke.regular} aria-hidden />
            <h3 className="font-display text-h3 tracking-snug text-navy-900">{map.asset.label}</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tese Atual */}
            <div className="space-y-1.5">
              <FieldLabel><Target className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Tese Atual</FieldLabel>
              <p className="text-body-sm leading-6 text-gray-700">{map.thesis}</p>
            </div>

            {/* Riscos-chave */}
            <div className="space-y-2">
              <FieldLabel><ShieldAlert className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Riscos-chave</FieldLabel>
              <ul className="space-y-2">
                {map.keyRisks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0"><RiskBadge severity={r.severity} /></span>
                    <span className="text-body-sm leading-5 text-gray-700">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sucesso Esperado */}
            <div className="space-y-1.5">
              <FieldLabel><Flag className="h-3.5 w-3.5 text-gray-400" aria-hidden /> Sucesso Esperado</FieldLabel>
              <p className="text-body-sm leading-6 text-gray-700">{map.success}</p>
            </div>

            {/* Decisão Estratégica — destaque */}
            <div className="rounded-md border-l-2 border-copper-500 bg-copper-100/40 px-4 py-3">
              <FieldLabel>Decisão Estratégica</FieldLabel>
              <p className="mt-1 text-body-sm font-medium leading-6 text-navy-900">{map.decision}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
