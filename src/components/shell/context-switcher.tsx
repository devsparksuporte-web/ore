"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Building2, Check, ChevronsUpDown, Landmark } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { companies } from "@/mocks/companies";

/**
 * Seletor de contexto (padrão Stripe — doc 01 §5.1): alterna entre
 * Portfólio e investidas. Investidas não integradas ficam desabilitadas.
 */
export function ContextSwitcher() {
  const pathname = usePathname();
  const isCompany = pathname.startsWith("/e/");
  const activeSlug = isCompany ? pathname.split("/")[2] : null;
  const active = activeSlug ? companies.find((c) => c.slug === activeSlug) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mx-3 flex items-center gap-2.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] transition-colors duration-fast hover:border-white/[0.14] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-600">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white/10">
          {active ? <Building2 className="h-4 w-4 text-white" /> : <Landmark className="h-4 w-4 text-white" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm font-semibold text-white">
            {active ? active.shortName : "Portfólio Ore"}
          </span>
          <span className="block text-micro uppercase tracking-overline text-white/45">
            {active ? "Contexto · empresa" : "Contexto · portfólio"}
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {isCompany && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/portfolio/overview" className="font-medium text-action-600">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Portfólio Ore
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {!isCompany && (
          <>
            <DropdownMenuItem className="font-medium">
              <Landmark className="h-3.5 w-3.5" /> Portfólio Ore <Check className="ml-auto h-3.5 w-3.5 text-action-600" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <p className="px-2 py-1 text-caption uppercase tracking-wide text-muted-foreground">Investidas</p>
        {companies.map((c) => {
          /* Sprint 1.4 · B-01 — o ponto e o rótulo liam `integrationStatus`:
             verde "integrada", âmbar "implantação", cinza "sem dados". Não há
             pipeline em nenhuma delas. Passam a ler `dataStatus`.
             Fase 5.2 · ORE-51-001 — cinco investidas apareciam desabilitadas e
             rotuladas "demonstrativo" no seletor, embora tenham fonte
             documental. Todas abrem; a cobertura por módulo é dita dentro de
             cada tela, onde tem contexto para significar algo. */
          const item = (
            <DropdownMenuItem key={c.id}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="flex-1 truncate">{c.name}</span>
              {c.slug === activeSlug && <Check className="h-3.5 w-3.5 text-action-600" />}
            </DropdownMenuItem>
          );
          return <Link key={c.id} href={`/e/${c.slug}/overview`}>{item}</Link>;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
