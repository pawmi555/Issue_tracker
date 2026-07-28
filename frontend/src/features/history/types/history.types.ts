export type HistoryAction = "CREATE" | "UPDATE" | "DELETE" | "RESTORE";

export type HistoryField =
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

export type HistoryValue =
  string | number | boolean | null | Record<string, unknown> | unknown[];

export type HistoryChangedBy = {
  id: number;
  name: string;
};

export type History = {
  action: HistoryAction;
  field: HistoryField;
  oldValue: HistoryValue;
  newValue: HistoryValue;
  changedBy: HistoryChangedBy;
  createdAt: string;
};

export type GetIssueHistoriesParams = {
  issueId: number;
  page?: number;
  limit?: number;
};
