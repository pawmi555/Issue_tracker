import { HistoryField } from "@prisma/client";

type IssueBefore = {
  title: string;
  description: string | null;
  statusId: number;
  priorityId: number;
  assigneeId: number | null;
  dueDate: Date | null;
};

type IssueUpdateInput = Partial<IssueBefore>;

export const buildIssueHistories = ({
  before,
  after,
  issueId,
  userId,
  actionId,
}: {
  before: IssueBefore;
  after: IssueUpdateInput;
  issueId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [
    ["title", "TITLE"],
    ["description", "DESCRIPTION"],
    ["statusId", "STATUS_ID"],
    ["priorityId", "PRIORITY_ID"],
    ["assigneeId", "ASSIGNEE_ID"],
    ["dueDate", "DUE_DATE"],
  ] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    rows.push({
      issueId,
      userId,
      actionId,
      fieldName: field as HistoryField,
      oldValue,
      newValue,
    });
  }

  return rows;
};
