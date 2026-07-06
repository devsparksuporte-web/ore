"use client";

/**
 * CRYSTAL INTELLIGENCE · Briefing Executivo Diário
 *
 * A face visível do Insight Engine: saudação, a leitura do dia em itens
 * ✔/⚠ e investigação a um clique. Registrado como widget "briefing" —
 * demonstra a extensibilidade do registry (ADR-018): o módulo insights
 * adiciona um tipo à plataforma sem tocar o Widget Engine.
 */
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Info, Sparkles } from "lucide-react";
import { registerWidget, type WidgetConfig } from "@modules/widgets";
import { cn } from "@/lib/utils";
import type { Insight, InsightTone } from "../types";

export interface BriefingWidgetData {
  firstName: string;
  insights: Insight[];
  maxItems?: number;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const toneIcon: Record<InsightTone, { icon: typeof CheckCircle2; cls: string }> = {
  positive: { icon: CheckCircle2, cls: "text-success" },
  neutral: { icon: Info, cls: "text-info" },
  attention: { icon: AlertTriangle, cls: "text-warning-fg" },
  critical: { icon: AlertTriangle, cls: "text-danger" },
};

export function BriefingWidgetBody({ data }: { data: BriefingWidgetData; config: WidgetConfig<BriefingWidgetData> }) {
  const items = data.insights.slice(0, data.maxItems ?? 6);
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="-mx-6 -my-6">
      {/* Cabeçalho da marca de inteligência */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-navy-50/60 to-transparent px-6 py-4">
        <div>
          <p className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-navy-900">
            <Sparkles className="h-3.5 w-3.5 text-copper-500" aria-hidden />
            Crystal Intelligence
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-navy-900">
            {greeting()}, {data.firstName}.
          </h3>
          <p className="text-caption text-muted-foreground">
            {today} · hoje identificamos {items.length} pontos de leitura
          </p>
        </div>
      </div>

      {/* Itens do briefing — cada um investiga a um clique */}
      <ul>
        {items.map((i) => {
          const T = toneIcon[i.tone];
          const row = (
            <span className="flex items-center gap-3 px-6 py-3">
              <T.icon className={cn("h-4 w-4 shrink-0", T.cls)} aria-hidden />
              <span className="min-w-0 flex-1 text-body-sm leading-6 text-gray-800">
                {i.emphasis && <span className="font-semibold text-navy-900">{i.emphasis} </span>}
                {i.text}
              </span>
              {i.href && (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-gray-300 transition-transform duration-fast group-hover/item:translate-x-0.5 group-hover/item:text-action-600"
                  aria-hidden
                />
              )}
            </span>
          );
          return (
            <li key={i.id} className="border-b last:border-0">
              {i.href ? (
                <Link
                  href={i.href}
                  className="group/item block transition-colors duration-fast hover:bg-gray-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>

      {/* Rodapé de instrução */}
      <p className="flex items-center gap-1.5 px-6 py-3 text-caption text-gray-500">
        <ArrowRight className="h-3 w-3" aria-hidden />
        Selecione um item para investigar · cada leitura tem evidência
      </p>
    </div>
  );
}

/* Auto-registro do tipo "briefing" no Widget Engine */
registerWidget<BriefingWidgetData>("briefing", BriefingWidgetBody);
