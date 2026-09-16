import type { ExecutiveRole } from "@/lib/constants";
import type { ExecutiveDisplay } from "@/lib/members/executive-display";

export type ExecutiveBoardColumn = {
  main: ExecutiveDisplay;
  adjunct: ExecutiveDisplay;
};

export type ExecutiveBoardLayout = {
  leadership: [ExecutiveDisplay, ExecutiveDisplay];
  columns: [ExecutiveBoardColumn, ExecutiveBoardColumn, ExecutiveBoardColumn];
};

const LEADERSHIP_ROLES: [ExecutiveRole, ExecutiveRole] = [
  "presidente",
  "vice_presidente",
];

const OFFICER_COLUMNS: Array<{
  main: ExecutiveRole;
  adjunct: ExecutiveRole;
}> = [
  { main: "secretario", adjunct: "secretario_adjunto" },
  { main: "tesoureiro", adjunct: "tesoureiro_adjunto" },
  {
    main: "secretario_assistencia_social",
    adjunct: "secretario_assistencia_social_adjunto",
  },
];

function requireRole(
  byRole: Map<ExecutiveRole, ExecutiveDisplay>,
  role: ExecutiveRole,
): ExecutiveDisplay {
  const member = byRole.get(role);

  if (!member) {
    throw new Error(`Cargo executivo ausente no board público: ${role}`);
  }

  return member;
}

export function buildExecutiveBoardLayout(
  members: ExecutiveDisplay[],
): ExecutiveBoardLayout {
  const byRole = new Map(members.map((member) => [member.role, member]));

  return {
    leadership: [
      requireRole(byRole, LEADERSHIP_ROLES[0]),
      requireRole(byRole, LEADERSHIP_ROLES[1]),
    ],
    columns: OFFICER_COLUMNS.map((column) => ({
      main: requireRole(byRole, column.main),
      adjunct: requireRole(byRole, column.adjunct),
    })) as ExecutiveBoardLayout["columns"],
  };
}

export function canBuildExecutiveBoardLayout(
  members: ExecutiveDisplay[],
): boolean {
  if (members.length === 0) return false;

  const byRole = new Map(members.map((member) => [member.role, member]));

  return (
    LEADERSHIP_ROLES.every((role) => byRole.has(role)) &&
    OFFICER_COLUMNS.every(
      (column) => byRole.has(column.main) && byRole.has(column.adjunct),
    )
  );
}
