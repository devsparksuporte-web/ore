"use client";

import * as React from "react";
import { Briefcase, FileText, Receipt, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterBar } from "@/components/shell/filter-bar";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/data/empty-state";
import { ApprovalTimeline } from "@/components/data/approval-timeline";
import { approvalQueue, purchaseOrders } from "@/mocks/operacoes";
import { formatMoney } from "@/lib/format";
import type { ApprovalItem } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layouts";

const typeIcon = { purchase: Receipt, capex: Briefcase, justification: FileText, document: ScrollText };
const typeLabel = { purchase: "Compra", capex: "CAPEX", justification: "Justificativa", document: "Documento" };

export default function AprovacoesPage() {
  const [queue, setQueue] = React.useState(approvalQueue);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [detail, setDetail] = React.useState<ApprovalItem | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [rejecting, setRejecting] = React.useState<ApprovalItem | null>(null);
  const [rejectComment, setRejectComment] = React.useState("");

  const overdueCount = queue.filter((q) => q.slaStatus === "overdue").length;
  const totalValue = queue.reduce((s, q) => s + q.amount, 0);

  /** Decisão com janela de desfazer de 10s (E07-S05). */
  const decide = (item: ApprovalItem, decision: "approve" | "reject", comment?: string) => {
    setQueue((q) => q.filter((i) => i.id !== item.id));
    setDetail(null);
    setRejecting(null);
    setRejectComment("");
    const undo = () => setQueue((q) => [item, ...q]);
    toast.success(decision === "approve" ? `Aprovado: ${item.description.split("·")[0]}` : `Reprovado com comentário`, {
      description: decision === "approve" ? "Sincronizando status com o Protheus…" : comment,
      action: { label: "Desfazer", onClick: undo },
      duration: 10_000,
    });
  };

  const bulkApprove = () => {
    const eligible = queue.filter((q) => selectedIds.has(q.id) && q.withinAuthority);
    const excluded = queue.filter((q) => selectedIds.has(q.id) && !q.withinAuthority);
    setQueue((q) => q.filter((i) => !eligible.some((e) => e.id === i.id)));
    setSelectedIds(new Set());
    setBulkOpen(false);
    toast.success(`${eligible.length} itens aprovados em lote`, {
      description: excluded.length
        ? `${excluded.length} item excluído: acima da sua alçada (segue ao próximo nível).`
        : "Status sincronizando com o Protheus.",
      duration: 10_000,
    });
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const relatedOrder = detail?.orderId ? purchaseOrders.find((o) => o.id === detail.orderId) : null;

  return (
    <>
      <FilterBar showCompare={false} />
      <DashboardLayout>
        <PageHeader
          title="Aprovações"
          description="Fila única — compras, CAPEX, justificativas e documentos"
          actions={
            selectedIds.size > 0 && (
              <Button onClick={() => setBulkOpen(true)}>Aprovar selecionados ({selectedIds.size})</Button>
            )
          }
        />

        {/* Resumo */}
        <section className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-caption uppercase tracking-wide text-muted-foreground">Pendentes</p><p className="mt-1 font-display text-xl font-semibold tnum text-navy-900">{queue.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption uppercase tracking-wide text-muted-foreground">Valor total</p><p className="mt-1 font-display text-xl font-semibold tnum text-navy-900">{formatMoney(totalValue, { compact: true })}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-caption uppercase tracking-wide text-muted-foreground">Fora do SLA</p><p className={cn("mt-1 font-display text-xl font-semibold tnum", overdueCount ? "text-danger" : "text-navy-900")}>{overdueCount}</p></CardContent></Card>
        </section>

        {/* Fila */}
        {queue.length === 0 ? (
          <EmptyState kind="all-clear" title="Nenhuma aprovação pendente ✓" description="Você está em dia. Novas solicitações aparecerão aqui e na central de notificações." />
        ) : (
          <div className="overflow-hidden rounded-md border bg-surface">
            {queue.map((item) => {
              const Icon = typeIcon[item.type];
              return (
                <div
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-gray-50/70"
                  onClick={() => setDetail(item)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 accent-action-600"
                    disabled={!item.withinAuthority}
                  />
                  <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-gray-800">{item.description}</p>
                    <p className="text-caption text-muted-foreground">
                      {typeLabel[item.type]} · {item.requester} · CC {item.costCenter}
                      {!item.withinAuthority && <span className="ml-1 font-medium text-info-fg">· acima da sua alçada — segue à Diretoria Ore</span>}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tnum text-navy-900">{formatMoney(item.amount, { compact: true })}</span>
                  <Badge variant={item.slaStatus === "overdue" ? "danger" : item.slaStatus === "warning" ? "warning" : "default"} className="w-14 justify-center tnum">
                    {item.waitingDays}d
                  </Badge>
                  <div className="flex shrink-0 gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" disabled={!item.withinAuthority} onClick={() => decide(item, "approve")}>Aprovar</Button>
                    <Button size="sm" variant="destructive" disabled={!item.withinAuthority} onClick={() => setRejecting(item)}>Reprovar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardLayout>

      {/* Drawer de contexto de decisão (RF050) */}
      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent wide>
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.description}</SheetTitle>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {typeLabel[detail.type]} · {detail.requester} · aguardando há {detail.waitingDays} dias
                </p>
              </SheetHeader>
              <SheetBody className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <p className="text-caption uppercase text-muted-foreground">Valor</p>
                    <p className="font-display text-lg font-semibold tnum text-navy-900">{formatMoney(detail.amount)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-caption uppercase text-muted-foreground">Alçada</p>
                    <p className={cn("text-sm font-medium", detail.withinAuthority ? "text-success" : "text-info-fg")}>
                      {detail.withinAuthority ? "Dentro da sua alçada" : "Acima — próximo nível: Diretoria Ore"}
                    </p>
                  </div>
                </div>

                {relatedOrder?.budgetBalance && (
                  <section className="rounded-md border border-action-600/30 bg-action-100/40 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-action-700">Contexto orçamentário</h4>
                    <p className="mt-1.5 text-body-sm text-gray-700">
                      Conta <span className="font-medium">{relatedOrder.budgetBalance.account}</span> · saldo disponível:{" "}
                      <span className={cn("font-semibold tnum", relatedOrder.budgetBalance.available < detail.amount ? "text-danger" : "text-success")}>
                        {formatMoney(relatedOrder.budgetBalance.available)}
                      </span>
                    </p>
                    {relatedOrder.budgetBalance.available < detail.amount && (
                      <p className="mt-1 text-caption font-medium text-danger">⚠ O valor excede o saldo orçamentário da conta.</p>
                    )}
                  </section>
                )}

                {relatedOrder && (
                  <section>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trilha de aprovação</h4>
                    <ApprovalTimeline steps={relatedOrder.timeline} />
                  </section>
                )}
              </SheetBody>
              <SheetFooter>
                <Button variant="destructive" disabled={!detail.withinAuthority} onClick={() => setRejecting(detail)}>Reprovar</Button>
                <Button disabled={!detail.withinAuthority} onClick={() => decide(detail, "approve")}>Aprovar</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reprovação: comentário OBRIGATÓRIO (RF051) */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogTitle>Reprovar solicitação</DialogTitle>
          <DialogDescription>
            O comentário é obrigatório e será enviado ao solicitante. A decisão fica registrada na auditoria.
          </DialogDescription>
          <textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
            placeholder="Motivo da reprovação…"
            className="mt-4 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={rejectComment.trim().length < 10}
              onClick={() => rejecting && decide(rejecting, "reject", rejectComment)}
            >
              Confirmar reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lote: resumo + exclusão de itens fora da alçada (E07-S05) */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogTitle>Aprovar em lote</DialogTitle>
          <DialogDescription>
            {(() => {
              const sel = queue.filter((q) => selectedIds.has(q.id));
              const eligible = sel.filter((q) => q.withinAuthority);
              const excluded = sel.length - eligible.length;
              const value = eligible.reduce((s, q) => s + q.amount, 0);
              return `${eligible.length} itens serão aprovados (${formatMoney(value, { compact: true })}).${excluded ? ` ${excluded} item acima da sua alçada será excluído do lote.` : ""}`;
            })()}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancelar</Button>
            <Button onClick={bulkApprove}>Confirmar aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
