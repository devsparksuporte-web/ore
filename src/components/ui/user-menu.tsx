"use client";

/**
 * UserMenu · Strata (Sprint 04)
 * Avatar com iniciais + dropdown (perfil, preferências, sair).
 * Variante `surface="dark"` para uso no sidebar (fundo navy).
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icon as dsIcon } from "@/design-system";
import { cn } from "@/lib/utils";

export interface UserMenuProps {
  name: string;
  role?: string;
  initials: string;
  surface?: "light" | "dark";
  className?: string;
}

export function UserMenu({ name, role, initials, surface = "light", className }: UserMenuProps) {
  const router = useRouter();
  const dark = surface === "dark";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded p-1 text-left transition-colors duration-fast focus-ring",
          dark ? "hover:bg-white/[0.06]" : "hover:bg-gray-100",
          className
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-500 to-copper-500/70 text-caption font-semibold text-white ring-2 ring-white/10 shadow-sm">
          {initials}
        </span>
        <span className="min-w-0">
          <span className={cn("block truncate text-body-sm font-medium leading-4", dark ? "text-white" : "text-gray-900")}>
            {name}
          </span>
          {role && (
            <span className={cn("mt-0.5 block truncate text-micro tracking-wide", dark ? "text-white/55" : "text-gray-500")}>
              {role}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem onClick={() => router.push("/configuracoes/perfil")}>
          <UserRound className="h-icon-sm w-icon-sm" strokeWidth={dsIcon.stroke.regular} aria-hidden /> Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/configuracoes")}>
          <Settings className="h-icon-sm w-icon-sm" strokeWidth={dsIcon.stroke.regular} aria-hidden /> Preferências
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/login")}>
          <LogOut className="h-icon-sm w-icon-sm" strokeWidth={dsIcon.stroke.regular} aria-hidden /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
