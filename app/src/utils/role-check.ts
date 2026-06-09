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
 * Issue閲覧を許可するプロジェクトロール一覧
 */
export const ISSUE_READ_ROLES = ["OWNER", "MANAGER", "MEMBER"] as const;

/**
 * プロジェクトロールの権限レベル
 */
const PROJECT_ROLE_LEVEL = {
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

type CheckProjectRoleInput = {
  memberRole: ProjectRoleName;
  allowedRoles: readonly ProjectRoleName[];
};

/**
 * ユーザーのロールが許可ロール一覧に含まれているか判定する
 */
export const checkProjectRole = ({
  memberRole,
  allowedRoles,
}: CheckProjectRoleInput): boolean => {
  return allowedRoles.includes(memberRole);
};

/**
 * 指定された文字列が有効なプロジェクトロールか判定する型ガード関数
 */
export const isProjectRoleName = (role: string): role is ProjectRoleName => {
  return PROJECT_ROLE_NAMES.includes(role as ProjectRoleName);
};
