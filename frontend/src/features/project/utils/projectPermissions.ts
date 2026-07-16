import type { Project, ProjectRoleName } from "../types/project.types";

const roleLevels: Record<ProjectRoleName, number> = {
  VIEWER: 1,
  MEMBER: 2,
  MANAGER: 3,
  OWNER: 4,
};

export const getProjectRole = (
  project: Project,
  userId: number,
): ProjectRoleName | null => {
  const member = project.members.find(({ user }) => user.id === userId);

  return member?.role.name ?? null;
};

export const hasProjectRole = (
  currentRole: ProjectRoleName | null,
  requiredRole: ProjectRoleName,
): boolean => {
  if (!currentRole) {
    return false;
  }

  return roleLevels[currentRole] >= roleLevels[requiredRole];
};
