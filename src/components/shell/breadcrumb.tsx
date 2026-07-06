"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCompany } from "@/mocks/companies";
import React from "react";

const labels: Record<string, string> = {
  portfolio: "Portfólio Ore", overview: "Dashboard", investidas: "Investidas",
  financeiro: "Financeiro", "fluxo-de-caixa": "Fluxo de Caixa", dre: "DRE", oxr: "Orçado x Realizado",
  operacoes: "Operações", compras: "Compras", governanca: "Governança", aprovacoes: "Aprovações",
  auditoria: "Auditoria", config: "Configurações", integracoes: "Integrações", "de-para": "De-Para de Contas",
  periodos: "Períodos", admin: "Administração", usuarios: "Usuários", notificacoes: "Notificações",
};

/**
 * Breadcrumb com linhagem completa (doc 04 §0):
 * Ore / Investidas / Ativa Mineração / Dashboard — níveis clicáveis.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href?: string }[] = [];

  if (parts[0] === "e" && parts[1]) {
    const company = getCompany(parts[1]);
    crumbs.push({ label: "Ore", href: "/portfolio/overview" });
    crumbs.push({ label: "Investidas", href: "/portfolio/investidas" });
    crumbs.push({ label: company?.shortName ?? parts[1], href: `/e/${parts[1]}/overview` });
    // domínio (financeiro/operacoes/...) é organizacional — pula direto à página
    const rest = parts.slice(2).filter((p) => !["financeiro", "operacoes", "governanca", "config"].includes(p));
    rest.forEach((p) => crumbs.push({ label: labels[p] ?? p }));
  } else {
    parts.forEach((p, i) => {
      crumbs.push({ label: labels[p] ?? p, href: i < parts.length - 1 ? "/" + parts.slice(0, i + 1).join("/") : undefined });
    });
  }

  return (
    <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1 text-xs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-gray-300" />}
          {c.href ? (
            <Link href={c.href} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
