/**
 * Sessão mockada — front-end only.
 * Usuário demo: Diretoria da Ore (acesso total) para navegar toda a plataforma.
 * A troca por auth real acontece na Fase 5 (backend) sem alterar consumidores:
 * este módulo espelha o contrato do futuro GET /me (doc 10 §4).
 */

export type Capability =
  | "portfolio.ver"
  | "dashboard.ver"
  | "caixa.ver"
  | "dre.ver"
  | "oxr.ver"
  | "oxr.justificar"
  | "compras.ver"
  | "aprovacoes.decidir"
  | "auditoria.ver"
  | "integracoes.configurar"
  | "config.ver"
  | "usuarios.administrar"
  | "periodo.publicar";

export interface Session {
  user: { id: string; name: string; email: string; initials: string; role: string };
  tenant: { name: string; slug: string };
  capabilities: Capability[];
}

export const mockSession: Session = {
  user: {
    id: "u-1",
    name: "Mauro Barros",
    email: "mauro@oreinvestments.com.br",
    initials: "MB",
    role: "Sócio & CEO — Ore",
  },
  tenant: { name: "Ore Investments", slug: "ore" },
  capabilities: [
    "portfolio.ver", "dashboard.ver", "caixa.ver", "dre.ver", "oxr.ver", "oxr.justificar",
    "compras.ver", "aprovacoes.decidir", "auditoria.ver", "integracoes.configurar",
    "config.ver", "usuarios.administrar", "periodo.publicar",
  ],
};

export function can(capability: Capability): boolean {
  return mockSession.capabilities.includes(capability);
}
