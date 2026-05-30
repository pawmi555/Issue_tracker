export const PROJECT_ROLE_NAMES = [
  "OWNER",
  "MANAGER",
  "MEMBER",
  "VIEWER",
] as const;

export const ISSUE_READ_ROLES = ["OWNER", "MANAGER", "MEMBER"] as const;

export type ProjectRoleName = (typeof PROJECT_ROLE_NAMES)[number];

type CheckProjectRoleInput = {
  memberRole: ProjectRoleName;
  allowedRoles: readonly ProjectRoleName[];
};

export const checkProjectRole = ({
  memberRole,
  allowedRoles,
}: CheckProjectRoleInput): boolean => {
  return allowedRoles.includes(memberRole);
};

export const isProjectRoleName = (role: string): role is ProjectRoleName => {
  return PROJECT_ROLE_NAMES.includes(role as ProjectRoleName);
};
