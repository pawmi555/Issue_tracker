import { HistoryField } from "@prisma/client";

type UserBefore = {
  name: string;
  email: string;
  roleId: number;
};

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

type UserUpdateInput = Partial<UserBefore>;
type ProjectUpdateInput = Partial<ProjectBefore>;
type IssueUpdateInput = Partial<IssueBefore>;
type CommentUpdateInput = Partial<CommentBefore>;

export const buildUserHistories = ({
  before,
  after,
  userId,
  operatedBy,
  actionId,
}: {
  before: UserBefore;
  after: UserUpdateInput;
  userId: number;
  operatedBy: number;
  actionId: number;
}) => {
  const rows = [];

  const mappings = [
    ["name", HistoryField.USER_NAME],
    ["email", HistoryField.USER_EMAIL],
    ["roleId", HistoryField.USER_ROLE],
  ] as const;

  for (const [key, fieldName] of mappings) {
    const oldValue = before[key];
    const newValue = after[key];

    if (newValue === undefined) {
      continue;
    }

    if (oldValue === newValue) {
      continue;
    }

    rows.push({
      userId,
      operatedBy,
      actionId,
      fieldName,
      oldValue,
      newValue,
    });
  }

  return rows;
};

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
    ["name", HistoryField.PROJECT_NAME],
    ["description", HistoryField.PROJECT_DESCRIPTION],
  ] as const;

  for (const [key, fieldName] of mappings) {
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
      fieldName,
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
    ["title", HistoryField.ISSUE_TITLE],
    ["description", HistoryField.ISSUE_DESCRIPTION],
    ["statusId", HistoryField.ISSUE_STATUS_ID],
    ["priorityId", HistoryField.ISSUE_PRIORITY_ID],
    ["assigneeId", HistoryField.ISSUE_ASSIGNEE_ID],
    ["dueDate", HistoryField.ISSUE_DUE_DATE],
  ] as const;

  for (const [key, fieldName] of mappings) {
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
      fieldName,
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

  const mappings = [["content", HistoryField.COMMENT_CONTENT]] as const;

  for (const [key, fieldName] of mappings) {
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
      fieldName,
      oldValue,
      newValue,
    });
  }

  return rows;
};
