import { AppError } from "./app-error.js";

/**
 * システムで利用可能なプロジェクトロール一覧
 */
export const PROJECT_ROLE_NAMES = [
  "OWNER",
  "MANAGER",
  "MEMBER",
  "VIEWER",
] as const;

/**
 * プロジェクトロールの権限レベル
 */
const PROJECT_ROLE_LEVEL: Record<ProjectRoleName, number> = {
  VIEWER: 1,
  MEMBER: 2,
  MANAGER: 3,
  OWNER: 4,
} as const;

/**
 * 指定された最低ロール以上か判定
 */
export const hasProjectRole = ({
  memberRole,
  minimumRole,
}: {
  memberRole: ProjectRoleName;
  minimumRole: ProjectRoleName;
}) => {
  return PROJECT_ROLE_LEVEL[memberRole] >= PROJECT_ROLE_LEVEL[minimumRole];
};

/**
 * 利用可能なプロジェクトロールを表すUnion型
 */
export type ProjectRoleName = (typeof PROJECT_ROLE_NAMES)[number];

/**
 * 指定された文字列が有効なプロジェクトロールか判定する型ガード関数
 */
export const isProjectRoleName = (role: string): role is ProjectRoleName => {
  return PROJECT_ROLE_NAMES.includes(role as ProjectRoleName);
};

/**
 * 指定された最低ロール以上であることを検証し、満たさない場合は例外を送出する
 */
export const assertProjectRole = ({
  memberRole,
  minimumRole,
}: {
  memberRole?: ProjectRoleName;
  minimumRole: ProjectRoleName;
}) => {
  if (
    !memberRole ||
    !hasProjectRole({
      memberRole,
      minimumRole,
    })
  ) {
    throw new AppError("PROJECT_FORBIDDEN", 403, "project forbidden");
  }
};
