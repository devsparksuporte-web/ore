/**
 * PERMISSION ENGINE · tipos (ADR-021)
 *
 * Autorização CENTRALIZADA: toda pergunta de acesso da aplicação passa
 * por um único ponto de decisão (authorize). Nenhuma verificação
 * espalhada — UI pergunta, o engine decide (e explica).
 *
 * Lembrete permanente (P-E4): a UI esconde, o BACKEND nega. Este engine
 * molda a interface; a fronteira real de segurança é o guard da API (E5),
 * que avalia as MESMAS políticas no servidor.
 */

/** Papéis de negócio da plataforma (mapeados aos 8 papéis RBAC do doc 05 §15). */
export type Role =
  | "administrador"   // Super Admin do tenant
  | "holding"         // Sócios/gestão da holding — visão total do portfólio
  | "diretoria"       // Diretoria de investida — leitura ampla + alçadas altas
  | "financeiro"      // CFO/Controller — operação financeira completa
  | "operacao"        // Gestores de área — seu recorte operacional
  | "compras"         // Suprimentos — compras + decisões da sua alçada
  | "investidores";   // LPs/conselho — leitura governada do portfólio

/** Capacidade no formato "modulo.acao" (catálogo doc 09). Wildcards nas políticas. */
export type CapabilityPattern = string; // ex.: "caixa.ver" | "financeiro.*" | "*"

/** Atribuição de papel com escopo de empresas. */
export interface RoleAssignment {
  role: Role;
  /** "*" = todas as empresas do tenant; senão, slugs explícitos */
  companies: "*" | string[];
  /** Escopo fino opcional (gestor de área) */
  costCenters?: "*" | string[];
}

/** Quem pergunta. */
export interface Principal {
  userId: string;
  name: string;
  assignments: RoleAssignment[];
}

/** O que se pergunta. */
export interface AccessRequest {
  capability: string;          // "dre.ver"
  company?: string;            // slug — quando o recurso é de empresa
  costCenter?: string;         // quando o recurso é de CC
}

/** A resposta — sempre com explicação (auditável e exibível no mask). */
export interface AccessDecision {
  allowed: boolean;
  /** Motivo em pt-BR — usado no estado mascarado do widget */
  reason: string;
  /** Qual atribuição concedeu (telemetria/auditoria de UI) */
  grantedBy?: { role: Role; scope: string };
}
