/**
 * Issue一覧取得で使用可能なソート項目
 */
export const ISSUE_SORT_FIELDS = ["createdAt", "dueDate"] as const;

/**
 * Issue履歴で使用する変更項目
 */
export const ISSUE_HISTORY_FIELDS = {
  DELETED: "deleted",
} as const;

/**
 * Issue取得時にinclude可能な関連データ
 */
export const ISSUE_INCLUDE_FIELDS = [
  "assignee",
  "reporter",
  "comments",
] as const;

export type IssueSortField = (typeof ISSUE_SORT_FIELDS)[number];
