"use client";

/**
 * Página exemplar da arquitetura modular (Sprint 2 · ADR-017):
 * consome APENAS barrels públicos — @modules/notifications (port de dados),
 * @modules/widgets (EmptyState) e @core (Button, cn). Zero @/mocks.
 * As demais páginas migram a este padrão via DT-015.
 */
import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button, cn } from "@core";
import { EmptyState } from "@modules/widgets";
import { listNotifications } from "@modules/notifications";
import { PageHeader } from "@/components/shell/page-header";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts";

export default function NotificacoesPage() {
  const [items, setItems] = React.useState(listNotifications());

  return (
    <DashboardLayout width="narrow">
      <PageHeader
        title="Notificações"
        description="Alertas, aprovações e eventos do portfólio"
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setItems((all) => all.map((n) => ({ ...n, read: true })));
              toast.success("Tudo marcado como lido");
            }}
          >
            <CheckCheck /> Marcar tudo como lido
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState kind="all-clear" title="Nada por aqui — você está em dia ✓" />
      ) : (
        <div className="overflow-hidden rounded-md border bg-surface">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={cn(
                "flex items-start gap-3 border-b px-5 py-4 transition-colors duration-fast last:border-0 hover:bg-gray-50/70",
                !n.read && "bg-action-100/30"
              )}
            >
              <span className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", n.read ? "bg-gray-100 text-gray-400" : "bg-navy-100 text-navy-900")}>
                <Bell className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm", n.read ? "text-gray-700" : "font-semibold text-navy-900")}>{n.title}</span>
                <span className="block text-body-sm text-muted-foreground">{n.body}</span>
              </span>
              <span className="shrink-0 text-caption text-muted-foreground">{n.time}</span>
            </Link>
          ))}
        </div>
      )}

      <p className="text-caption text-muted-foreground">
        Preferências por tipo de evento (in-app / e-mail / resumo diário) — disponíveis na v1.1.
      </p>
    </DashboardLayout>
  );
}
