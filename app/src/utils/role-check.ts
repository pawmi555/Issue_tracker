export const PROJECT_ROLE_NAMES = [
  "OWNER",
  "MANAGER",
  "MEMBER",
  "VIEWER",
] as const;

export type ProjectRoleName = (typeof PROJECT_ROLE_NAMES)[number];

type CheckProjectRoleInput = {
  memberRole: ProjectRoleName;

  allowedRoles: ProjectRoleName[];
};

export const checkProjectRole = ({
  memberRole,
  allowedRoles,
}: CheckProjectRoleInput): boolean => {
  return allowedRoles.includes(memberRole);
};
