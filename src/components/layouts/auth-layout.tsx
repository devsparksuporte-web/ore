/**
 * AuthLayout · Strata (Sprint 04b)
 * Layout das telas não autenticadas.
 * · variant="split": painel institucional (fotografia própria em camadas,
 *   marca oficial, frase e assinatura) + área de conteúdo à direita — login.
 * · variant="center": coluna centrada sobre o canvas — seleção de contexto,
 *   recuperação de senha e afins.
 * Extraído 1:1 da tela de login (zero mudança de UX).
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface AuthLayoutProps {
  variant?: "split" | "center";
  /** Largura máxima da coluna no variant center. Padrão 720px. */
  centerWidth?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

function InstitutionalPanel() {
  return (
    <div className="relative hidden w-[52%] overflow-hidden lg:block">
      {/* Camada 0 · fotografia (fallback: gradiente de marca) */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login-bg.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover saturate-[0.85]"
      />
      {/* Camada 1 · véu navy difuso (blur na cor, não na imagem) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1B33]/45 via-[#0A1B33]/50 to-[#050E1B]/75" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050E1B]/85 via-[#0A1B33]/20 to-[#050E1B]/45" aria-hidden />
      {/* Camada 2 · iluminação indireta (cobre, canto inferior) */}
      <div
        aria-hidden
        className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-25 blur-xl"
        style={{ background: "radial-gradient(circle, rgb(192 112 58 / 0.8), transparent 65%)" }}
      />

      {/* Conteúdo do painel */}
      <div className="relative flex h-full flex-col justify-between p-12">
        {/* Marca oficial Ore (arquivo original, versão branca) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ore-logo-white.svg" alt="Ore Mining Investments" className="anim-fade w-[188px]" />

        {/* Frase institucional — centralizada, alinhada ao conteúdo à direita */}
        <div className="anim-rise max-w-lg" style={{ animationDelay: "80ms" }}>
          <p className="font-display text-hero text-white [text-shadow:0_1px_28px_rgb(5_14_27/0.6)]">
            Inteligência que transforma operação em decisão.
          </p>
          <p className="mt-5 text-body leading-7 text-white/75 [text-shadow:0_1px_18px_rgb(5_14_27/0.6)]">
            Governança, consolidação e leitura executiva do portfólio em um único ambiente.
          </p>
        </div>

        <p className="anim-fade text-micro uppercase tracking-banner text-white/40" style={{ animationDelay: "160ms" }}>
          Mining Private Equity · Plataforma de Inteligência e Governança
        </p>
      </div>
    </div>
  );
}

export function AuthLayout({ variant = "split", centerWidth = "md", className, children }: AuthLayoutProps) {
  if (variant === "center") {
    return (
      <div className={cn("flex min-h-screen flex-col items-center bg-canvas px-6 py-16", className)}>
        <div className={cn("w-full", centerWidth === "md" ? "max-w-[720px]" : "max-w-[400px]")}>{children}</div>
      </div>
    );
  }
  return (
    <div className={cn("flex min-h-screen bg-canvas", className)}>
      <InstitutionalPanel />
      <div className="flex flex-1 items-center justify-center px-6">{children}</div>
    </div>
  );
}
