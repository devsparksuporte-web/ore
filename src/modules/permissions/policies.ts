/**
 * POLÍTICAS POR PAPEL — a única fonte de "quem pode o quê" no front.
 * Espelha a matriz do doc 05 §15; na E5, o seed do banco nasce daqui
 * (mesmos papéis/capacidades avaliados pelo guard do servidor).
 * Wildcards: "*" (tudo) e "modulo.*" (todas as ações do módulo).
 */
import type { CapabilityPattern, Role } from "./types";

export const ROLE_POLICIES: Record<Role, CapabilityPattern[]> = {
  administrador: ["*"],

  holding: [
    "portfolio.*",
    "dashboard.ver", "caixa.ver", "dre.ver", "oxr.ver", "forecast.ver",
    "compras.ver", "capex.ver",
    "aprovacoes.decidir",            // alçadas do fundo
    "auditoria.ver", "documentos.ver",
    "relatorios.exportar",
  ],

  diretoria: [
    "dashboard.ver", "caixa.ver", "dre.ver", "oxr.ver", "oxr.cobrar", "forecast.ver",
    "compras.ver", "capex.ver", "capex.aprovar",
    "aprovacoes.decidir",
    "auditoria.ver", "documentos.ver",
    "relatorios.exportar",
  ],

  financeiro: [
    "dashboard.ver",
    "caixa.*", "dre.*", "oxr.*", "forecast.*", "orcamento.*",
    "compras.ver", "capex.ver",
    "aprovacoes.decidir",
    "periodo.publicar", "auditoria.ver", "documentos.*",
    "config.*", "integracoes.ver",
    "relatorios.exportar",
  ],

  operacao: [
    "dashboard.ver",
    "oxr.ver", "oxr.justificar",
    "compras.ver", "compras.solicitar",
    "capex.ver", "capex.solicitar",
  ],

  compras: [
    "dashboard.ver",
    "compras.*",
    "aprovacoes.decidir",
    "oxr.ver",
  ],

  investidores: [
    "portfolio.ver",
    "dashboard.ver", "dre.ver", "caixa.ver",
    "documentos.ver",
    // sem pipeline, sem export, sem operações — leitura governada
  ],
};

/** Capacidades sensíveis que investidores/convidados nunca recebem, mesmo por wildcard futuro. */
export const RESTRICTED_FROM_GUESTS: CapabilityPattern[] = ["pipeline.*", "relatorios.exportar", "config.*", "usuarios.*"];

export function matchCapability(pattern: CapabilityPattern, capability: string): boolean {
  if (pattern === "*") return true;
  if (pattern.endsWith(".*")) return capability.startsWith(pattern.slice(0, -1));
  return pattern === capability;
}
