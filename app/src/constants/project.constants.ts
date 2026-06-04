/**
 * プロジェクトメンバーに割り当て可能なロール一覧
 */
export const PROJECT_ROLES = ["OWNER", "MANAGER", "MEMBER", "VIEWER"] as const;

/**
 * Project履歴で使用する変更種別
 *
 * ProjectHistory.fieldName に保存する値として使用する。
 */
export const PROJECT_HISTORY_EVENTS = {
  CREATED: "created",
  NAME: "name",
  DESCRIPTION: "description",
  DELETED: "deleted",
} as const;

/**
 * プロジェクトロール名
 *
 * PROJECT_ROLES から生成されるリテラル型。
 */
export type ProjectRoleName = (typeof PROJECT_ROLES)[number];
