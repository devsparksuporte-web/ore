"use client";

/**
 * Sidebar Strata · Premium Polish
 * Mesma estrutura e funcionalidades — refinamento exclusivamente visual:
 * fundo mais profundo com luz difusa, separadores-fio, hover com deslize
 * sutil, indicador ativo em cobre com halo, avatar com anel, tipografia
 * e alinhamento de ícones calibrados. Confiança de sala de diretoria.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextSwitcher } from "./context-switcher";
import { companyNav, portfolioNav, type NavGroup } from "./nav-config";
import { mockSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { icon as dsIcon } from "@/design-system";

export function Sidebar() {
  const pathname = usePathname();
  const isCompany = pathname.startsWith("/e/");
  const slug = isCompany ? pathname.split("/")[2] : null;
  const groups: NavGroup[] = slug ? companyNav(slug, 7) : portfolioNav;

  return (
    <aside className="fixed inset-y-0 left-0 z-sidebar hidden w-60 flex-col bg-sidebar border-r border-white/[0.04] lg:flex">
      {/* Logo — marca oficial Ore (arquivo original, versão branca) */}
      <Link
        href="/portfolio/overview"
        className="flex items-center px-6 pb-5 pt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-600"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ore-logo-white.svg" alt="Ore Mining Investments" className="w-[132px]" />
      </Link>

      <ContextSwitcher />

      {/* Menu */}
      <nav className="mt-5 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {groups.map((group, gi) => (
          <div key={group.label}>
            {/* Separador elegante entre domínios (a partir do 2º grupo) */}
            {gi > 0 && <div className="sidebar-hairline mb-5 mt-0" aria-hidden />}
            <p className="px-3 pb-2 text-micro font-medium uppercase tracking-overline text-white/40">
              {group.label}
            </p>
            <ul className="space-y-px">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                const content = (
                  <span
                    className={cn(
                      "group/nav relative flex items-center gap-3 rounded px-3 py-2 text-body-sm leading-5 transition-colors duration-fast",
                      active
                        ? "bg-white/[0.07] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
                        : "font-normal text-[#9FB0C6] hover:bg-white/[0.04] hover:text-white active:bg-white/[0.08]",
                      item.disabled &&
                        "cursor-not-allowed opacity-disabled hover:bg-transparent hover:text-[#9FB0C6]"
                    )}
                  >
                    {/* Indicador ativo: barra cobre com halo suave */}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-copper-500 shadow-[0_0_10px_1px_rgb(192_112_58/0.45)]"
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-[color,transform] duration-fast ease-standard",
                        active ? "text-copper-100/90" : "text-[#7E93AE] group-hover/nav:text-white",
                        !item.disabled && "group-hover/nav:translate-x-[1px]"
                      )}
                      strokeWidth={dsIcon.stroke.regular}
                    />
                    <span
                      className={cn(
                        "flex-1 truncate transition-transform duration-fast ease-standard",
                        !item.disabled && !active && "group-hover/nav:translate-x-[1px]"
                      )}
                    >
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="rounded-full bg-warning/90 px-1.5 text-micro font-semibold leading-4 text-white shadow-xs tnum">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                );
                return (
                  <li key={item.href}>
                    {item.disabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild><span>{content}</span></TooltipTrigger>
                        <TooltipContent side="right">{item.disabledReason}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-600"
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé: sync + usuário */}
      <div className="px-5 pb-5 pt-0">
        <div className="sidebar-hairline mb-4" aria-hidden />
        <p className="flex items-center gap-1.5 text-caption tracking-wide text-white/55">
          <RefreshCw className="h-3 w-3" strokeWidth={dsIcon.stroke.regular} />
          Última sync · hoje 06:15
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_1px_rgb(24_128_73/0.5)]" />
        </p>
        <div className="mt-3.5 flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-500 to-[#8F4E24] text-caption font-semibold text-white ring-2 ring-white/10 shadow-sm">
            {mockSession.user.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-medium leading-4 text-white">{mockSession.user.name}</p>
            <p className="mt-0.5 truncate text-micro tracking-wide text-white/55">{mockSession.user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
