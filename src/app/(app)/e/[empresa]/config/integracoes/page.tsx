"use client";

import * as React from "react";
import { Play, Plug, RefreshCw, Settings2, Unplug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { SourceCaption } from "@/components/data/source-caption";
import { connections, syncRuns } from "@/mocks/plataforma";
import type { SyncRun } from "@/types/domain";
import { toast } from "sonner";
import { SettingsLayout } from "@/components/layouts";

const statusConfig = {
  healthy: { label: "Saudável", variant: "success" as const },
  error: { label: "Erro", variant: "danger" as const },
  configuring: { label: "Em configuração", variant: "warning" as const },
  not_started: { label: "Não iniciada", variant: "default" as const },
};

export default function IntegracoesPage() {
  const [disconnecting, setDisconnecting] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  const runSync = () => {
    setSyncing(true);
    toast.info("Sincronização iniciada", { description: "Autenticando… lendo filiais… importando títulos (SE1/SE2)…" });
    setTimeout(() => {
      setSyncing(false);
      toast.success("Sincronização concluída", { description: "1.574 registros importados · 0 erros · 11 min" });
    }, 2500);
  };

  const logCols: Column<SyncRun>[] = [
    { key: "start", header: "Execução", render: (r) => <span className="tnum">{r.startedAt}</span> },
    { key: "dur", header: "Duração", render: (r) => <span className="tnum">{r.duration}</span> },
    { key: "rec", header: "Registros", align: "right", render: (r) => <span className="tnum">{r.records.toLocaleString("pt-BR")}</span> },
    {
      key: "status", header: "Status",
      render: (r) => (
        <Badge variant={r.status === "success" ? "success" : r.status === "failed" ? "danger" : "warning"}>
          {r.status === "success" ? "Sucesso" : r.status === "failed" ? "Falha" : "Parcial"}
        </Badge>
      ),
    },
    { key: "err", header: "Observação", render: (r) => <span className="text-muted-foreground">{r.error ?? "—"}</span> },
  ];

  const ativaConnections = connections.filter((c) => c.companyName === "Ativa Mineração");

  return (
    <SettingsLayout spacing="md">
      <PageHeader
        title="Integrações"
        description="Fontes de dados da Ativa Mineração — status, sincronização e logs"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ativaConnections.map((c) => {
          const cfg = statusConfig[c.status];
          return (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-100"><Plug className="h-4 w-4 text-navy-900" /></span>
                  <div>
                    <CardTitle className="text-sm">{c.connector}</CardTitle>
                    <p className="text-caption text-muted-foreground">{c.companyName}</p>
                  </div>
                </div>
                <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
              </CardHeader>
              <CardContent className="space-y-1.5 text-body-sm text-gray-700">
                <p className="text-muted-foreground">{c.detail}</p>
                {c.lastSync && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Última sync</span><span className="font-medium tnum">{c.lastSync}</span></div>
                )}
                {c.nextSync && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Próxima</span><span className="tnum">{c.nextSync}</span></div>
                )}
                {c.recordsImported && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Registros</span><span className="tnum">{c.recordsImported.toLocaleString("pt-BR")}</span></div>
                )}
              </CardContent>
              <CardFooter className="gap-1.5">
                <Button size="sm" variant="outline" onClick={runSync} loading={syncing && c.id === "cn-1"}>
                  <Play /> Sincronizar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.info("Configuração do conector", { description: "Credenciais em cofre — nunca exibidas. Edição na v1.1." })}>
                  <Settings2 /> Configurar
                </Button>
                <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-bg" onClick={() => setDisconnecting(c.id)}>
                  <Unplug />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-navy-900">Logs de sincronização — Protheus</h2>
        </div>
        <DataTable columns={logCols} rows={syncRuns} />
        <p className="mt-2"><SourceCaption source="Cada execução registra contagens por entidade, erros com payload e id de linhagem" /></p>
      </section>

      {/* Desconexão: destrutivo com consequências explícitas */}
      <Dialog open={!!disconnecting} onOpenChange={(o) => !o && setDisconnecting(null)}>
        <DialogContent>
          <DialogTitle>Desconectar integração?</DialogTitle>
          <DialogDescription>
            Isto interromperá a sincronização diária da Ativa. Os dados já importados permanecem, mas ficarão
            desatualizados e todas as telas exibirão o aviso de defasagem. Esta ação é auditada.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnecting(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDisconnecting(null);
                toast.error("Ação bloqueada no ambiente de demonstração", { description: "Em produção: desconecta + gera alerta + auditoria." });
              }}
            >
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsLayout>
  );
}
