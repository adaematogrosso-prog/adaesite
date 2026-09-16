import type { ExecutiveRole } from "@/lib/constants";

export const SECRETARIA_ROLES: ExecutiveRole[] = [
  "presidente",
  "vice_presidente",
  "secretario",
  "secretario_adjunto",
];

export const TESOURARIA_ROLES: ExecutiveRole[] = [
  "presidente",
  "vice_presidente",
  "tesoureiro",
  "tesoureiro_adjunto",
];

export function executiveRoleHasSecretariaAccess(
  role: ExecutiveRole | undefined,
) {
  return !!role && SECRETARIA_ROLES.includes(role);
}

export function executiveRoleHasTesourariaAccess(
  role: ExecutiveRole | undefined,
) {
  return !!role && TESOURARIA_ROLES.includes(role);
}
