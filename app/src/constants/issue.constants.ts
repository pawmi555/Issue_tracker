export const ISSUE_SORT_FIELDS = ["createdAt", "dueDate"] as const;

export const ISSUE_INCLUDE_FIELDS = [
  "assignee",
  "reporter",
  "comments",
] as const;
