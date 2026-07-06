/**
 * @modules/permissions — PERMISSION ENGINE (ADR-021).
 * Autorização centralizada: papel × permissão × empresa × escopo,
 * com decisão explicada. UI esconde, backend nega (P-E4).
 */
export { authorize, evaluate, getPrincipal, setPrincipal } from "./engine";
export { ROLE_POLICIES, matchCapability } from "./policies";
export type {
  AccessDecision, AccessRequest, CapabilityPattern, Principal, Role, RoleAssignment,
} from "./types";

/** Compatibilidade com o contrato anterior (lib/session.can) — delega ao engine. */
import { authorize as _authorize } from "./engine";
export function can(capability: string, company?: string): boolean {
  return _authorize({ capability, company }).allowed;
}
