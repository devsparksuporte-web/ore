"use client";

import * as React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { fiscalPeriods } from "@/mocks/governanca";
import type { FiscalPeriod } from "@/types/domain";
import { toast } from "sonner";
import { SettingsLayout } from "@/components/layouts";

export default function PeriodosPage() {
  const [publishing, setPublishing] = React.useState<FiscalPeriod | null>(null);
  const [confirmText, setConfirmText] = React.useState("");

  const columns: Column<FiscalPeriod & { id: string }>[] = [
    { key: "month", header: "Período", render: (p) => <span className="font-medium text-navy-900">{p.month}</span> },
    {
      key: "status", header: "Status",
      render: (p) => (
        <Badge variant={p.status === "published" ? "success" : p.status === "closing" ? "warning" : "info"} dot>
          {p.status === "published" ? "Publicado" : p.status === "closing" ? "Em fechamento" : "Aberto"}
        </Badge>
      ),
    },
    { key: "by", header: "Publicado por", render: (p) => p.publishedBy ?? "—" },
    { key: "at", header: "Em", render: (p) => <span className="tnum">{p.publishedAt ?? "—"}</span> },
    {
      key: "action", header: "", align: "right",
      render: (p) =>
        p.status === "open" ? (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); setPublishing(p); }}>
            Publicar período
          </Button>
        ) : p.status === "published" ? (
          <Button
            size="sm" variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Reabertura de período publicado", { description: "Fluxo de exceção: exige justificativa, notifica a diretoria Ore e gera auditoria." });
            }}
          >
            Reabrir (exceção)
          </Button>
        ) : null,
    },
  ];

  return (
    <SettingsLayout>
      <PageHeader
        title="Períodos e Publicação"
        description="Calendário de fechamento — publicação gera snapshot imutável visível ao fundo"
      />

      <div className="flex items-center gap-3 rounded-md border bg-sunken px-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-navy-700" />
        <p className="text-caption text-gray-600">
          Período publicado é <span className="font-semibold">imutável</span>: sincronizações posteriores não alteram o snapshot.
          É o número oficial entre a Ativa e a Ore.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={fiscalPeriods.map((p, i) => ({ ...p, id: `fp-${i}` }))}
        exportable={false}
      />

      {/* Publicação: confirmação DIGITADA (irreversível — DS §4 Modal) */}
      <Dialog open={!!publishing} onOpenChange={(o) => { if (!o) { setPublishing(null); setConfirmText(""); } }}>
        <DialogContent>
          <DialogTitle>Publicar {publishing?.month}</DialogTitle>
          <DialogDescription>
            Esta ação congela DRE, caixa e KPIs do período em um snapshot imutável, visível à diretoria da Ore.
            Reabertura só por fluxo de exceção. Digite <span className="font-mono font-semibold">PUBLICAR</span> para confirmar.
          </DialogDescription>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="PUBLICAR"
            className="mt-4 font-mono"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPublishing(null); setConfirmText(""); }}>Cancelar</Button>
            <Button
              variant="navy"
              disabled={confirmText !== "PUBLICAR"}
              onClick={() => {
                toast.success(`${publishing?.month} publicado`, {
                  description: "Snapshot #s-0726 gerado · diretoria Ore notificada · evento registrado na auditoria.",
                  icon: <Lock className="h-4 w-4" />,
                });
                setPublishing(null);
                setConfirmText("");
              }}
            >
              Publicar período
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsLayout>
  );
}
