/**
 * CAMADA DE LAYOUTS · Strata (Sprint 04b)
 * Todo módulo herda um destes quatro layouts:
 *  - MainLayout      → shell autenticado (sidebar + topbar + main)
 *  - DashboardLayout → container de página de conteúdo/dashboard
 *  - SettingsLayout  → container de configuração/administração
 *  - AuthLayout      → telas não autenticadas (split | center)
 * Documentação: docs/06-ui-guidelines.md e docs/12-component-library.md.
 */
export * from "./main-layout";
export * from "./dashboard-layout";
export * from "./settings-layout";
export * from "./auth-layout";
