import { HistoryField } from "@prisma/client";

type ProjectBefore = {
  name: string;
  description: string | null;
};

type IssueBefore = {
  title: string;
  description: string | null;
  statusId: number;
  priorityId: number;
  assigneeId: number | null;
  dueDate: Date | null;
};

type CommentBefore = {
  content: string;
};

type ProjectUpdateInput = Partial<ProjectBefore>;
type IssueUpdateInput = Partial<IssueBefore>;
type CommentUpdateInput = Partial<CommentBefore>;

export const buildProjectHistories = ({
  before,
  after,
  projectId,
  userId,
  actionId,
}: {
  before: ProjectBefore;
  after: ProjectUpdateInput;
  projectId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [
    ["name", HistoryField.NAME],
    ["description", HistoryField.DESCRIPTION],
  ] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (oldValue === newValue) {
      continue;
    }

    rows.push({
      projectId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};

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
    ["title", HistoryField.TITLE],
    ["description", HistoryField.DESCRIPTION],
    ["statusId", HistoryField.STATUS_ID],
    ["priorityId", HistoryField.PRIORITY_ID],
    ["assigneeId", HistoryField.ASSIGNEE_ID],
    ["dueDate", HistoryField.DUE_DATE],
  ] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    const isEqual =
      oldValue instanceof Date && newValue instanceof Date
        ? oldValue.getTime() === newValue.getTime()
        : oldValue === newValue;

    if (isEqual) {
      continue;
    }

    rows.push({
      issueId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};

export const buildCommentHistories = ({
  before,
  after,
  commentId,
  userId,
  actionId,
}: {
  before: CommentBefore;
  after: CommentUpdateInput;
  commentId: number;
  userId: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [["content", HistoryField.CONTENT]] as const;

  for (const [key, field] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (oldValue === newValue) {
      continue;
    }

    rows.push({
      commentId,
      userId,
      actionId,
      fieldName: field,
      oldValue,
      newValue,
    });
  }

  return rows;
};
