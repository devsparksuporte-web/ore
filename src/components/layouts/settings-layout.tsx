/**
 * SettingsLayout · Strata (Sprint 04b)
 * Container de módulos de configuração/administração (config da empresa,
 * admin, preferências futuras). Hoje compartilha o contrato visual do
 * DashboardLayout; existir como camada própria permite evoluir navegação
 * de seções de settings sem tocar nos dashboards.
 */
import * as React from "react";
import { DashboardLayout, type DashboardLayoutProps } from "./dashboard-layout";

export type SettingsLayoutProps = Omit<DashboardLayoutProps, "width">;

export function SettingsLayout({ spacing = "sm", padY = "default", className, children }: SettingsLayoutProps) {
  return (
    <DashboardLayout spacing={spacing} padY={padY} className={className}>
      {children}
    </DashboardLayout>
  );
}
