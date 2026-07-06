"use client";

import Link from "next/link";
import { Bell, HelpCircle, Search } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { ThemeToggle } from "./theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notifications } from "@/mocks/plataforma";
import { mockSession } from "@/lib/session";
import { toast } from "sonner";

export function Topbar() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="glass sticky top-0 z-topbar flex h-14 items-center gap-4 border-b px-6">
      <Breadcrumb />
      <div className="ml-auto flex items-center gap-1.5">
        {/* Busca global ⌘K (mock) */}
        <button
          onClick={() => toast.info("Busca global (⌘K)", { description: "Busca de páginas e entidades — conectada na Fase 5." })}
          className="hidden h-8 items-center gap-2 rounded-md border bg-canvas px-3 text-body-sm text-muted-foreground transition-colors hover:bg-gray-50 md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar…
          <kbd className="rounded border bg-surface px-1 text-micro text-gray-400">⌘K</kbd>
        </button>

        {/* Notificações */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative rounded-md p-2 text-muted-foreground hover:bg-gray-100">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-micro font-bold text-white">
                {unread}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <p className="px-2 py-1.5 text-xs font-semibold text-navy-900">Notificações</p>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem key={n.id} asChild>
                <Link href={n.href} className="flex flex-col items-start gap-0.5">
                  <span className={`text-body-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</span>
                  <span className="text-caption text-muted-foreground">{n.body} · {n.time}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notificacoes" className="justify-center font-medium text-action-600">Ver todas</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <button
          onClick={() => toast.info("Central de ajuda", { description: "Onboarding, changelog e atalhos — em construção." })}
          className="rounded-md p-2 text-muted-foreground hover:bg-gray-100"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-caption font-semibold text-white">
            {mockSession.user.initials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="text-body-sm font-medium">{mockSession.user.name}</p>
              <p className="text-caption text-muted-foreground">{mockSession.user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/admin/usuarios">Administração</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/login">Sair</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
