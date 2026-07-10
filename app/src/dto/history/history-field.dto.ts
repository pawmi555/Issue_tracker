/**
 * 変更対象フィールド
 *
 * 内部で使用する HistoryField は公開せず、
 * APIでは公開用フィールド名へ変換して返却する。
 */
export type HistoryFieldDto =
  | "name"
  | "email"
  | "role"
  | "project"
  | "description"
  | "title"
  | "status"
  | "priority"
  | "assignee"
  | "dueDate"
  | "deletedAt"
  | "content";
