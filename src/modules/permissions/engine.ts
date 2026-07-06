/**
 * PERMISSION ENGINE — o ÚNICO ponto de decisão de acesso do front.
 * Avalia: papel → permissão (capability c/ wildcard) → empresa → escopo (CC).
 * Toda resposta carrega o motivo (exibível no estado mascarado do widget).
 */
import { matchCapability, ROLE_POLICIES, RESTRICTED_FROM_GUESTS } from "./policies";
import type { AccessDecision, AccessRequest, Principal, RoleAssignment } from "./types";

function assignmentCoversCompany(a: RoleAssignment, company?: string): boolean {
  if (!company) return true;                 // recurso de tenant
  if (a.companies === "*") return true;
  return a.companies.includes(company);
}

function assignmentCoversCostCenter(a: RoleAssignment, costCenter?: string): boolean {
  if (!costCenter || !a.costCenters) return true;
  if (a.costCenters === "*") return true;
  return a.costCenters.includes(costCenter);
}

function guestBlocked(role: string, capability: string): boolean {
  return role === "investidores" && RESTRICTED_FROM_GUESTS.some((p) => matchCapability(p, capability));
}

export function evaluate(principal: Principal, request: AccessRequest): AccessDecision {
  for (const a of principal.assignments) {
    if (guestBlocked(a.role, request.capability)) continue;

    const grantsCapability = ROLE_POLICIES[a.role]?.some((p) => matchCapability(p, request.capability));
    if (!grantsCapability) continue;

    if (!assignmentCoversCompany(a, request.company)) continue;
    if (!assignmentCoversCostCenter(a, request.costCenter)) continue;

    return {
      allowed: true,
      reason: "ok",
      grantedBy: {
        role: a.role,
        scope: a.companies === "*" ? "todas as empresas" : a.companies.join(", "),
      },
    };
  }

  /* Negado — motivo específico (sem vazar estrutura além do necessário) */
  const hasCapabilitySomewhere = principal.assignments.some(
    (a) => ROLE_POLICIES[a.role]?.some((p) => matchCapability(p, request.capability)) && !guestBlocked(a.role, request.capability)
  );
  if (hasCapabilitySomewhere && request.company) {
    return { allowed: false, reason: `Seu acesso não inclui esta empresa` };
  }
  if (hasCapabilitySomewhere && request.costCenter) {
    return { allowed: false, reason: `Fora do seu escopo de centro de custo` };
  }
  return { allowed: false, reason: "Seu papel não tem acesso a este conteúdo" };
}

/* ── Principal vigente (adaptador mock; E5: derivado do GET /me) ──── */

let currentPrincipal: Principal = {
  userId: "u-1",
  name: "Mauro Barros",
  assignments: [{ role: "holding", companies: "*" }],
};

export function setPrincipal(p: Principal) {
  currentPrincipal = p;
}

export function getPrincipal(): Principal {
  return currentPrincipal;
}

/** API central de autorização — a única função que a aplicação chama. */
export function authorize(request: AccessRequest): AccessDecision {
  return evaluate(currentPrincipal, request);
}
