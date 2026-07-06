"use client";

import * as React from "react";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shell/page-header";
import { accountMappings, MAPPING_PROGRESS } from "@/mocks/plataforma";
import type { AccountMapping } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SettingsLayout } from "@/components/layouts";

export default function DeParaPage() {
  const [mappings, setMappings] = React.useState(accountMappings);
  const [onlyUnmapped, setOnlyUnmapped] = React.useState(false);

  const filtered = onlyUnmapped ? mappings.filter((m) => m.status !== "confirmed") : mappings;
  const pct = Math.round((MAPPING_PROGRESS.mapped / MAPPING_PROGRESS.total) * 100);

  const confirm = (m: AccountMapping) => {
    setMappings((all) => all.map((x) => (x.id === m.id ? { ...x, status: "confirmed" as const } : x)));
    toast.success(`Mapeamento confirmado: ${m.erpCode}`, { description: `→ ${m.canonical} · DRE e OxR serão recalculados.` });
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="De-Para do Plano de Contas"
        description="Mapeamento Protheus → plano canônico Strata — pré-requisito da DRE gerencial e do OxR"
      />

      {/* Progresso */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-gray-800">
                <span className="tnum">{MAPPING_PROGRESS.mapped}</span> de <span className="tnum">{MAPPING_PROGRESS.total}</span> contas mapeadas
              </p>
              <span className="font-display text-lg font-semibold tnum text-navy-900">{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-action-600" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-caption text-muted-foreground">
              Contas não mapeadas aparecem na linha “Não mapeadas” da DRE — nunca somem silenciosamente.
            </p>
          </div>
        </CardContent>
      </Card>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-body-sm text-gray-700">
        <input type="checkbox" checked={onlyUnmapped} onChange={(e) => setOnlyUnmapped(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-action-600" />
        Somente pendentes (sugeridas + não mapeadas)
      </label>

      {/* Grade de mapeamento */}
      <div className="overflow-hidden rounded-md border bg-surface">
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 border-b bg-gray-50/70 px-4 py-2 text-caption font-medium uppercase tracking-wide text-muted-foreground">
          <span>Conta no Protheus</span><span /><span>Conta canônica Strata</span><span>Ação</span>
        </div>
        {filtered.map((m) => (
          <div key={m.id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-0">
            <div>
              <p className="font-mono text-xs text-gray-500 tnum">{m.erpCode}</p>
              <p className="text-body-sm font-medium text-gray-800">{m.erpName}</p>
            </div>
            <span className="text-gray-300">→</span>
            <div>
              {m.canonical ? (
                <p className={cn("text-body-sm", m.status === "confirmed" ? "font-medium text-gray-800" : "text-gray-700")}>
                  {m.canonical}
                  {m.status === "suggested" && (
                    <Badge variant="copper" className="ml-2"><Sparkles className="h-2.5 w-2.5" /> sugerido · {Math.round((m.score ?? 0) * 100)}%</Badge>
                  )}
                </p>
              ) : (
                <p className="text-body-sm italic text-muted-foreground">Sem mapeamento — selecione a conta canônica</p>
              )}
            </div>
            <div>
              {m.status === "confirmed" ? (
                <Badge variant="success"><Check className="h-3 w-3" /> Confirmado</Badge>
              ) : m.status === "suggested" ? (
                <div className="flex gap-1.5">
                  <Button size="sm" onClick={() => confirm(m)}>Aceitar</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Seleção manual de conta canônica — busca com hierarquia (SearchSelect)")}>Trocar</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => toast.info("Seleção manual de conta canônica — busca com hierarquia (SearchSelect)")}>Mapear</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SettingsLayout>
  );
}
